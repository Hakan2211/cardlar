"use client";

import { useEffect, useState } from "react";

export interface ViewerColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

const hsl = (h: number, s: number, l: number) =>
  `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

// Derives a card-wide color scheme from the cover photo: samples the image on
// a small canvas, finds the dominant saturated hue, and builds tinted
// primary/accent/background shades around it. Falls back to the occasion
// scheme when the image can't be sampled (CORS, load error, greyscale photo).
export function usePhotoPalette(
  imageUrl: string | undefined,
  fallback: ViewerColorScheme
): ViewerColorScheme {
  const [palette, setPalette] = useState<ViewerColorScheme | null>(null);

  useEffect(() => {
    setPalette(null);
    if (!imageUrl) return;

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      try {
        const size = 48;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        // Bucket saturated pixels by coarse hue; weight by saturation so a
        // vivid subject beats a large muted backdrop.
        const buckets = new Map<number, { weight: number; s: number; l: number; n: number }>();
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 200) continue;
          const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
          if (s < 0.18 || l < 0.12 || l > 0.92) continue; // skip grey/near-b&w
          const key = Math.round(h / 15) * 15;
          const b = buckets.get(key) || { weight: 0, s: 0, l: 0, n: 0 };
          b.weight += s;
          b.s += s;
          b.l += l;
          b.n += 1;
          buckets.set(key, b);
        }

        let best: { h: number; s: number; l: number; weight: number } | null = null;
        for (const [h, b] of buckets) {
          if (!best || b.weight > best.weight) {
            best = { h, s: b.s / b.n, l: b.l / b.n, weight: b.weight };
          }
        }
        // Need a meaningful amount of color, else keep the occasion scheme.
        if (!best || best.weight < 40) return;

        const h = best.h;
        const s = Math.min(best.s, 0.6);
        setPalette({
          primary: hsl(h, Math.min(s + 0.05, 0.55), 0.32),
          secondary: hsl(h, Math.min(s, 0.4), 0.9),
          accent: hsl(h, Math.min(s + 0.1, 0.65), 0.48),
          background: hsl(h, Math.min(s, 0.45), 0.965),
        });
      } catch {
        // Tainted canvas (no CORS) — silently keep the fallback.
      }
    };
    img.src = imageUrl;

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return palette ?? fallback;
}
