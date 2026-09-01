import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { verifyAdminSecret } from "@/lib/owner";

// Erasure endpoint: permanently removes a card and every file it owns.
//
// Admin-only, and deliberately not self-service. Cards have no accounts and no
// login — the share link is the only credential — so a "delete my card" button
// reachable with the slug alone would let any recipient destroy a card they
// were merely sent. Until there are accounts, erasure requests are actioned
// here by the owner.
//
// Note this checks ADMIN_SECRET rather than authorizeOwner: OWNER_MODE opens a
// door for convenience in dev, and that is not a door deletion should have.
//
//   curl -X POST https://<site>/api/admin/delete-card \
//     -H "Content-Type: application/json" \
//     -d '{"slug":"abc123","adminSecret":"...","confirm":"abc123"}'
export async function POST(req: NextRequest) {
  try {
    const { slug, adminSecret, confirm } = await req.json();

    if (!verifyAdminSecret(adminSecret)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    // Echoing the slug back is a cheap guard against deleting the wrong card
    // from a mistyped or copy-pasted command. This is irreversible.
    if (confirm !== slug) {
      return NextResponse.json(
        { error: "confirm must repeat the slug exactly" },
        { status: 400 }
      );
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json(
        { error: "Convex is not configured" },
        { status: 500 }
      );
    }

    const client = new ConvexHttpClient(convexUrl);
    const result = await client.mutation(api.cards.deleteCard, { slug });

    if (!result.deleted) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({
      deleted: true,
      slug,
      filesDeleted: result.filesDeleted,
    });
  } catch (error) {
    console.error("Admin delete-card error:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}
