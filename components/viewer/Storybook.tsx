"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { CardImage } from "@/lib/media";

interface StorybookProps {
  images: CardImage[];
  messageText: string;
  recipientName: string;
  senderName: string;
  colorScheme: { accent: string };
  onComplete?: () => void;
}

type TextRole = "kicker" | "greeting" | "body" | "caption";

interface TextItem {
  text: string;
  role: TextRole;
}

interface StoryPage {
  image?: CardImage;
  lines: string[];
  imageChanged: boolean;
  isLast: boolean;
}

// Split a message into readable beats. Keeps trailing punctuation with its
// sentence and collapses whitespace so each line stands on its own.
function splitSentences(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const matches = trimmed.match(/[^.!?…]+[.!?…]+(\s|$)|[^.!?…]+$/g);
  return (matches || [trimmed]).map((s) => s.trim()).filter(Boolean);
}

// Weave photos and message into one timeline of "pages". Message beats are
// spread evenly across however many pages we have, so photos throughout the
// story carry a line rather than front-loading all the words. When there are
// more sentences than photos, the last photo is reused for the extra beats.
function buildPages(images: CardImage[], messageText: string): StoryPage[] {
  const sentences = splitSentences(messageText);
  const textPages = Math.ceil(sentences.length / 2);
  const pageCount = Math.max(images.length, textPages, 1);

  const groups: string[][] = Array.from({ length: pageCount }, () => []);
  sentences.forEach((s, i) => {
    const g = Math.min(
      pageCount - 1,
      Math.floor((i * pageCount) / sentences.length)
    );
    groups[g].push(s);
  });

  return groups.map((lines, i) => {
    const image = images.length
      ? images[Math.min(i, images.length - 1)]
      : undefined;
    const prevUrl =
      i > 0 && images.length
        ? images[Math.min(i - 1, images.length - 1)]?.url
        : undefined;
    return {
      image,
      lines,
      imageChanged: i === 0 || image?.url !== prevUrl,
      isLast: i === pageCount - 1,
    };
  });
}

