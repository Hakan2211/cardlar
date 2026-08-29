import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

// Update the soundtrack (ordered list of up to 4 tracks). Track 0 mirrors into
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

    const tracks = args.tracks.slice(0, 4);
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
