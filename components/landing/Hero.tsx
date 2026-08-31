"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 px-4 text-center">
      {/* Subtle warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/[0.04] via-transparent to-transparent" />

      {/* Decorative gold dots */}
      <motion.div
        className="absolute top-24 left-[15%] w-1.5 h-1.5 rounded-full bg-accent/30"
        animate={{ y: [0, -8, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-40 right-[20%] w-2 h-2 rounded-full bg-accent/20"
        animate={{ y: [0, -10, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />
      <motion.div
        className="absolute bottom-28 left-[25%] w-1 h-1 rounded-full bg-accent/25"
        animate={{ y: [0, -6, 0], opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-40 right-[15%] w-1.5 h-1.5 rounded-full bg-accent/20"
        animate={{ y: [0, -12, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 4.5, repeat: Infinity, delay: 2 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 max-w-3xl mx-auto"
      >
        <Logo size="lg" className="mb-8" />

        <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-5 leading-tight">
          Send Personalized{" "}
          <span
            className="bg-gradient-to-r from-accent/80 via-accent to-accent/80 bg-clip-text text-transparent"
          >
            E-Cards
          </span>{" "}
          That Wow
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Create stunning AI-generated cards with photo stories, voice messages,
          and music. Share the perfect greeting in just minutes.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="#occasions"
            className="inline-flex items-center justify-center h-13 px-10 text-base font-medium rounded-lg bg-primary text-primary-foreground shadow-md hover:bg-primary/85 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            Create Your Card
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center h-13 px-10 text-base font-medium rounded-lg border border-border text-foreground hover:bg-muted hover:border-accent/40 transition-all duration-200"
          >
            How It Works
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
