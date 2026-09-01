import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Kept in sync with MAX_IMAGE_REGENERATIONS in lib/constants.ts. Duplicated
// here because Convex functions run in a separate module graph.
const MAX_IMAGE_REGENERATIONS = 3;

// Create a new card (called when starting the checkout flow)
export const create = mutation({
  args: {
    slug: v.string(),
    occasion: v.string(),
    packageType: v.string(),
    showWatermark: v.boolean(),
    stripeSessionId: v.optional(v.string()),
    customOccasionName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Idempotent on slug. This runs from a useEffect on /checkout/success, so
    // it fires again on every refresh, back-navigation and StrictMode double
    // invoke. Without this guard each of those inserted another row for the
    // same slug — and because getBySlug and markPaid both use .first(), the
    // webhook could mark one duplicate paid while the studio and viewer read
    // the other and treat a paid card as unpaid.
    const existing = await ctx.db
      .query("cards")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) return existing._id;

    const cardId = await ctx.db.insert("cards", {
      slug: args.slug,
      occasion: args.occasion,
      recipientName: "",
      senderName: "",
      messageText: "",
      imageRegenCount: 0,
      packageType: args.packageType,
      showWatermark: args.showWatermark,
      stripeSessionId: args.stripeSessionId,
      ...(args.customOccasionName ? { customOccasionName: args.customOccasionName } : {}),
      isPaid: false,
      viewCount: 0,
      status: "pending_payment",
      createdAt: Date.now(),
    });
    return cardId;
  },
});

// Mark card as paid (called from Stripe webhook)
export const markPaid = mutation({
  args: {
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("cards")
      .withIndex("by_stripeSessionId", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .first();

    if (!card) throw new Error("Card not found");

    const now = Date.now();

    await ctx.db.patch(card._id, {
      isPaid: true,
      status: "creating",
      paidAt: now,
      paidVia: card.paidVia ?? "stripe",
    });

    return card.slug;
  },
});

// Owner Mode: create a card that is already paid, bypassing Stripe.
// Authorization happens in the API route (OWNER_MODE / ADMIN_SECRET) before
// this runs — this mutation only records the result.
export const ownerCreate = mutation({
  args: {
    slug: v.string(),
    occasion: v.string(),
    packageType: v.string(),
    showWatermark: v.boolean(),
    source: v.string(), // "owner" | "admin"
    customOccasionName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.insert("cards", {
      slug: args.slug,
      occasion: args.occasion,
      recipientName: "",
      senderName: "",
      messageText: "",
      imageRegenCount: 0,
      packageType: args.packageType,
      showWatermark: args.showWatermark,
      stripeSessionId: `owner_${args.slug}`,
      ...(args.customOccasionName
        ? { customOccasionName: args.customOccasionName }
        : {}),
      isPaid: true,
      paidVia: args.source,
      viewCount: 0,
      status: "creating",
      createdAt: now,
      paidAt: now,
    });
    return args.slug;
  },
});

// Get card by slug (public - for viewing)
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cards")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Get card by stripe session ID
export const getByStripeSession = query({
  args: { stripeSessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cards")
      .withIndex("by_stripeSessionId", (q) =>
        q.eq("stripeSessionId", args.stripeSessionId)
      )
      .first();
  },
});

// Update card content (during creation studio)
export const updateContent = mutation({
  args: {
    slug: v.string(),
    recipientName: v.optional(v.string()),
    senderName: v.optional(v.string()),
    messageText: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    imagePrompt: v.optional(v.string()),
    originalPhotoUrl: v.optional(v.string()),
    imageStyle: v.optional(v.string()),
    voiceStorageId: v.optional(v.id("_storage")),
    musicUrl: v.optional(v.string()),
    musicStorageId: v.optional(v.id("_storage")),
    musicPrompt: v.optional(v.string()),
    theme: v.optional(v.string()),
    fontFamily: v.optional(v.string()),
    particleEffect: v.optional(v.string()),
    messageStyle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("cards")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!card) throw new Error("Card not found");
    if (!card.isPaid) throw new Error("Card is not paid");

    const { slug, ...updates } = args;
    // Remove undefined values
    const cleanUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value;
      }
    }

    await ctx.db.patch(card._id, cleanUpdates);
  },
});

