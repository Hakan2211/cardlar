// Repair cards whose media still points at a provider CDN instead of Convex.
//
// Background: until the fix in lib/ai/convexUpload.ts, the generate-image,
// edit-image and generate-music routes wrote fal's own URLs straight into the
// card row. fal keeps generated files for about seven days and then reclaims
// them, so those cards render a broken photo (and play no music) roughly a
// week after they were sent, while still looking perfect to the sender who
// created them.
//
// This copies any non-Convex media on a card into Convex storage and rewrites
// the row to point at the permanent copy. It can only rescue cards whose files
// fal has not deleted yet — anything already reclaimed is reported as dead so
// you know which customers need a rebuild.
//
//   node scripts/rehost-fal-media.mjs <slug> [<slug>...] [--dry] [--dev]
//
// --dry  report what would change, write nothing
// --dev  operate on the dev deployment instead of production

import { ConvexHttpClient } from "convex/browser";
import { anyApi } from "convex/server";

const DEV_URL = "https://quaint-mouse-314.eu-west-1.convex.cloud";
const PROD_URL = "https://artful-seal-643.eu-west-1.convex.cloud";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry");
const useDev = args.includes("--dev");
const slugs = args.filter((a) => !a.startsWith("--"));

if (slugs.length === 0) {
  console.error(
    "usage: node scripts/rehost-fal-media.mjs <slug> [<slug>...] [--dry] [--dev]"
  );
  process.exit(1);
}

const BASE_URL = useDev ? DEV_URL : PROD_URL;
const convexHost = new URL(BASE_URL).host;
const client = new ConvexHttpClient(BASE_URL);

console.log(`Deployment: ${BASE_URL}${dryRun ? "  (dry run)" : ""}\n`);

// Already-permanent media needs no work.
const isConvexUrl = (url) => {
  try {
    return new URL(url).host === convexHost;
  } catch {
    return false;
  }
};

// One copy per source URL — a cover mirrored into images[0] is the same file.
const copied = new Map();
let deadFiles = 0;

async function rehost(url, label) {
  if (!url || isConvexUrl(url)) return null;
  if (copied.has(url)) return copied.get(url);

  const res = await fetch(url);
  if (!res.ok) {
    // 403/404 here means fal has already reclaimed the file. Nothing to
    // recover — the card needs to be rebuilt with the customer.
    console.log(`  ${label}: GONE (${res.status}) — ${url}`);
    deadFiles += 1;
    copied.set(url, null);
    return null;
  }

  const bytes = Buffer.from(await res.arrayBuffer());
  const contentType =
    res.headers.get("content-type")?.split(";")[0].trim() ||
    "application/octet-stream";

  if (dryRun) {
    console.log(
      `  ${label}: would copy ${(bytes.length / 1024 / 1024).toFixed(2)} MB (${contentType})`
    );
    copied.set(url, { url, storageId: undefined });
    return null;
  }

  const uploadUrl = await client.mutation(anyApi.files.generateUploadUrl, {});
  const put = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: bytes,
  });
  if (!put.ok) throw new Error(`upload failed (${put.status}) for ${label}`);

  const { storageId } = await put.json();
  const newUrl = await client.mutation(anyApi.files.getFileUrlMutation, {
    storageId,
  });

  const result = { url: newUrl, storageId };
  copied.set(url, result);
  console.log(
    `  ${label}: copied ${(bytes.length / 1024 / 1024).toFixed(2)} MB`
  );
  return result;
}

let repaired = 0;
let clean = 0;

for (const slug of slugs) {
  const card = await client.query(anyApi.cards.getBySlug, { slug });
  if (!card) {
    console.log(`${slug}: NOT FOUND\n`);
    continue;
  }

  const external = [
    ...(card.images ?? []).map((i) => i.url),
    ...(card.musicTracks ?? []).map((t) => t.url),
    card.imageUrl,
    card.musicUrl,
    card.originalPhotoUrl,
  ].filter((u) => u && !isConvexUrl(u));

  console.log(
    `${slug} — ${card.recipientName || "(no recipient)"} / ${card.packageType} / ${card.status}`
  );

  if (external.length === 0) {
    console.log("  all media already on Convex storage — nothing to do\n");
    clean += 1;
    continue;
  }

  // Gallery.
  const images = [];
  let galleryChanged = false;
  for (const [i, img] of (card.images ?? []).entries()) {
    const next = await rehost(img.url, `image ${i + 1}`);
    if (next) galleryChanged = true;
    images.push({
      ...img,
      ...(next ? { url: next.url, storageId: next.storageId } : {}),
    });
  }

  // Soundtrack.
  const tracks = [];
  let soundtrackChanged = false;
  for (const [i, t] of (card.musicTracks ?? []).entries()) {
    const next = await rehost(t.url, `track ${i + 1}`);
    if (next) soundtrackChanged = true;
    tracks.push({
      ...t,
      ...(next ? { url: next.url, storageId: next.storageId } : {}),
    });
  }

  // Legacy single fields. updateGallery/updateSoundtrack already mirror slot 0
  // into imageUrl/musicUrl, so only handle these when there is no array.
  const cover =
    (card.images ?? []).length === 0
      ? await rehost(card.imageUrl, "cover")
      : null;
  const music =
    (card.musicTracks ?? []).length === 0
      ? await rehost(card.musicUrl, "music")
      : null;
  const originalPhoto = await rehost(card.originalPhotoUrl, "original photo");

  if (dryRun) {
    console.log("");
    continue;
  }

  if (galleryChanged) {
    await client.mutation(anyApi.cards.updateGallery, { slug, images });
  }
  if (soundtrackChanged) {
    await client.mutation(anyApi.cards.updateSoundtrack, { slug, tracks });
  }

  const content = {};
  if (cover) {
    content.imageUrl = cover.url;
    content.imageStorageId = cover.storageId;
  }
  if (music) {
    content.musicUrl = music.url;
    content.musicStorageId = music.storageId;
  }
  if (originalPhoto) content.originalPhotoUrl = originalPhoto.url;
  if (Object.keys(content).length > 0) {
    await client.mutation(anyApi.cards.updateContent, { slug, ...content });
  }

  const touched =
    galleryChanged || soundtrackChanged || Object.keys(content).length > 0;
  if (touched) repaired += 1;
  console.log(touched ? "  repaired\n" : "  nothing recoverable\n");
}

console.log(
  `${repaired} card(s) repaired, ${clean} already clean` +
    (deadFiles > 0
      ? `, ${deadFiles} file(s) already reclaimed by the provider (unrecoverable — rebuild those cards)`
      : "")
);
