"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { CardImage } from "@/lib/media";
import { EndScreen } from "./EndScreen";

interface ScrollStoryProps {
  images: CardImage[];
  messageText: string;
  recipientName: string;
  senderName: string;
  colorScheme: { accent: string };
  onReplay: () => void;
  onComplete?: () => void;
}

type Block =
  | { kind: "photo"; image: CardImage; key: string }
  | { kind: "text"; lines: string[]; key: string };

// Split a message into readable beats. Keeps trailing punctuation with its
// sentence and collapses whitespace so each line stands on its own.
function splitSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const matches = trimmed.match(/[^.!?…]+[.!?…]+(\s|$)|[^.!?…]+$/g);
  return (matches || [trimmed]).map((s) => s.trim()).filter(Boolean);
}

// Weave photos and message into a single vertical sequence of blocks. Sentences
// are spread evenly across the photos so words carry through the whole scroll
// rather than piling up at the top. Photos and text always live in their own
// blocks — never text laid over an image.
function buildBlocks(images: CardImage[], messageText: string): Block[] {
  const sentences = splitSentences(messageText);
  const stops = Math.max(images.length, 1);

  const groups: string[][] = Array.from({ length: stops }, () => []);
  sentences.forEach((s, i) => {
    const g = Math.min(stops - 1, Math.floor((i * stops) / sentences.length));
    groups[g].push(s);
  });

  const blocks: Block[] = [];
  for (let i = 0; i < stops; i++) {
    const image = images[i];
    if (image) blocks.push({ kind: "photo", image, key: `photo-${i}` });
    if (groups[i].length) {
      blocks.push({ kind: "text", lines: groups[i], key: `text-${i}` });
    }
  }
  return blocks;
}

// A vertical, scroll-through storybook: a warm greeting, then photos and message
// beats revealing one at a time as they enter the viewport, closing on the
// sender's signature. No tapping, no timers — the reader sets the pace.
export function ScrollStory({
  images,
  messageText,
  recipientName,
  senderName,
  colorScheme,
  onReplay,
  onComplete,
}: ScrollStoryProps) {
  const blocks = useMemo(
    () => buildBlocks(images, messageText),
    [images, messageText]
  );
  const reduce = useReducedMotion();

  const completedRef = useRef(false);

  const [showHint, setShowHint] = useState(true);
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 40) setShowHint(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const reveal = {
    hidden: { opacity: 0, y: reduce ? 0 : 32 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
  };
  const viewport = { once: true, amount: 0.35 } as const;

  return (
    <div className="relative mx-auto w-full max-w-xl px-5 pb-24 sm:px-6">
      {/* Opening — a warm greeting to set the tone */}
      <section className="flex min-h-[78vh] flex-col items-center justify-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mb-4 text-[11px] font-semibold uppercase tracking-[0.28em] text-foreground/45"
        >
          A little something for you
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="font-heading text-4xl italic leading-tight text-foreground/90 sm:text-5xl"
        >
          Dear {recipientName || "you"},
        </motion.h1>

        <motion.div
          animate={reduce ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="mt-14 flex flex-col items-center gap-1.5 transition-opacity duration-500"
          style={{ opacity: showHint ? 1 : 0 }}
        >
          <span className="text-[11px] font-medium tracking-wide text-foreground/40">
            scroll
          </span>
          <ChevronDown
            className="h-5 w-5"
            style={{ color: colorScheme.accent }}
          />
        </motion.div>
      </section>

      {/* The story — photos and words, each in its own block */}
      <div className="flex flex-col gap-14 sm:gap-20">
        {blocks.map((block) =>
          block.kind === "photo" ? (
            <motion.figure
              key={block.key}
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              className="m-0"
            >
              <div className="overflow-hidden rounded-[1.75rem] bg-black/5 shadow-xl ring-1 ring-black/5">
                <img
                  src={block.image.url}
                  alt={block.image.caption || ""}
                  draggable={false}
                  className="block w-full object-cover"
                />
              </div>
              {(block.image.dateLabel || block.image.caption) && (
                <figcaption className="mt-3 px-1 text-center">
                  {block.image.dateLabel && (
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40">
                      {block.image.dateLabel}
                    </span>
                  )}
                  {block.image.caption && (
                    <span className="block font-heading text-base italic text-foreground/65">
                      {block.image.caption}
                    </span>
                  )}
                </figcaption>
              )}
            </motion.figure>
          ) : (
            <motion.div
              key={block.key}
              variants={reveal}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
              className="mx-auto max-w-md text-center"
            >
              {block.lines.map((line, i) => (
                <p
                  key={i}
                  className="mb-3 text-[1.3rem] font-medium leading-relaxed text-foreground/85 last:mb-0 sm:text-2xl"
                >
                  {line}
                </p>
              ))}
            </motion.div>
          )
        )}
      </div>

      {/* Signature — closes the letter */}
      <motion.div
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={viewport}
        onViewportEnter={() => {
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
        }}
        className="mt-16 text-center sm:mt-24"
      >
        <p className="font-heading text-lg italic text-foreground/60">
          With love,
        </p>
        <p
          className="mt-1 font-heading text-3xl italic"
          style={{ color: colorScheme.accent }}
        >
          {senderName}
        </p>
      </motion.div>

      <EndScreen
        senderName={senderName}
        accentColor={colorScheme.accent}
        onReplay={onReplay}
      />
    </div>
  );
}
