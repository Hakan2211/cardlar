"use client";

import { useCallback, useRef, useState } from "react";

// Sequential multi-track playback driven by a single <audio> element.
//
// Why one element: on iOS Safari, audio is "unlocked" per-element by a user
// gesture. Reusing the same element (swapping .src) across tracks keeps it
// unlocked, whereas playing a freshly-created element later would be blocked.
// The last track loops natively; earlier tracks advance on `ended`.
//
// Ducking lowers the volume while a voice message plays over the music.
export function useSoundtrack(trackUrls: string[], baseVolume = 0.3) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);
  const duckedRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const targetVolume = useCallback(
    () => (duckedRef.current ? baseVolume * 0.33 : baseVolume),
    [baseVolume]
  );

  const playIndex = useCallback(
    (i: number) => {
      const el = audioRef.current;
      if (!el || !trackUrls[i]) return;
      indexRef.current = i;
      setCurrentIndex(i);
      el.src = trackUrls[i];
      el.loop = i === trackUrls.length - 1; // loop only the final track
      el.volume = targetVolume();
      el.play().catch(() => {});
    },
    [trackUrls, targetVolume]
  );

  // Call inside the open-tap handler so the element is unlocked by the gesture.
  const start = useCallback(() => {
    if (trackUrls.length === 0) return;
    playIndex(0);
  }, [trackUrls, playIndex]);

  const handleEnded = useCallback(() => {
    if (indexRef.current + 1 < trackUrls.length) {
      playIndex(indexRef.current + 1);
    }
  }, [trackUrls, playIndex]);

  const setDucked = useCallback(
    (ducked: boolean) => {
      duckedRef.current = ducked;
      if (audioRef.current) audioRef.current.volume = targetVolume();
    },
    [targetVolume]
  );

  return {
    audioRef,
    start,
    handleEnded,
    setDucked,
    currentIndex,
    trackCount: trackUrls.length,
  };
}
