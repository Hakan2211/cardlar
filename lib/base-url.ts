import type { NextRequest } from "next/server";

/**
 * Absolute origin to build redirect URLs from (Stripe success/cancel, share
 * links). Order matters:
 *
 *   1. NEXT_PUBLIC_APP_URL — the canonical domain, when configured.
 *   2. The incoming request's own host — correct on any Vercel deploy
 *      (production, preview) even when nothing is configured.
 *   3. VERCEL_URL — the per-deployment host, as a last resort.
 *   4. localhost — local dev only.
 *
 * Never fall through to localhost on a deployed site: a checkout that succeeds
 * and then redirects the customer to http://localhost:3000 is a lost sale.
 */
export function resolveBaseUrl(req?: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  if (req) {
    const origin = req.headers.get("origin");
    if (origin && /^https?:\/\//.test(origin)) return origin.replace(/\/+$/, "");

    const host =
      req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (host) {
      const proto =
        req.headers.get("x-forwarded-proto") ??
        (host.startsWith("localhost") ? "http" : "https");
      return `${proto}://${host}`;
    }
  }

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return "http://localhost:3000";
}
