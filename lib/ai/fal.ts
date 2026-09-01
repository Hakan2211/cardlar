import type {
  AIProvider,
  EditImageInput,
  GenerateImageInput,
  GenerateMusicInput,
  ImageResult,
  MusicResult,
} from "./types";

// Production provider backed by fal.ai.
//
// Everything this provider returns is marked `ephemeral`: fal keeps generated
// files on its CDN for ~7 days and then reclaims them. Cards are permanent, so
// the API routes re-host these URLs into Convex storage before they are ever
// written to a card row.

// Images run on OpenAI's gpt-image-2 at `low` quality, which is priced per
// resolution-and-quality tier rather than per image. At landscape_4_3
// (1024x768) that is about $0.011 per edit and $0.005 per generation, against
// $0.08 either way on the nano-banana-2 models this replaced. Low quality is
// the point — it is what makes the tier cheap, and it holds up at the size a
// card actually renders.
//
// image_size is pinned rather than left on `auto` for two reasons: it keeps the
// 4:3 shape the card layout is built around, and it fixes which price tier the
// request lands in. Raise the quality with FAL_IMAGE_QUALITY (auto|low|medium|
// high) if a tier ever proves too soft — note the cost climbs steeply: medium
// is ~4x low and high is ~14x.
const IMAGE_SIZE = "landscape_4_3";
const IMAGE_QUALITY = process.env.FAL_IMAGE_QUALITY || "low";

async function configuredFal() {
  const { fal } = await import("@fal-ai/client");
  fal.config({ credentials: process.env.FAL_KEY });
  return fal;
}

// minimax/music-3 takes an upper bound in seconds (the model may finish
// earlier) and supports songs up to five minutes.
const MUSIC_MIN_SECONDS = 10;
const MUSIC_MAX_SECONDS = 300;
const MUSIC_DEFAULT_SECONDS = Number(process.env.FAL_MUSIC_SECONDS || 60);

function clampDuration(seconds?: number): number {
  const value = Number.isFinite(seconds) ? Number(seconds) : MUSIC_DEFAULT_SECONDS;
  return Math.min(MUSIC_MAX_SECONDS, Math.max(MUSIC_MIN_SECONDS, Math.round(value)));
}

// Put each [structure tag] on its own line, which is what music-3 expects.
function normalizeLyrics(lyricsPrompt?: string): string {
  const lyrics = lyricsPrompt?.trim();
  if (!lyrics) return "[instrumental]";
  return lyrics
    .replace(/[ \t]*(\[[^\]\n]+\])[ \t]*/g, "\n$1\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

export const falProvider: AIProvider = {
  name: "fal",

  async generateImage({ prompt }: GenerateImageInput): Promise<ImageResult> {
    const fal = await configuredFal();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await fal.subscribe("openai/gpt-image-2" as any, {
      input: {
        prompt: `High quality greeting card illustration: ${prompt}. Professional card design, beautiful and detailed, suitable for a greeting card.`,
        num_images: 1,
        image_size: IMAGE_SIZE,
        quality: IMAGE_QUALITY,
        output_format: "jpeg",
      } as Record<string, unknown>,
      logs: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageUrl = (result.data as any)?.images?.[0]?.url;
    if (!imageUrl) throw new Error("No image generated");
    return { imageUrl, ephemeral: true };
  },

  async editImage({ prompt, imageUrl }: EditImageInput): Promise<ImageResult> {
    const fal = await configuredFal();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await fal.subscribe("openai/gpt-image-2/edit" as any, {
      input: {
        prompt: `${prompt}. Professional greeting card design, beautiful and high quality.`,
        image_urls: [imageUrl],
        num_images: 1,
        image_size: IMAGE_SIZE,
        quality: IMAGE_QUALITY,
        output_format: "jpeg",
      } as Record<string, unknown>,
      logs: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultImageUrl = (result.data as any)?.images?.[0]?.url;
    if (!resultImageUrl) throw new Error("No image generated");
    return { imageUrl: resultImageUrl, ephemeral: true };
  },

  async generateMusic({
    prompt,
    lyricsPrompt,
    durationSeconds,
  }: GenerateMusicInput): Promise<MusicResult> {
    const fal = await configuredFal();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await fal.subscribe("minimax/music-3" as any, {
      input: {
        prompt,
        // music-3 wants structure tags ([verse], [chorus], ...) on their own
        // lines; the studio textarea lets people type them inline.
        lyrics: normalizeLyrics(lyricsPrompt),
        duration: clampDuration(durationSeconds),
      } as Record<string, unknown>,
      logs: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioUrl = (result.data as any)?.audio?.url;
    if (!audioUrl) throw new Error("No music generated");
    return { audioUrl, ephemeral: true };
  },
};