// A cinematic, auto-advancing photo story: each page holds one photo (slow Ken
// Burns drift) while its slice of the message blurs up beneath it, all driven by
// a single GSAP timeline so pause/resume and the progress rail stay in lockstep.
// Tap right/left (or swipe) to move; press and hold to pause.
export function Storybook({
  images,
  messageText,
  recipientName,
  senderName,
  colorScheme,
  onComplete,
}: StorybookProps) {
  const pagesRef = useRef<StoryPage[]>(buildPages(images, messageText));
  const pages = pagesRef.current;

  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const textWrapRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLElement | null)[]>([]);
  const fillRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const pressRef = useRef<{ x: number; t: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const page = pages[index];

  // How long a page lingers, scaled to how much there is to read.
  const wordCount = page.lines.join(" ").split(/\s+/).filter(Boolean).length;
  const duration = Math.min(9, Math.max(3.6, 3.4 + wordCount * 0.42));

  const advance = () => {
    if (index < pages.length - 1) {
      setIndex((i) => Math.min(pages.length - 1, i + 1));
    } else if (!completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    }
  };

  // Rebuild the choreography whenever the page (or motion preference) changes.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tlRef.current = tl;

      if (imgRef.current) {
        if (reduced) {
          gsap.set(imgRef.current, { opacity: 1, scale: 1, xPercent: 0, yPercent: 0 });
          tl.fromTo(imgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0);
        } else {
          const dir = index % 2 === 0 ? 1 : -1;
          tl.fromTo(
            imgRef.current,
            { scale: 1.16, xPercent: 2.5 * dir, yPercent: -1.5, opacity: page.imageChanged ? 0 : 1 },
            { scale: 1.0, xPercent: -2 * dir, yPercent: 1.5, opacity: 1, duration: duration + 0.8, ease: "none" },
            0
          );
          if (page.imageChanged) {
            tl.to(imgRef.current, { opacity: 1, duration: 0.7, ease: "power2.out" }, 0);
          }
        }
      }

      const lineEls = lineRefs.current.filter(Boolean) as HTMLElement[];
      if (lineEls.length) {
        tl.from(
          lineEls,
          {
            y: reduced ? 0 : 26,
            opacity: 0,
            filter: reduced ? "blur(0px)" : "blur(8px)",
            duration: 0.85,
            stagger: 0.55,
            ease: "power2.out",
          },
          0.35
        );
      }

      if (fillRef.current) {
        tl.fromTo(
          fillRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration, ease: "none" },
          0
        );
      }

      tl.call(advance, undefined, duration + 0.05);
    }, rootRef);

    return () => ctx.revert();
    // advance/duration are derived from index; re-running on index is intended.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, reduced]);

  // Press-and-hold to pause; tap zones / swipe to navigate.
  const onPointerDown = (e: React.PointerEvent) => {
    pressRef.current = { x: e.clientX, t: e.timeStamp };
    tlRef.current?.pause();
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = pressRef.current;
    pressRef.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dt = e.timeStamp - start.t;

    if (Math.abs(dx) > 45) {
      dx < 0 ? goNext() : goPrev();
      return;
    }
    if (dt < 260) {
      const rect = rootRef.current?.getBoundingClientRect();
      const leftZone = rect ? e.clientX - rect.left < rect.width * 0.32 : false;
      leftZone ? goPrev() : goNext();
      return;
    }
    tlRef.current?.play(); // long press released — resume
  };

  const goNext = () => {
    if (index < pages.length - 1) setIndex(index + 1);
    else advance();
  };
  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
    else tlRef.current?.restart();
  };

  // Reset the per-page ref bucket before this render populates it.
  lineRefs.current = [];
  const pushRef = (el: HTMLElement | null) => {
    if (el) lineRefs.current.push(el);
  };

  const items: TextItem[] = [];
  if (page.imageChanged && page.image?.dateLabel) {
    items.push({ text: page.image.dateLabel, role: "kicker" });
  }
  if (index === 0 && recipientName) {
    items.push({ text: `Dear ${recipientName},`, role: "greeting" });
  }
  page.lines.forEach((l) => items.push({ text: l, role: "body" }));
  if (page.imageChanged && page.image?.caption) {
    items.push({ text: page.image.caption, role: "caption" });
  }

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-0 overflow-hidden bg-neutral-950 select-none touch-none"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        pressRef.current = null;
        tlRef.current?.play();
      }}
    >
      {/* Photo stage */}
      {page.image ? (
        <img
          key={page.image.url + index}
          ref={imgRef}
          src={page.image.url}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-800 to-neutral-950" />
      )}

      {/* Legibility scrim */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />

      {/* Progress rail */}
      <div className="absolute inset-x-0 top-0 z-20 flex gap-1 p-3">
        {pages.map((_, i) => (
          <div
            key={i}
            className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25"
          >
            <div
              ref={i === index ? fillRef : undefined}
              className="h-full origin-left rounded-full bg-white"
              style={
                i === index
                  ? undefined
                  : { transform: `scaleX(${i < index ? 1 : 0})` }
              }
            />
          </div>
        ))}
      </div>

      {/* Text */}
      <div
        ref={textWrapRef}
        className="absolute inset-x-0 bottom-0 z-10 px-6 pb-14 pt-24 sm:px-10"
      >
        <div className="mx-auto max-w-lg">
          {items.map((item, i) => {
            if (item.role === "kicker") {
              return (
                <p
                  key={i}
                  ref={pushRef}
                  className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70"
                >
                  {item.text}
                </p>
              );
            }
            if (item.role === "greeting") {
              return (
                <p
                  key={i}
                  ref={pushRef}
                  className="mb-3 font-heading text-2xl italic text-white/90 drop-shadow"
                >
                  {item.text}
                </p>
              );
            }
            if (item.role === "caption") {
              return (
                <p
                  key={i}
                  ref={pushRef}
                  className="mt-3 font-heading text-sm italic text-white/70"
                >
                  {item.text}
                </p>
              );
            }
            return (
              <p
                key={i}
                ref={pushRef}
                className="mb-2 text-[1.35rem] font-medium leading-snug text-white drop-shadow-lg sm:text-2xl"
              >
                {item.text}
              </p>
            );
          })}

          {page.isLast && (
            <p
              ref={pushRef}
              className="mt-6 font-heading text-lg italic text-white/85 drop-shadow"
            >
              With love,
              <br />
              <span className="text-xl font-semibold not-italic text-white">
                {senderName}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Tap hint (first page only) */}
      {index === 0 && (
        <div className="pointer-events-none absolute bottom-4 right-5 z-20 flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-white/50">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: colorScheme.accent }}
          />
          tap to continue
        </div>
      )}
    </div>
  );
}
