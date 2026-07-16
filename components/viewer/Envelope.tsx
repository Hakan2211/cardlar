"use client";

import { motion } from "framer-motion";

interface EnvelopeProps {
  recipientName: string;
  onOpen: () => void;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

export function Envelope({ recipientName, onOpen, colorScheme }: EnvelopeProps) {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-4 cursor-pointer"
      style={{ background: colorScheme.background }}
      onClick={onOpen}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
    >
      {/* Envelope */}
      <motion.div
        className="relative w-full max-w-sm aspect-[4/3]"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
      >
        {/* Envelope body */}
        <div
          className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: colorScheme.primary + "15" }}
        >
          {/* Envelope flap (triangle) */}
          <div
            className="absolute top-0 left-0 right-0 h-1/2"
            style={{
              backgroundImage: `linear-gradient(135deg, ${colorScheme.primary}22 25%, transparent 25%),
                           linear-gradient(225deg, ${colorScheme.primary}22 25%, transparent 25%)`,
              backgroundSize: "50% 100%",
              backgroundPosition: "left top, right top",
              backgroundRepeat: "no-repeat",
            }}
          />

          {/* Envelope center seal — gold accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: "#C9A96E" }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-2xl">💌</span>
            </motion.div>
          </div>

          {/* Recipient name */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p
              className="text-sm font-medium tracking-wide uppercase opacity-60"
              style={{
                color: colorScheme.primary,
                fontFamily: "var(--font-sans), sans-serif",
              }}
            >
              To
            </p>
            <p
              className="text-2xl font-bold mt-1"
              style={{
                color: colorScheme.primary,
                fontFamily: "var(--font-heading), 'Playfair Display', Georgia, serif",
              }}
            >
              {recipientName || "You"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tap to open */}
      <motion.p
        className="mt-10 text-base font-medium tracking-wide animate-pulse-soft"
        style={{
          color: colorScheme.primary,
          fontFamily: "var(--font-sans), sans-serif",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ delay: 1 }}
      >
        Tap to open
      </motion.p>
    </motion.div>
  );
}
