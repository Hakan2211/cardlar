import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

function convexUrl(): string {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return url;
}

function convexClient(): ConvexHttpClient {
  return new ConvexHttpClient(convexUrl());
}

// True when the URL already lives in our own Convex file storage, so
// re-hosting it would just make a second copy of the same bytes.
export function isConvexStorageUrl(url: string): boolean {
  try {
    return new URL(url).host === new URL(convexUrl()).host;
  } catch {
    return false;
  }
}

// Copy a provider-hosted file into Convex storage and return the permanent
// Convex URL.
//
// Why this exists: fal keeps generated images and audio on its CDN for about
// seven days and then reclaims them, but a card is permanent — nothing prunes
// old cards. Writing a fal URL straight into a card row therefore produces a
// card that looks right to the sender and renders a broken image to the
// recipient a week later. Every ephemeral provider URL goes through here
// before it can be persisted.
//
// Already-Convex URLs pass straight through, so this is safe to call on any
// provider's output.
export async function rehostToConvex(sourceUrl: string): Promise<string> {
  if (isConvexStorageUrl(sourceUrl)) return sourceUrl;

  const res = await fetch(sourceUrl);
  if (!res.ok) {
    throw new Error(
      `Failed to download generated media (${res.status}) from ${sourceUrl}`
    );
  }

  const contentType =
    res.headers.get("content-type")?.split(";")[0].trim() ||
    "application/octet-stream";
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.byteLength === 0) {
    throw new Error("Generated media was empty");
  }

  return uploadBytesToConvex(bytes, contentType);
}

// Local model providers return raw image/audio bytes rather than a hosted URL.
// The rest of the pipeline (studio preview, viewer, fal edit-chaining) expects a
// publicly reachable URL, so we push those bytes into Convex file storage — the
// exact same store the client uses for photo/voice uploads — and hand back the
// public URL.
export async function uploadBytesToConvex(
  bytes: Uint8Array,
  contentType: string
): Promise<string> {
  const client = convexClient();
  const uploadUrl = await client.mutation(api.files.generateUploadUrl, {});

  // Copy into a plain ArrayBuffer-backed Blob (avoids Buffer's ArrayBufferLike
  // typing friction with BodyInit).
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: new Blob([ab], { type: contentType }),
  });
  if (!res.ok) throw new Error(`Convex upload failed: ${res.status}`);

  const { storageId } = await res.json();
  const publicUrl = await client.mutation(api.files.getFileUrlMutation, {
    storageId,
  });
  if (!publicUrl) throw new Error("Failed to resolve uploaded file URL");
  return publicUrl;
}
