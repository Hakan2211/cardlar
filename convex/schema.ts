import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cards: defineTable({
    slug: v.string(),
    occasion: v.string(),
    recipientName: v.string(),
    senderName: v.string(),
    messageText: v.string(),

    // Image (single — legacy/cover). Kept populated as the cover for
    // back-compat (OG image, previews, single-image cards).
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    imagePrompt: v.optional(v.string()),
    imageRegenCount: v.number(),
    originalPhotoUrl: v.optional(v.string()), // user's uploaded photo before AI transform
    imageStyle: v.optional(v.string()), // style preset used (e.g. "polaroid", "watercolor")

    // Gallery — "Memory Lane" timeline of moments (slot 0 is the cover).
    // Optional so existing single-image cards keep working.
    images: v.optional(
      v.array(
        v.object({
          url: v.string(),
          storageId: v.optional(v.id("_storage")),
          caption: v.optional(v.string()),
          dateLabel: v.optional(v.string()), // free text e.g. "Summer 2019"
          source: v.optional(v.string()), // upload | generated | edited
        })
      )
    ),

    // Voice
    voiceStorageId: v.optional(v.id("_storage")),

    // Music (single — legacy/first track). Kept populated as track 0.
    musicUrl: v.optional(v.string()),
    musicStorageId: v.optional(v.id("_storage")),
    musicPrompt: v.optional(v.string()),

    // Soundtrack — up to 5 tracks played in sequence. Optional for back-compat.
    musicTracks: v.optional(
      v.array(
        v.object({
          url: v.string(),
          storageId: v.optional(v.id("_storage")),
          prompt: v.optional(v.string()),
          title: v.optional(v.string()),
        })
      )
    ),

    // Custom occasion
    customOccasionName: v.optional(v.string()), // user-typed name when occasion === "custom"

    // Package & Payment
    packageType: v.string(), // basic | voice | music | full | story
    showWatermark: v.boolean(),
    stripeSessionId: v.optional(v.string()),
    isPaid: v.boolean(),
    paidVia: v.optional(v.string()), // stripe | owner | admin

    // Viewing
    viewCount: v.number(),
    firstViewedAt: v.optional(v.number()),

    // Customization
    theme: v.optional(v.string()),
    fontFamily: v.optional(v.string()),
    particleEffect: v.optional(v.string()),
    messageStyle: v.optional(v.string()), // "fade-words" (default) | "handwritten"

    // Status & Dates
    status: v.string(), // pending_payment | creating | ready | expired
    createdAt: v.number(),
    paidAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_stripeSessionId", ["stripeSessionId"])
    .index("by_status", ["status"]),

  occasions: defineTable({
    name: v.string(),
    slug: v.string(),
    icon: v.string(),
    description: v.string(),
    defaultParticles: v.string(),
    defaultMusicPrompt: v.string(),
    suggestedImagePrompts: v.array(v.string()),
    colorScheme: v.object({
      primary: v.string(),
      secondary: v.string(),
      accent: v.string(),
      background: v.string(),
    }),
    isActive: v.boolean(),
    sortOrder: v.number(),
  }).index("by_slug", ["slug"]),
});
