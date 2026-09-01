import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Housekeeping that reclaims storage and rows nothing points at any more.
//
// Two distinct leaks, neither of which touches a card a customer can still
// open:
//
//   1. Orphaned files. Removing a photo from a gallery, restyling one, or
//      replacing a track only rewrites the card row — the bytes stayed in
//      Convex storage forever with nothing referencing them. Same for a photo
//      uploaded during a session the sender then abandoned.
//
//   2. Abandoned checkouts. Every "Buy" click inserts a pending_payment row.
//      The ones that never convert are pure litter: no payment, no media (the
//      studio refuses to attach anything to an unpaid card), no customer.
//
// Deliberately NOT here: expiring paid cards. A card is a keepsake, storage is
// a rounding error against revenue, and there is no stored email to warn anyone
// with. See the retention discussion in the README/PRD before adding one.

// A file younger than this is left alone no matter what. Uploads land in
// storage seconds before the mutation that attaches them to a card, so without
// this window a sweep running mid-upload would delete a photo the sender is
// still working on.
const ORPHAN_GRACE_MS = 24 * 60 * 60 * 1000;

// How many storage files one sweep will look at. Keeps a single run inside
// Convex's per-transaction read limits; run it again to continue.
const DEFAULT_SCAN_LIMIT = 500;

interface Referenced {
  urls: Set<string>;
  ids: Set<string>;
}

// Every storage URL and storage id any card still points at.
//
// Media is referenced two different ways depending on its age: newer gallery
// and soundtrack entries carry a URL (and sometimes a storageId), while the
// legacy single-slot fields carry an Id<"_storage">. Both have to be collected
// or the sweep deletes live media.
//
// This intentionally uses .collect() rather than pagination. If the card table
// ever outgrows a single transaction Convex throws, which fails the sweep
// closed — far better than silently building a partial reference set and
// treating live files as orphans.
async function collectReferenced(ctx: {
  db: { query: (t: "cards") => { collect: () => Promise<Doc<"cards">[]> } };
}): Promise<Referenced> {
  const cards = await ctx.db.query("cards").collect();
  const urls = new Set<string>();
  const ids = new Set<string>();

  for (const card of cards) {
    for (const img of card.images ?? []) {
      if (img.url) urls.add(img.url);
      if (img.storageId) ids.add(img.storageId);
    }
    for (const track of card.musicTracks ?? []) {
      if (track.url) urls.add(track.url);
      if (track.storageId) ids.add(track.storageId);
    }
    if (card.imageUrl) urls.add(card.imageUrl);
    if (card.musicUrl) urls.add(card.musicUrl);
    if (card.originalPhotoUrl) urls.add(card.originalPhotoUrl);
    if (card.imageStorageId) ids.add(card.imageStorageId);
    if (card.musicStorageId) ids.add(card.musicStorageId);
    if (card.voiceStorageId) ids.add(card.voiceStorageId);
  }

  return { urls, ids };
}

/**
 * Delete storage files no card references.
 *
 * Defaults to a dry run — pass dryRun: false to actually delete. Returns what
 * it found either way, so the same call can be used to audit before deleting.
 *
 * Note the URL/id asymmetry: a storage file's public URL does not contain its
 * Id<"_storage">, so an orphan can only be identified by resolving each file's
 * URL and checking it against the reference set. That is why this is a sweep
 * rather than an inline delete at the point a photo is removed.
 */
export const sweepOrphanFiles = mutation({
  args: {
    dryRun: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? true;
    const limit = Math.max(1, Math.min(args.limit ?? DEFAULT_SCAN_LIMIT, 2000));

    const { urls, ids } = await collectReferenced(ctx);
    const files = await ctx.db.system.query("_storage").take(limit);

    const now = Date.now();
    let scanned = 0;
    let skippedTooNew = 0;
    let referenced = 0;
    let orphans = 0;
    let bytes = 0;
    const sample: string[] = [];

    for (const file of files) {
      scanned += 1;

      if (now - file._creationTime < ORPHAN_GRACE_MS) {
        skippedTooNew += 1;
        continue;
      }
      if (ids.has(file._id)) {
        referenced += 1;
        continue;
      }

      const url = await ctx.storage.getUrl(file._id);
      if (url && urls.has(url)) {
        referenced += 1;
        continue;
      }

      orphans += 1;
      bytes += file.size ?? 0;
      if (sample.length < 10) sample.push(file._id);

      if (!dryRun) {
        await ctx.storage.delete(file._id as Id<"_storage">);
      }
    }

    return {
      dryRun,
      scanned,
      referenced,
      skippedTooNew,
      orphans,
      megabytes: Number((bytes / 1024 / 1024).toFixed(2)),
      sample,
      // True when there may be more files past this batch.
      more: files.length === limit,
    };
  },
});

/**
 * Delete pending_payment cards older than `olderThanDays` (default 30).
 *
 * These are checkouts that were started and never completed. They hold no media
 * — updateContent and updateGallery both refuse an unpaid card — so there is
 * nothing to reclaim beyond the row itself.
 *
 * Defaults to a dry run. isPaid is re-checked per row as a second guard, so a
 * card whose webhook landed late can never be caught by this even if its status
 * was somehow left stale.
 */
export const pruneAbandonedCheckouts = mutation({
  args: {
    olderThanDays: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const dryRun = args.dryRun ?? true;
    const days = Math.max(1, args.olderThanDays ?? 30);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const pending = await ctx.db
      .query("cards")
      .withIndex("by_status", (q) => q.eq("status", "pending_payment"))
      .collect();

    const stale = pending.filter(
      (card) => !card.isPaid && card.createdAt < cutoff
    );

    if (!dryRun) {
      for (const card of stale) {
        await ctx.db.delete(card._id);
      }
    }

    return {
      dryRun,
      olderThanDays: days,
      pendingTotal: pending.length,
      deleted: stale.length,
      slugs: stale.slice(0, 10).map((c) => c.slug),
    };
  },
});
