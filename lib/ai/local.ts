import type {
  AIProvider,
  EditImageInput,
  GenerateImageInput,
  GenerateMusicInput,
  ImageResult,
  MusicResult,
} from "./types";
import { uploadBytesToConvex } from "./convexUpload";
import { runGraph, findComfy, uploadImageToComfy, ComfyGraph } from "./comfy";

// Local-model provider (development only). Everything runs through a local
// ComfyUI instance:
//
//   image  — Krea 2 Turbo (GGUF). Needs ComfyUI >= 0.26 for the `krea2` CLIP
//            type, which wires up the Qwen3-VL text encoder.
//   edit   — Qwen-Image-Edit-2509. A true instruction-editing model, so the
//            occasion editPrompts ("Transform this photo into...") land as
//            written rather than being reinterpreted as img2img drift.
//   music  — ACE-Step 1.5 Turbo (all-in-one checkpoint).
//
// Model filenames are env-overridable because they are the thing most likely
// to drift as weights get re-downloaded or re-quantised.
const MODELS = {
  krea2Unet: process.env.COMFY_KREA2_UNET || "krea2_turbo-Q8_0.gguf",
  krea2Clip: process.env.COMFY_KREA2_CLIP || "qwen3vl_4b_bf16.safetensors",
  qwenVae: process.env.COMFY_QWEN_VAE || "qwen_image_vae.safetensors",
  editUnet: process.env.COMFY_EDIT_UNET || "Qwen-Image-Edit-2509-Q5_K_M.gguf",
  editClip: process.env.COMFY_EDIT_CLIP || "qwen_2.5_vl_7b_fp8_scaled.safetensors",
  aceCheckpoint:
    process.env.COMFY_ACE_CHECKPOINT || "ace_step_1.5_turbo_aio.safetensors",
};

// Cards render 4:3, matching the fal provider's aspect_ratio.
const WIDTH = 1024;
const HEIGHT = 768;

const MUSIC_SECONDS = Number(process.env.LOCAL_MUSIC_SECONDS || 60);

function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31);
}

