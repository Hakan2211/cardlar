import type {
  AIProvider,
  EditImageInput,
  GenerateImageInput,
  ImageResult,
  MusicResult,
} from "./types";

// Zero-cost provider for offline development. Returns placeholder images and
// no music. Mirrors the old "FAL_KEY not configured" fallback behavior.

const DEV_NOTE = "Dev mode (mock provider): using placeholder.";

export const mockProvider: AIProvider = {
  name: "mock",

  async generateImage({ prompt }: GenerateImageInput): Promise<ImageResult> {
    const label = prompt ? prompt.slice(0, 40) : "AI Generated Card";
    return {
      imageUrl: `https://placehold.co/1024x768/6366f1/white?text=${encodeURIComponent(
        label
      )}&font=playfair-display`,
      note: DEV_NOTE,
    };
  },

  async editImage(_input: EditImageInput): Promise<ImageResult> {
    return {
      imageUrl: `https://placehold.co/1024x768/8b5cf6/white?text=${encodeURIComponent(
        "Styled Card"
      )}&font=playfair-display`,
      note: DEV_NOTE,
    };
  },

  async generateMusic(): Promise<MusicResult> {
    return {
      audioUrl: "",
      note: "Dev mode (mock provider): music generation disabled.",
    };
  },
};