// Update the Memory Lane gallery (ordered list of moments). Slot 0 is mirrored
// into imageUrl so the cover keeps flowing to previews / OG images / older code.
export const updateGallery = mutation({
  args: {
    slug: v.string(),
    images: v.array(
      v.object({
        url: v.string(),
        storageId: v.optional(v.id("_storage")),
        caption: v.optional(v.string()),
        dateLabel: v.optional(v.string()),
        source: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("cards")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!card) throw new Error("Card not found");
    if (!card.isPaid) throw new Error("Card is not paid");

    await ctx.db.patch(card._id, {
      images: args.images,
      imageUrl: args.images[0]?.url ?? card.imageUrl,
    });
  },
});

// Update the soundtrack (ordered list of up to 5 tracks). Track 0 mirrors into
// musicUrl for back-compat. Keep the cap in step with MAX_SOUNDTRACK_TRACKS in
// lib/media.ts — convex can't import from lib, so it is spelled out here.
export const updateSoundtrack = mutation({
  args: {
    slug: v.string(),
    tracks: v.array(
      v.object({
        url: v.string(),
        storageId: v.optional(v.id("_storage")),
        prompt: v.optional(v.string()),
        title: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("cards")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!card) throw new Error("Card not found");
    if (!card.isPaid) throw new Error("Card is not paid");

    const tracks = args.tracks.slice(0, 5);
    await ctx.db.patch(card._id, {
      musicTracks: tracks,
      musicUrl: tracks[0]?.url ?? card.musicUrl,
    });
  },
});

// Increment image regen count
export const incrementImageRegen = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("cards")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!card) throw new Error("Card not found");

    // Owner/admin cards regenerate without limit.
    const isOwner = card.paidVia === "owner" || card.paidVia === "admin";
    if (!isOwner && card.imageRegenCount >= MAX_IMAGE_REGENERATIONS)
      throw new Error("Maximum image regenerations reached");

    await ctx.db.patch(card._id, {
      imageRegenCount: card.imageRegenCount + 1,
    });

    return card.imageRegenCount + 1;
  },
});

// Mark card as ready (after creation is complete)
export const markReady = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("cards")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!card) throw new Error("Card not found");

    await ctx.db.patch(card._id, { status: "ready" });
  },
});

// Increment view count (when recipient opens the card)
export const incrementViewCount = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("cards")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!card) throw new Error("Card not found");

    const updates: Record<string, unknown> = {
      viewCount: card.viewCount + 1,
    };

    if (!card.firstViewedAt) {
      updates.firstViewedAt = Date.now();
    }

    await ctx.db.patch(card._id, updates);
  },
});

// Permanently delete a card and every file it owns.
//
// This is the mechanism behind a GDPR erasure request. There is deliberately no
// self-service version: cards have no accounts, so anyone holding the share
// link would be able to delete a card they merely received. Authorization
// happens in the API route (ADMIN_SECRET) before this runs.
//
// Gallery and soundtrack entries usually store only a URL, and a storage file's
// public URL does not contain its Id<"_storage">, so the ids have to be
// recovered by resolving each file's URL. That scan is why this is an
// admin-rate operation rather than something called routinely — cleanup.ts
// sweeps orphans in bulk instead.
export const deleteCard = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("cards")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!card) return { deleted: false, filesDeleted: 0 };

    // Ids we already hold directly.
    const storageIds = new Set<Id<"_storage">>();
    if (card.imageStorageId) storageIds.add(card.imageStorageId);
    if (card.musicStorageId) storageIds.add(card.musicStorageId);
    if (card.voiceStorageId) storageIds.add(card.voiceStorageId);
    for (const img of card.images ?? []) {
      if (img.storageId) storageIds.add(img.storageId);
    }
    for (const track of card.musicTracks ?? []) {
      if (track.storageId) storageIds.add(track.storageId);
    }

    // URLs whose id we still need to find.
    const urls = new Set<string>();
    for (const img of card.images ?? []) if (img.url) urls.add(img.url);
    for (const t of card.musicTracks ?? []) if (t.url) urls.add(t.url);
    if (card.imageUrl) urls.add(card.imageUrl);
    if (card.musicUrl) urls.add(card.musicUrl);
    if (card.originalPhotoUrl) urls.add(card.originalPhotoUrl);

    if (urls.size > 0) {
      for (const file of await ctx.db.system.query("_storage").collect()) {
        const url = await ctx.storage.getUrl(file._id);
        if (url && urls.has(url)) storageIds.add(file._id);
      }
    }

    let filesDeleted = 0;
    for (const id of storageIds) {
      try {
        await ctx.storage.delete(id);
        filesDeleted += 1;
      } catch {
        // Already gone (or shared with another card that removed it first).
        // Deleting the row is what matters; a stray file is swept later.
      }
    }

    await ctx.db.delete(card._id);
    return { deleted: true, filesDeleted };
  },
});
