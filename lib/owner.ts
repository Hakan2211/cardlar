import { timingSafeEqual } from "crypto";

// Owner Mode lets the developer/owner create fully-unlocked cards without
// paying. Two independent doors:
//
//   OWNER_MODE=true   — dev-only (ignored in production). Zero-friction free
//                       creation while building locally.
//   ADMIN_SECRET=...  — honored everywhere, including production. Lets the
//                       owner mint a real, shareable card on the live site by
//                       presenting the secret.
//
// Keep both server-only. Never expose ADMIN_SECRET to the client.

export function ownerModeEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" && process.env.OWNER_MODE === "true"
  );
}

export function verifyAdminSecret(provided: string | undefined | null): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !provided) return false;

  const a = Buffer.from(secret);
  const b = Buffer.from(provided);
  // timingSafeEqual throws on length mismatch, so guard first.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// True when the request is allowed to create a free card. `source` reports
// which door opened, so we can record it on the card (paidVia).
export function authorizeOwner(providedSecret?: string | null): {
  ok: boolean;
  source: "owner" | "admin" | null;
} {
  if (verifyAdminSecret(providedSecret)) return { ok: true, source: "admin" };
  if (ownerModeEnabled()) return { ok: true, source: "owner" };
  return { ok: false, source: null };
}