async function fetchBytes(url: string): Promise<{
  bytes: Uint8Array;
  contentType: string;
}> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch source image: ${res.status}`);
  return {
    bytes: new Uint8Array(await res.arrayBuffer()),
    contentType: res.headers.get("content-type") ?? "image/png",
  };
}

// Krea 2 Turbo is a distilled model: 8 steps at cfg 1 with the er_sde sampler.
// Raising cfg above 1 degrades it rather than improving prompt adherence, so
// the negative is a zeroed-out copy of the positive instead of a real prompt.
function krea2Graph(prompt: string): ComfyGraph {
  return {
    "1": {
      class_type: "UnetLoaderGGUF",
      inputs: { unet_name: MODELS.krea2Unet },
    },
    "2": {
      class_type: "CLIPLoader",
      inputs: {
        clip_name: MODELS.krea2Clip,
        type: "krea2",
        device: "default",
      },
    },
    "3": { class_type: "VAELoader", inputs: { vae_name: MODELS.qwenVae } },
    "4": { class_type: "CLIPTextEncode", inputs: { text: prompt, clip: ["2", 0] } },
    "5": { class_type: "ConditioningZeroOut", inputs: { conditioning: ["4", 0] } },
    "6": {
      class_type: "EmptyLatentImage",
      inputs: { width: WIDTH, height: HEIGHT, batch_size: 1 },
    },
    "7": {
      class_type: "KSampler",
      inputs: {
        seed: randomSeed(),
        steps: 8,
        cfg: 1.0,
        sampler_name: "er_sde",
        scheduler: "simple",
        denoise: 1.0,
        model: ["1", 0],
        positive: ["4", 0],
        negative: ["5", 0],
        latent_image: ["6", 0],
      },
    },
    "8": { class_type: "VAEDecode", inputs: { samples: ["7", 0], vae: ["3", 0] } },
    "9": {
      class_type: "SaveImage",
      inputs: { filename_prefix: "cardlar", images: ["8", 0] },
    },
  };
}

// Qwen-Image-Edit reads the source photo through the text encoder (image1) as
// well as the latent, which is what makes it follow an instruction instead of
// merely restyling. image2/image3 are optional and left unused.
function qwenEditGraph(prompt: string, comfyImageName: string): ComfyGraph {
  return {
    "1": {
      class_type: "UnetLoaderGGUF",
      inputs: { unet_name: MODELS.editUnet },
    },
    "2": {
      class_type: "CLIPLoader",
      inputs: {
        clip_name: MODELS.editClip,
        type: "qwen_image",
        device: "default",
      },
    },
    "3": { class_type: "VAELoader", inputs: { vae_name: MODELS.qwenVae } },
    "4": { class_type: "LoadImage", inputs: { image: comfyImageName } },
    "5": {
      class_type: "TextEncodeQwenImageEditPlus",
      inputs: { prompt, clip: ["2", 0], vae: ["3", 0], image1: ["4", 0] },
    },
    "6": {
      class_type: "TextEncodeQwenImageEditPlus",
      inputs: { prompt: "", clip: ["2", 0], vae: ["3", 0], image1: ["4", 0] },
    },
    "7": {
      class_type: "EmptySD3LatentImage",
      inputs: { width: WIDTH, height: HEIGHT, batch_size: 1 },
    },
    "8": {
      class_type: "KSampler",
      inputs: {
        seed: randomSeed(),
        steps: 20,
        cfg: 4.0,
        sampler_name: "euler",
        scheduler: "simple",
        denoise: 1.0,
        model: ["1", 0],
        positive: ["5", 0],
        negative: ["6", 0],
        latent_image: ["7", 0],
      },
    },
    "9": { class_type: "VAEDecode", inputs: { samples: ["8", 0], vae: ["3", 0] } },
    "10": {
      class_type: "SaveImage",
      inputs: { filename_prefix: "cardlar-edit", images: ["9", 0] },
    },
  };
}

// ACE-Step splits the prompt in two: `tags` is the musical direction (genre,
// instrumentation, mood) and `lyrics` is sung text. "[instrumental]" is the
// model's own convention for "no vocals".
//
// `duration` and the latent's `seconds` must agree, or the track is generated
// to one length and decoded to another.
function aceStepGraph(tags: string, lyrics: string, seconds: number): ComfyGraph {
  const seed = randomSeed();
  return {
    "1": {
      class_type: "CheckpointLoaderSimple",
      inputs: { ckpt_name: MODELS.aceCheckpoint },
    },
    "2": {
      class_type: "ModelSamplingAuraFlow",
      inputs: { model: ["1", 0], shift: 3.0 },
    },
    "3": {
      class_type: "TextEncodeAceStepAudio1.5",
      inputs: {
        clip: ["1", 1],
        tags,
        lyrics,
        seed,
        bpm: 120,
        duration: seconds,
        timesignature: "4",
        language: "en",
        keyscale: "C major",
        // The UI supplies these from widget defaults, but every one of them is
        // a *required* input, so an API graph has to pass them explicitly or
        // ComfyUI rejects the prompt. Values are the node's own defaults.
        generate_audio_codes: true,
        cfg_scale: 2.0,
        temperature: 0.85,
        top_p: 0.9,
        top_k: 0,
        min_p: 0,
      },
    },
    "4": { class_type: "ConditioningZeroOut", inputs: { conditioning: ["3", 0] } },
    "5": {
      class_type: "EmptyAceStep1.5LatentAudio",
      inputs: { seconds, batch_size: 1 },
    },
    "6": {
      class_type: "KSampler",
      inputs: {
        seed,
        steps: 8,
        cfg: 1.0,
        sampler_name: "euler",
        scheduler: "simple",
        denoise: 1.0,
        model: ["2", 0],
        positive: ["3", 0],
        negative: ["4", 0],
        latent_image: ["5", 0],
      },
    },
    "7": {
      class_type: "VAEDecodeAudio",
      inputs: { samples: ["6", 0], vae: ["1", 2] },
    },
    "8": {
      class_type: "SaveAudioMP3",
      inputs: { audio: ["7", 0], filename_prefix: "cardlar-music", quality: "V0" },
    },
  };
}

export const localProvider: AIProvider = {
  name: "local",

  async generateImage({ prompt }: GenerateImageInput): Promise<ImageResult> {
    // Deliberately unlike the fal wrapper, which opens "greeting card
    // illustration:". Krea 2 renders text well and reads that literally —
    // it paints a photo of a physical card with a (misspelled) caption on it.
    // We want the artwork alone; the studio lays the real message over it.
    // Suppressing text has to happen here in the positive prompt, because at
    // cfg 1.0 with a zeroed-out negative there is no negative prompt to use.
    const { bytes, contentType } = await runGraph(
      krea2Graph(
        `${prompt}. Beautiful richly detailed illustration filling the entire frame, professional artwork, vivid color. No text, no lettering, no captions, no signature, no border.`
      )
    );
    const imageUrl = await uploadBytesToConvex(bytes, contentType);
    return { imageUrl, note: "Generated locally with Krea 2 Turbo." };
  },

  async editImage({ prompt, imageUrl }: EditImageInput): Promise<ImageResult> {
    const base = await findComfy();
    const source = await fetchBytes(imageUrl);
    const name = await uploadImageToComfy(
      base,
      `cardlar-src-${Date.now()}.png`,
      source.bytes,
      source.contentType
    );

    const { bytes, contentType } = await runGraph(qwenEditGraph(prompt, name));
    const url = await uploadBytesToConvex(bytes, contentType);
    return { imageUrl: url, note: "Styled locally with Qwen-Image-Edit." };
  },

  async generateMusic({
    prompt,
    lyricsPrompt,
  }: GenerateMusicInput): Promise<MusicResult> {
    const lyrics = lyricsPrompt?.trim() || "[instrumental]";
    const { bytes, contentType } = await runGraph(
      aceStepGraph(prompt, lyrics, MUSIC_SECONDS),
      // Music is the slowest step here; give it room beyond the default.
      { timeoutMs: 900_000 }
    );
    const audioUrl = await uploadBytesToConvex(
      bytes,
      contentType.startsWith("audio/") ? contentType : "audio/mpeg"
    );
    return { audioUrl, note: "Generated locally with ACE-Step 1.5." };
  },
};
