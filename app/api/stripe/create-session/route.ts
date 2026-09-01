import { NextRequest, NextResponse } from "next/server";
import { PACKAGES, PackageKey } from "@/lib/constants";
import { createSlug } from "@/lib/slug";
import { ownerModeEnabled, verifyAdminSecret } from "@/lib/owner";
import { resolveBaseUrl } from "@/lib/base-url";

// Any failure here is a lost sale, so every branch returns a message the
// customer can act on and logs the real reason for us.
function fail(code: string, message: string, status: number, detail?: unknown) {
  console.error(`[stripe/create-session] ${code}:`, detail ?? message);
  return NextResponse.json({ error: message, code }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const { packageType, occasion, showWatermark, customOccasionName } =
      await req.json();

    // Validate package
    if (!PACKAGES[packageType as PackageKey]) {
      return fail(
        "invalid_package",
        "That package isn't available. Please pick another one.",
        400,
        packageType
      );
    }

    const pkg = PACKAGES[packageType as PackageKey];
    const slug = createSlug();
    const baseUrl = resolveBaseUrl(req);

    const customParam = customOccasionName
      ? `&customOccasionName=${encodeURIComponent(customOccasionName)}`
      : "";

    // Stripe keys pasted into a hosting dashboard routinely carry a trailing
    // newline or space; Stripe then rejects every request with a 401.
    const secretKey = process.env.STRIPE_SECRET_KEY?.trim();

    // Stripe not configured. Only skip payment when Owner Mode is explicitly on
    // (dev-only). Otherwise fail loudly so a misconfigured production deploy can
    // never hand out free cards through the normal checkout flow.
    if (!secretKey) {
      if (ownerModeEnabled()) {
        return NextResponse.json({
          url: `${baseUrl}/checkout/success?slug=${slug}&occasion=${occasion}&package=${packageType}&watermark=${showWatermark}&dev=true${customParam}`,
        });
      }
      return fail(
        "stripe_not_configured",
        "Payments aren't available right now. Please try again shortly — no charge was made.",
        503,
        "STRIPE_SECRET_KEY is not set on this deployment. Add it in the hosting provider's environment variables and redeploy."
      );
    }

    if (!/^(sk|rk)_(test|live)_/.test(secretKey)) {
      return fail(
        "stripe_key_malformed",
        "Payments aren't available right now. Please try again shortly — no charge was made.",
        503,
        "STRIPE_SECRET_KEY does not look like a Stripe secret key (expected sk_live_… / sk_test_…). A publishable key (pk_…) will not work here."
      );
    }

    // Dynamic import to avoid errors when stripe key not set
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secretKey, {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Cardlar - ${pkg.name}`,
              description: pkg.description,
            },
            unit_amount: pkg.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&slug=${slug}&occasion=${occasion}&package=${packageType}&watermark=${showWatermark}${customParam}`,
      cancel_url: `${baseUrl}/checkout/cancel?occasion=${occasion}`,
      metadata: {
        slug,
        occasion,
        packageType,
        showWatermark: String(showWatermark),
        ...(customOccasionName ? { customOccasionName } : {}),
      },
    });

    if (!session.url) {
      return fail(
        "stripe_no_url",
        "We couldn't open the payment page. Please try again — no charge was made.",
        502,
        `Stripe returned session ${session.id} with no url`
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Surface Stripe's own reason in the logs — "Invalid API Key",
    // "account cannot create live charges", etc. — instead of a bare 500.
    const err = error as { type?: string; code?: string; message?: string };
    return fail(
      "stripe_error",
      "We couldn't start checkout. Please try again — no charge was made.",
      500,
      `${err?.type ?? "Error"}${err?.code ? ` (${err.code})` : ""}: ${
        err?.message ?? String(error)
      }`
    );
  }
}

// Owner-only config check, so a broken deploy can be diagnosed without reading
// hosting logs:  curl -H "x-admin-secret: <ADMIN_SECRET>" https://<site>/api/stripe/create-session
// Returns no secret material — only whether the keys are present and usable.
export async function GET(req: NextRequest) {
  if (!verifyAdminSecret(req.headers.get("x-admin-secret"))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  const mode = secretKey?.startsWith("sk_live_")
    ? "live"
    : secretKey?.startsWith("sk_test_")
      ? "test"
      : null;

  let stripeReachable: boolean | null = null;
  let stripeError: string | null = null;
  if (secretKey) {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(secretKey, { apiVersion: "2025-08-27.basil" });
      await stripe.balance.retrieve();
      stripeReachable = true;
    } catch (error) {
      stripeReachable = false;
      stripeError = (error as { message?: string })?.message ?? String(error);
    }
  }

  return NextResponse.json({
    secretKeySet: Boolean(secretKey),
    secretKeyMode: mode,
    secretKeyHadWhitespace: Boolean(
      process.env.STRIPE_SECRET_KEY &&
        process.env.STRIPE_SECRET_KEY !== process.env.STRIPE_SECRET_KEY.trim()
    ),
    publishableKeySet: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    webhookSecretSet: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    appUrlSet: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    baseUrl: resolveBaseUrl(req),
    stripeReachable,
    stripeError,
  });
}
