// Shared types for the pluggable AI provider layer.
// The three API routes (generate-image, edit-image, generate-music) call
// through a provider selected at runtime by the AI_PROVIDER env var, so the
// app can run against fal.ai, local models, or cheap mocks without touching
// route code.

export type ProviderName = "fal" | "local" | "mock";

export interface GenerateImageInput {
  prompt: string;
}

export interface EditImageInput {
  prompt: string;
  imageUrl: string; // publicly reachable URL of the source photo
}

export interface GenerateMusicInput {
  prompt: string;
  lyricsPrompt?: string;
  // Upper bound on track length in seconds. Providers clamp to their own
  // limits (fal's minimax/music-3 tops out at 300s).
  durationSeconds?: number;
}

export interface ImageResult {
  imageUrl: string;
  // Optional human-readable note surfaced to the client (e.g. "dev placeholder").
  note?: string;
}

export interface MusicResult {
  // Empty string means "no track produced" (e.g. mock provider). Callers treat
  // an empty audioUrl as a soft failure, not an error.
  audioUrl: string;
  note?: string;
}

export interface AIProvider {
  readonly name: ProviderName;
  generateImage(input: GenerateImageInput): Promise<ImageResult>;
  editImage(input: EditImageInput): Promise<ImageResult>;
  generateMusic(input: GenerateMusicInput): Promise<MusicResult>;
}
