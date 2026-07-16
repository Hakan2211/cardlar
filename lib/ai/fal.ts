import type {
  AIProvider,
  EditImageInput,
  GenerateImageInput,
  GenerateMusicInput,
  ImageResult,
  MusicResult,
} from "./types";

// Production provider backed by fal.ai. This is a straight port of the logic
// that previously lived inline in the API routes.

async function configuredFal() {
  const { fal } = await import("@fal-ai/client");
  fal.config({ credentials: process.env.FAL_KEY });
  return fal;
}

export const falProvider: AIProvider = {
  name: "fal",

  async generateImage({ prompt }: GenerateImageInput): Promise<ImageResult> {
    const fal = await configuredFal();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await fal.subscribe("fal-ai/nano-banana-2" as any, {
      input: {
        prompt: `High quality greeting card illustration: ${prompt}. Professional card design, beautiful and detailed, suitable for a greeting card.`,
        num_images: 1,
        aspect_ratio: "4:3",
        output_format: "png",
        resolution: "1K",
      } as Record<string, unknown>,
      logs: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imageUrl = (result.data as any)?.images?.[0]?.url;
    if (!imageUrl) throw new Error("No image generated");
    return { imageUrl };
  },

  async editImage({ prompt, imageUrl }: EditImageInput): Promise<ImageResult> {
    const fal = await configuredFal();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await fal.subscribe("fal-ai/nano-banana-2/edit" as any, {
      input: {
        prompt: `${prompt}. Professional greeting card design, beautiful and high quality.`,
        image_urls: [imageUrl],
        num_images: 1,
        aspect_ratio: "4:3",
        output_format: "png",
        resolution: "1K",
      } as Record<string, unknown>,
      logs: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultImageUrl = (result.data as any)?.images?.[0]?.url;
    if (!resultImageUrl) throw new Error("No image generated");
    return { imageUrl: resultImageUrl };
  },

  async generateMusic({
    prompt,
    lyricsPrompt,
  }: GenerateMusicInput): Promise<MusicResult> {
    const fal = await configuredFal();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await fal.subscribe("fal-ai/minimax-music/v2" as any, {
      input: {
        prompt,
        lyrics_prompt: lyricsPrompt || "[instrumental]",
      } as Record<string, unknown>,
      logs: false,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioUrl = (result.data as any)?.audio?.url;
    if (!audioUrl) throw new Error("No music generated");
    return { audioUrl };
  },
};
