"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CardImage } from "@/lib/media";

interface MemoryLaneProps {
  images: CardImage[];
  colorScheme: { accent: string };
  autoMs?: number;
}

// A timeline of photo "moments": slow Ken Burns zoom, captions, a progress
// rail, tap/arrow/swipe navigation, and auto-advance. A single image renders as
// a plain hero (no controls), preserving the original single-photo experience.
export function MemoryLane({
  images,
  colorScheme,
  autoMs = 5000,
}: MemoryLaneProps) {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);
  const count = images.length;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % count), autoMs);
    return () => clearTimeout(id);
  }, [index, count, paused, autoMs]);

  if (count === 0) return null;

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);
  const current = images[index];
  const kenBurns = !reduced && count > 0;

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-2xl mb-6 select-none"
      onPointerDown={(e) => {
        startX.current = e.clientX;
        setPaused(true);
      }}
      onPointerUp={(e) => {
        if (startX.current !== null) {
          const dx = e.clientX - startX.current;
          if (dx > 40) go(-1);
          else if (dx < -40) go(1);
        }
        startX.current = null;
        setPaused(false);
      }}
    >
      <div className="relative w-full aspect-[4/3] bg-black/5">
        <AnimatePresence>
          <motion.img
            key={current.url}
            src={current.url}
            alt={current.caption || `Moment ${index + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: kenBurns ? 1.09 : 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.8 },
              scale: {
                duration: kenBurns ? autoMs / 1000 + 1 : 0.8,
                ease: "linear",
              },
            }}
          />
        </AnimatePresence>

        {/* Caption / date overlay */}
        {(current.caption || current.dateLabel) && (
          <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none">
            {current.dateLabel && (
              <p className="text-white/85 text-[11px] font-semibold tracking-[0.15em] uppercase mb-0.5">
                {current.dateLabel}
              </p>
            )}
            {current.caption && (
              <p className="text-white text-base font-heading leading-snug drop-shadow">
                {current.caption}
              </p>
            )}
          </div>
        )}

        {/* Navigation arrows (multi-image only) */}
        {count > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
              aria-label="Previous moment"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
              aria-label="Next moment"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Progress rail */}
      {count > 1 && (
        <div className="flex gap-1.5 justify-center py-2.5 bg-white/70 backdrop-blur-sm">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 24 : 6,
                background:
                  i === index ? colorScheme.accent : "rgba(0,0,0,0.18)",
              }}
              aria-label={`Go to moment ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
