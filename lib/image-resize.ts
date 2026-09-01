// Shrink a picked photo in the browser before it is uploaded.
//
// Photos went into Convex at whatever size the phone produced — routinely 4-10MB
// each. A 20-photo Story card then pushed well over 100MB down to every
// recipient on every view, because the viewer renders each photo as a plain
// <img> with no lazy loading. That is slow on mobile and the egress adds up.
//
// This runs on the client rather than through sharp on the server because
// uploads go straight from the browser to Convex storage and never touch our
// Next server. Routing them through an API route just to resize would add a
// hop and a serverless payload limit for no gain. A canvas re-encode costs
// nothing, and it also makes the upload itself far faster on a phone.
//
// At CARD_MAX_EDGE / JPEG_QUALITY a 10MB photo lands around 200-350KB, which is
// still more pixels than the card ever displays.

// The card renders about 600px wide; 1600 leaves headroom for retina and for
// the Ken Burns zoom in MemoryLane without paying for a full-size photo.
const CARD_MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

// Below this a photo is already small enough that re-encoding would mostly just
// risk making it look worse.
const SKIP_BELOW_BYTES = 600 * 1024;

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function withJpegName(name: string): string {
  return name.replace(/\.[^./\\]+$/, "") + ".jpg";
}

/**
 * Returns a downscaled JPEG copy of `file`, or the original file when shrinking
 * it would not help or is not possible.
 *
 * Never throws: an upload must not fail because the optimisation did. Any
 * problem (an unsupported codec, a tainted canvas, a browser without
 * createImageBitmap) falls back to uploading the file exactly as picked.
 */
export async function downscaleImage(file: File): Promise<File> {
  if (typeof createImageBitmap !== "function") return file;

  let bitmap: ImageBitmap;
  try {
    // `from-image` applies the EXIF rotation flag. Without it, portrait photos
    // straight off an iPhone upload sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  try {
    const { width, height } = bitmap;
    if (!width || !height) return file;

    const scale = Math.min(1, CARD_MAX_EDGE / Math.max(width, height));

    // Already small in both pixels and bytes — leave it alone.
    if (scale === 1 && file.size <= SKIP_BELOW_BYTES) return file;

    const targetWidth = Math.max(1, Math.round(width * scale));
    const targetHeight = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    const blob = await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY);
    if (!blob) return file;

    // Re-encoding can occasionally win nothing (an already-optimised JPEG at
    // its native size). Keep whichever is smaller.
    if (blob.size >= file.size) return file;

    return new File([blob], withJpegName(file.name), {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  } finally {
    bitmap.close();
  }
}
