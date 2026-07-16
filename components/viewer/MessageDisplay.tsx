"use client";

import { motion } from "framer-motion";

interface MessageDisplayProps {
  recipientName: string;
  senderName: string;
  messageText: string;
  fontFamily?: string;
  messageStyle?: string; // "fade-words" (default) | "handwritten"
  onComplete?: () => void; // fires once the signature has revealed
}

const SCRIPT_FONT = "var(--font-script), 'Caveat', cursive";

export function MessageDisplay({
  recipientName,
  senderName,
  messageText,
  messageStyle,
  onComplete,
}: MessageDisplayProps) {
  const handwritten = messageStyle === "handwritten";
  const words = messageText.split(" ");
  const charCount = messageText.length;

  // Handwritten reveals per character; cap the pace so long letters still
  // finish "writing" in about six seconds.
  const perChar = Math.min(0.055, 6 / Math.max(charCount, 1));
  const bodyDuration = handwritten ? charCount * perChar : words.length * 0.08;
  const signatureDelay = 1 + bodyDuration + 0.5;

  let charOffset = 0;

  return (
    <div className="text-center py-8 px-4">
      <motion.p
        className="text-xl font-heading italic text-foreground/80 mb-4"
        style={handwritten ? { fontFamily: SCRIPT_FONT, fontSize: "1.6rem" } : undefined}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Dear {recipientName},
      </motion.p>

      {handwritten ? (
        <div
          className="text-2xl leading-relaxed text-foreground mb-6"
          style={{ fontFamily: SCRIPT_FONT }}
        >
          {words.map((word, wi) => {
            const start = charOffset;
            charOffset += word.length + 1; // +1 for the following space
            return (
              <span key={wi} className="inline-block whitespace-nowrap mr-1.5">
                {Array.from(word).map((char, ci) => (
                  <motion.span
                    key={ci}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: 1 + (start + ci) * perChar,
                      duration: 0.15,
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            );
          })}
        </div>
      ) : (
        <div className="text-base md:text-lg leading-relaxed text-foreground mb-6">
          {words.map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1 + index * 0.08,
                duration: 0.3,
              }}
              className="inline-block mr-1"
            >
              {word}
            </motion.span>
          ))}
        </div>
      )}

      <motion.p
        className="text-base font-heading italic text-foreground/80"
        style={handwritten ? { fontFamily: SCRIPT_FONT, fontSize: "1.35rem" } : undefined}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: signatureDelay }}
        onAnimationComplete={onComplete}
      >
        With love,
        <br />
        <span
          className="text-lg font-heading font-semibold not-italic"
          style={handwritten ? { fontFamily: SCRIPT_FONT, fontSize: "1.6rem" } : undefined}
        >
          {senderName}
        </span>
      </motion.p>
    </div>
  );
}
