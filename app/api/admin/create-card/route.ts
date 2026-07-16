import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { PACKAGES, PackageKey } from "@/lib/constants";
import { createSlug } from "@/lib/slug";
import { authorizeOwner } from "@/lib/owner";

// Owner-only free card creation. Authorized by OWNER_MODE (dev) or a correct
// ADMIN_SECRET (works in production). The resulting card is already paid and
// behaves exactly like a Stripe-purchased one — same studio, same share link.
export async function POST(req: NextRequest) {
  try {
    const {
      packageType,
      occasion,
      showWatermark,
      customOccasionName,
      adminSecret,
    } = await req.json();

    const auth = authorizeOwner(adminSecret);
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!PACKAGES[packageType as PackageKey]) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json(
        { error: "Convex is not configured" },
        { status: 500 }
      );
    }

    const slug = createSlug();
    const client = new ConvexHttpClient(convexUrl);
    await client.mutation(api.cards.ownerCreate, {
      slug,
      occasion: occasion || "birthday",
      packageType,
      showWatermark: showWatermark ?? false,
      source: auth.source!,
      ...(customOccasionName ? { customOccasionName } : {}),
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.json({ slug, url: `${baseUrl}/studio/${slug}` });
  } catch (error) {
    console.error("Admin create-card error:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}
