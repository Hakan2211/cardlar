"use client";

import { motion } from "framer-motion";
import { RotateCcw, Heart } from "lucide-react";

interface EndScreenProps {
  senderName: string;
  accentColor: string;
  onReplay: () => void;
}

// Shown once the message has fully revealed: replay the experience, or turn
// the recipient into a sender ("send one back" deep-links to a thank-you card).
export function EndScreen({ senderName, accentColor, onReplay }: EndScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", bounce: 0.25 }}
      className="mt-6 flex flex-col items-center gap-3"
    >
      <button
        onClick={onReplay}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-white/80 backdrop-blur-sm border border-black/10 shadow-sm hover:shadow transition-all text-foreground/80 hover:text-foreground"
      >
        <RotateCcw className="w-4 h-4" />
        Replay
      </button>

      <a
        href="/select-package?occasion=thank-you"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:brightness-105 transition-all"
        style={{ backgroundColor: accentColor }}
      >
        <Heart className="w-4 h-4" />
        Send {senderName || "them"} a card back
      </a>
      <p className="text-xs text-foreground/40">Made with Cardlar in minutes</p>
    </motion.div>
  );
}
