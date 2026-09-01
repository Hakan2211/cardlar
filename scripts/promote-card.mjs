// Promote a card from the dev Convex deployment to production.
//
// The PRD (A3) calls this out as the escape hatch for the case where a card
// built locally turns out to be the real thing: the row plus every storage
// file is copied to prod so the card is self-contained there, and the result
// is indistinguishable from one created on the live site.
//
//   node scripts/promote-card.mjs <slug> [--dry]
//
// Assets are re-uploaded to prod storage rather than linked, so nothing keeps
// pointing at the dev deployment (which is not reachable by recipients).

import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

const DEV_URL = "https://quaint-mouse-314.eu-west-1.convex.cloud";
const PROD_URL = "https://artful-seal-643.eu-west-1.convex.cloud";

const slug = process.argv[2];
const dryRun = process.argv.includes("--dry");

if (!slug) {
  console.error("usage: node scripts/promote-card.mjs <slug> [--dry]");
  process.exit(1);
}

const dev = new ConvexHttpClient(DEV_URL);
const prod = new ConvexHttpClient(PROD_URL);

// Same source file copied twice (e.g. cover mirrored into images[0]) should
// only cost one upload.
const uploaded = new Map();

async function copyAsset(url, label) {
  if (!url) return null;
  if (uploaded.has(url)) return uploaded.get(url);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed (${res.status}) for ${label}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  const contentType =
    res.headers.get("content-type") || "application/octet-stream";

  const uploadUrl = await prod.mutation(anyApi.files.generateUploadUrl, {});
  const put = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: bytes,
  });
  if (!put.ok) throw new Error(`upload failed (${put.status}) for ${label}`);

  const { storageId } = await put.json();
  const newUrl = await prod.mutation(anyApi.files.getFileUrlMutation, {
    storageId,
  });

  const result = { storageId, url: newUrl };
  uploaded.set(url, result);
  console.log(
    `  copied ${label} — ${(bytes.length / 1024 / 1024).toFixed(2)} MB`
  );
  return result;
}

const card = await dev.query(anyApi.cards.getBySlug, { slug });
if (!card) {
  console.error(`No card with slug "${slug}" on dev.`);
  process.exit(1);
}

console.log(
  `Card "${slug}" — ${card.recipientName || "(no recipient)"} / ` +
    `${card.occasion} / ${card.packageType} / ${card.status}`
);
console.log(
  `  ${card.images?.length ?? 0} image(s), ` +
    `${card.musicTracks?.length ?? 0} track(s), ` +
    `voice: ${card.voiceStorageId ? "yes" : "no"}`
);

if (dryRun) {
  console.log("\n--dry: nothing written to production.");
  process.exit(0);
}

const clash = await prod.query(anyApi.cards.getBySlug, { slug });
if (clash) {
  console.error(`\nA card with slug "${slug}" already exists on prod. Aborting.`);
  process.exit(1);
}

console.log("\nCopying assets to production storage...");

const images = [];
for (const [i, img] of (card.images ?? []).entries()) {
  const copied = await copyAsset(img.url, `image ${i + 1}`);
  images.push({
    url: copied.url,
    storageId: copied.storageId,
    ...(img.caption ? { caption: img.caption } : {}),
    ...(img.dateLabel ? { dateLabel: img.dateLabel } : {}),
    ...(img.source ? { source: img.source } : {}),
  });
}

const tracks = [];
for (const [i, t] of (card.musicTracks ?? []).entries()) {
  const copied = await copyAsset(t.url, `track ${i + 1}`);
  tracks.push({
    url: copied.url,
    storageId: copied.storageId,
    ...(t.prompt ? { prompt: t.prompt } : {}),
    ...(t.title ? { title: t.title } : {}),
  });
}

// Cover: reuse the gallery copy when it is the same file.
const cover = card.imageUrl ? await copyAsset(card.imageUrl, "cover") : null;
const originalPhoto = card.originalPhotoUrl
  ? await copyAsset(card.originalPhotoUrl, "original photo")
  : null;

let voice = null;
if (card.voiceStorageId) {
  const voiceUrl = await dev.query(anyApi.files.getFileUrl, {
    storageId: card.voiceStorageId,
  });
  voice = await copyAsset(voiceUrl, "voice message");
}

// Standalone music field, only if it is not already track 0.
const music = card.musicUrl ? await copyAsset(card.musicUrl, "music") : null;

console.log("\nCreating the card on production...");

await prod.mutation(anyApi.cards.ownerCreate, {
  slug: card.slug,
  occasion: card.occasion,
  packageType: card.packageType,
  showWatermark: card.showWatermark,
  source: "admin",
  ...(card.customOccasionName
    ? { customOccasionName: card.customOccasionName }
    : {}),
});

const defined = (o) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));

await prod.mutation(
  anyApi.cards.updateContent,
  defined({
    slug: card.slug,
    recipientName: card.recipientName,
    senderName: card.senderName,
    messageText: card.messageText,
    imageUrl: cover?.url,
    imageStorageId: cover?.storageId,
    imagePrompt: card.imagePrompt,
    originalPhotoUrl: originalPhoto?.url,
    imageStyle: card.imageStyle,
    voiceStorageId: voice?.storageId,
    musicUrl: music?.url,
    musicStorageId: music?.storageId,
    musicPrompt: card.musicPrompt,
    theme: card.theme,
    fontFamily: card.fontFamily,
    particleEffect: card.particleEffect,
    messageStyle: card.messageStyle,
  })
);

if (images.length) {
  await prod.mutation(anyApi.cards.updateGallery, { slug: card.slug, images });
}
if (tracks.length) {
  await prod.mutation(anyApi.cards.updateSoundtrack, {
    slug: card.slug,
    tracks,
  });
}

await prod.mutation(anyApi.cards.markReady, { slug: card.slug });

const check = await prod.query(anyApi.cards.getBySlug, { slug: card.slug });
console.log(
  `\nDone — status "${check.status}", ` +
    `${check.images?.length ?? 0} image(s), ` +
    `${check.musicTracks?.length ?? 0} track(s), ` +
    `voice: ${check.voiceStorageId ? "yes" : "no"}`
);
console.log(`https://www.cardlar.com/c/${card.slug}`);
