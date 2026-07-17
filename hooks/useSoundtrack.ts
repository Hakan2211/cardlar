"use client";

import { useCallback, useRef, useState } from "react";

// Sequential multi-track playback driven by a single <audio> element.
//
// Why one element: on iOS Safari, audio is "unlocked" per-element by a user
// gesture. Reusing the same element (swapping .src) across tracks keeps it
// unlocked, whereas playing a freshly-created element later would be blocked.
// The last track loops natively; earlier tracks advance on `ended`.
export function useSoundtrack(trackUrls: string[], baseVolume = 0.3) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);
  // Set once real playback has been asked for, so prime()'s async cleanup
  // knows not to pause a soundtrack that has since legitimately started.
  const startedRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const playIndex = useCallback(
    (i: number) => {
      const el = audioRef.current;
      if (!el || !trackUrls[i]) return;
      indexRef.current = i;
      setCurrentIndex(i);
      // Assigning src rewinds the element, so a replay starts from the top.
      el.src = trackUrls[i];
      el.loop = i === trackUrls.length - 1; // loop only the final track
      el.volume = baseVolume;
      el.play().catch(() => {});
    },
    [trackUrls, baseVolume]
  );

  // Call inside the open-tap handler so the element is unlocked by the gesture,
  // or after prime() once the voice message has finished.
  const start = useCallback(() => {
    if (trackUrls.length === 0) return;
    startedRef.current = true;
    playIndex(0);
  }, [trackUrls, playIndex]);

  // Unlock the element during the open tap *without* making a sound, so that a
  // later start() — once the voice message ends, seconds after the gesture is
  // gone — isn't blocked by iOS Safari's per-element autoplay policy. Plays at
  // volume 0 just long enough to satisfy the unlock, then rewinds.
  const prime = useCallback(() => {
    const el = audioRef.current;
    if (!el || trackUrls.length === 0) return;
    startedRef.current = false;
    el.src = trackUrls[0];
    el.loop = false;
    el.volume = 0;
    const settle = () => {
      // start() may already have run — a voice that errors instantly gets us
      // here after playback legitimately began. Pausing now would kill it.
      if (startedRef.current) return;
      el.pause();
      el.currentTime = 0;
      el.volume = baseVolume;
    };
    const playing = el.play();
    // Older browsers return undefined rather than a promise.
    if (playing && typeof playing.then === "function") {
      playing.then(settle).catch(() => {});
    } else {
      settle();
    }
  }, [trackUrls, baseVolume]);

  const handleEnded = useCallback(() => {
    if (indexRef.current + 1 < trackUrls.length) {
      playIndex(indexRef.current + 1);
    }
  }, [trackUrls, playIndex]);

  return {
    audioRef,
    start,
    prime,
    handleEnded,
    currentIndex,
    trackCount: trackUrls.length,
  };
}
