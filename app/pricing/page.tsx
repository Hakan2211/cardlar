import { Check, Sparkles, Image, Mic, Music, Images, ArrowLeft } from "lucide-react";
import { PACKAGES, PackageKey } from "@/lib/constants";
import { Logo } from "@/components/shared/Logo";
import { FAQ } from "@/components/pricing/FAQ";
import Link from "next/link";

export const metadata = {
  title: "Pricing - Cardlar",
  description:
    "Simple, transparent pricing for personalized digital greeting cards. Starting at just $1.99. No subscriptions, no hidden fees.",
};

const packageOrder: PackageKey[] = ["basic", "voice", "music", "full", "story"];

const packageIcons: Record<PackageKey, React.ReactNode> = {
  basic: <Image className="w-5 h-5" />,
  voice: <Mic className="w-5 h-5" />,
  music: <Music className="w-5 h-5" />,
  full: <Sparkles className="w-5 h-5" />,
  story: <Images className="w-5 h-5" />,
};

// Emphasized tiers and their badge labels.
const packageBadge: Partial<Record<PackageKey, string>> = {
  full: "Best Value",
  story: "Most Magical",
};

const allPlansFeatures = [
  "AI-generated card image",
  "Upload your own photo option",
  "Style presets for every occasion",
  "Custom text message",
  "Up to 3 image regenerations",
  "Shareable link",
  "Mobile-friendly card viewer",
  "Envelope opening animation",
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <Logo size="sm" />
          <Link
            href="/#occasions"
            className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            Create Card
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One-time payment per card. No subscriptions. No hidden fees.
            <br />
            <span className="text-accent font-medium">Starting at just $1.99</span>
          </p>
        </div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-16">
          {packageOrder.map((key) => {
            const pkg = PACKAGES[key];
            const badge = packageBadge[key];
            const featured = !!badge;

            return (
              <div
                key={key}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                  featured
                    ? "border-accent shadow-md ring-1 ring-accent/20 bg-card"
                    : "border-border bg-card hover:border-accent/30 hover:shadow-sm"
                }`}
              >
                {/* Featured badge */}
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap px-3 py-1 rounded-full bg-accent text-white text-xs font-semibold shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      {badge}
                    </span>
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-2.5 mb-3 mt-1">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      featured
                        ? "bg-accent/15 text-accent"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {packageIcons[key]}
                  </div>
                  <h3 className="font-heading font-semibold text-foreground">
                    {pkg.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="mb-3">
                  <span className="text-3xl font-heading font-bold text-foreground">
                    {pkg.priceDisplay}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1.5">
                    one-time
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-5">
                  {pkg.description}
                </p>

                {/* Features */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href="/#occasions"
                  className={`inline-flex items-center justify-center h-10 px-4 text-sm font-medium rounded-lg transition-all ${
                    featured
                      ? "bg-accent text-white hover:bg-accent/90"
                      : "border border-border text-foreground hover:bg-muted hover:border-accent/40"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            );
          })}
        </div>

        {/* All Plans Include */}
        <div className="rounded-2xl border border-border bg-card p-8 mb-8">
          <h2 className="text-xl font-heading font-bold text-foreground mb-6 text-center">
            Included in Every Plan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {allPlansFeatures.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2.5 text-sm text-foreground/80"
              >
                <Check className="w-4 h-4 text-accent flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto">
            <FAQ />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-8">
          <h2 className="text-2xl font-heading font-bold text-foreground mb-3">
            Ready to create your card?
          </h2>
          <p className="text-muted-foreground mb-6">
            Choose an occasion and get started in minutes.
          </p>
          <Link
            href="/#occasions"
            className="inline-flex items-center justify-center h-13 px-10 text-base font-medium rounded-lg bg-primary text-primary-foreground shadow-md hover:bg-primary/85 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            Create Your Card
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border text-center">
        <Logo size="sm" className="mb-2" />
        <p className="text-sm text-muted-foreground">
          Personalized digital greeting cards powered by{" "}
          <a
            href="https://hakanda.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent/70 hover:text-accent transition-colors"
          >
            hakanda.com
          </a>
        </p>
      </footer>
    </div>
  );
}
