"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Envelope } from "./Envelope";
import { ParticleEffects } from "./ParticleEffects";
import { MessageDisplay } from "./MessageDisplay";
import { ScrollStory } from "./ScrollStory";
import { EndScreen } from "./EndScreen";
import { Watermark } from "./Watermark";
import { OCCASIONS } from "@/lib/constants";
import { CardImage } from "@/lib/media";
import { useSoundtrack } from "@/hooks/useSoundtrack";
import { usePhotoPalette } from "@/hooks/usePhotoPalette";

interface CardData {
  slug: string;
  occasion: string;
  customOccasionName?: string | null;
  recipientName: string;
  senderName: string;
  messageText: string;
  images: CardImage[];
  voiceUrl?: string | null;
  musicUrls: string[];
  showWatermark: boolean;
  particleEffect?: string | null;
  fontFamily?: string | null;
  messageStyle?: string | null;
}

interface ViewerExperienceProps {
  card: CardData;
  onOpen?: () => void;
}

type ViewState = "envelope" | "opening" | "revealed";

export function ViewerExperience({ card, onOpen }: ViewerExperienceProps) {
  const [viewState, setViewState] = useState<ViewState>("envelope");
  const [messageComplete, setMessageComplete] = useState(false);
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const soundtrack = useSoundtrack(card.musicUrls);

  // Pause any audio if the viewer unmounts (client-side navigation).
  useEffect(() => {
    const voiceEl = voiceRef.current;
    const musicEl = soundtrack.audioRef.current;
    return () => {
      voiceEl?.pause();
      musicEl?.pause();
    };
  }, [soundtrack.audioRef]);

  const hasImages = card.images.length > 0;

  const occasionData = OCCASIONS.find((o) => o.slug === card.occasion);
  const occasionScheme = occasionData?.colorScheme || {
    primary: "#C9A96E",
    secondary: "#F5F0E8",
    accent: "#C9A96E",
    background: "#FDFBF7",
  };
  // Tint the whole experience to the cover photo when we can sample it.
  const colorScheme = usePhotoPalette(card.images[0]?.url, occasionScheme);
  const particleType =
    card.particleEffect || occasionData?.defaultParticles || "confetti";

  const handleOpen = () => {
    setViewState("opening");
    onOpen?.();

    const hasMusic = card.musicUrls.length > 0;

    if (card.voiceUrl && voiceRef.current) {
      // The voice message leads; the soundtrack waits for it to finish (see
      // the audio element's onEnded). Prime the music element here, while the
      // open tap is still in scope — iOS Safari would block a play() issued
      // seconds later with no gesture behind it.
      if (hasMusic) soundtrack.prime();
      voiceRef.current.play().catch(() => {
        // Voice refused to start; fall back to music so the card isn't silent.
        if (hasMusic) soundtrack.start();
      });
    } else if (hasMusic) {
      // No voice to wait for — music opens the card.
      setTimeout(() => soundtrack.start(), 1000);
    }

    setTimeout(() => setViewState("revealed"), 800);
  };

  // Back to the sealed envelope; opening again restarts audio and animations.
  const handleReplay = () => {
    setMessageComplete(false);
    if (voiceRef.current) {
      voiceRef.current.pause();
      voiceRef.current.currentTime = 0;
    }
    soundtrack.audioRef.current?.pause();
    setViewState("envelope");
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background: colorScheme.background,
        transition: "background 1.2s ease",
      }}
    >
      {/* Hidden audio: the voice message plays first and the soundtrack picks
          up where it ends, so the two never talk over each other. onError
          covers a voice file that fails to load — the music still plays. */}
      {card.voiceUrl && (
        <audio
          ref={voiceRef}
          src={card.voiceUrl}
          onEnded={() => soundtrack.start()}
          onError={() => soundtrack.start()}
        />
      )}
      {card.musicUrls.length > 0 && (
        <audio ref={soundtrack.audioRef} onEnded={soundtrack.handleEnded} />
      )}

      <AnimatePresence mode="wait">
        {viewState === "envelope" && (
          <Envelope
            key="envelope"
            recipientName={card.recipientName}
            onOpen={handleOpen}
            colorScheme={colorScheme}
          />
        )}

        {(viewState === "opening" || viewState === "revealed") && hasImages && (
          <motion.div
            key="story"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen py-8"
          >
            <ParticleEffects type={particleType} colorScheme={colorScheme} />

            <ScrollStory
              images={card.images}
              messageText={card.messageText}
              recipientName={card.recipientName}
              senderName={card.senderName}
              colorScheme={colorScheme}
              onReplay={handleReplay}
              onComplete={() => setMessageComplete(true)}
            />

            <Watermark show={card.showWatermark} />
          </motion.div>
        )}

        {(viewState === "opening" || viewState === "revealed") && !hasImages && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
            className="min-h-screen flex flex-col"
          >
            <ParticleEffects type={particleType} colorScheme={colorScheme} />

            <div className="flex-1 max-w-lg mx-auto w-full px-4 py-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-[#E8E0D4]/40"
              >
                <MessageDisplay
                  recipientName={card.recipientName}
                  senderName={card.senderName}
                  messageText={card.messageText}
                  fontFamily={card.fontFamily || undefined}
                  messageStyle={card.messageStyle || undefined}
                  onComplete={() => setMessageComplete(true)}
                />
              </motion.div>

              {messageComplete && (
                <EndScreen
                  senderName={card.senderName}
                  accentColor={colorScheme.accent}
                  onReplay={handleReplay}
                />
              )}

              <Watermark show={card.showWatermark} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
