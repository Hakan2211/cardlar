import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

// Local model providers return raw image/audio bytes rather than a hosted URL.
// The rest of the pipeline (studio preview, viewer, fal edit-chaining) expects a
// publicly reachable URL, so we push those bytes into Convex file storage — the
// exact same store the client uses for photo/voice uploads — and hand back the
// public URL.
export async function uploadBytesToConvex(
  bytes: Uint8Array,
  contentType: string
): Promise<string> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");

  const client = new ConvexHttpClient(url);
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
