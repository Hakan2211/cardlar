"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    title: "Pick an Occasion",
    description:
      "Choose from birthdays, weddings, holidays, and more. Each occasion comes with tailored designs.",
    icon: "🎯",
  },
  {
    number: "2",
    title: "Choose Your Package",
    description:
      "Select what you want: basic card, add voice recording, AI music, or get the full experience.",
    icon: "📦",
  },
  {
    number: "3",
    title: "Quick Checkout",
    description:
      "Pay securely with Apple Pay, Google Pay, or card. Fast and frictionless.",
    icon: "💳",
  },
  {
    number: "4",
    title: "Create & Personalize",
    description:
      "Generate AI artwork, add your photos as a timeline, write your message, record your voice, and add custom music.",
    icon: "🎨",
  },
  {
    number: "5",
    title: "Share the Magic",
    description:
      "Send via WhatsApp, iMessage, or any platform. Your recipient taps to reveal a stunning animated card.",
    icon: "✨",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 bg-secondary/40">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg">
            From idea to inbox in just 5 simple steps
          </p>
        </motion.div>

        <div className="space-y-5">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="flex items-start gap-5 p-6 rounded-xl bg-card border border-border hover:border-accent/30 transition-colors duration-200"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-2xl">
                {step.icon}
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-xs font-semibold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full tracking-wide uppercase">
                    Step {step.number}
                  </span>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
