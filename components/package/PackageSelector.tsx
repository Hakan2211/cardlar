"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PackageCard } from "./PackageCard";
import { WatermarkToggle } from "./WatermarkToggle";
import { Button } from "@/components/ui/button";
import { PACKAGES, OCCASIONS, PackageKey } from "@/lib/constants";
import { Logo } from "@/components/shared/Logo";
import { ArrowLeft, Loader2 } from "lucide-react";

export function PackageSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const occasion = searchParams.get("occasion") || "birthday";
  const customOccasionName = searchParams.get("customOccasionName") || undefined;
  const occasionData = OCCASIONS.find((o) => o.slug === occasion);

  const [selectedPackage, setSelectedPackage] = useState<PackageKey>("full");
  const [showWatermark, setShowWatermark] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageType: selectedPackage,
          occasion,
          showWatermark,
          ...(customOccasionName ? { customOccasionName } : {}),
        }),
      });

      // A platform-level failure can return HTML, not JSON.
      const data = await response.json().catch(() => null);

      if (response.ok && data?.url) {
        window.location.href = data.url;
        return;
      }

      // Never fail silently here: a customer who sees nothing happen just
      // leaves. Show them what went wrong.
      console.error("Checkout failed", {
        status: response.status,
        code: data?.code,
        error: data?.error,
      });
      toast.error(
        data?.error ??
          "We couldn't start checkout. Please try again — no charge was made."
      );
      setIsLoading(false);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        "We couldn't reach the payment service. Check your connection and try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Logo size="sm" />
          <a
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Occasion Badge */}
        {occasionData && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm font-medium border border-border">
              <span className="text-xl">{occasionData.icon}</span>
              {occasion === "custom" && customOccasionName
                ? customOccasionName
                : occasionData.name}
            </span>
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-center mb-2"
        >
          Choose Your Package
        </motion.h1>
        <p className="text-center text-muted-foreground mb-10">
          Select what you want to include in your card
        </p>

        {/* Package Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {(Object.entries(PACKAGES) as [PackageKey, typeof PACKAGES[PackageKey]][]).map(
            ([key, pkg], index) => (
              <PackageCard
                key={key}
                packageKey={key}
                pkg={pkg}
                isSelected={selectedPackage === key}
                onSelect={setSelectedPackage}
                index={index}
              />
            )
          )}
        </div>

        {/* Watermark Toggle */}
        <div className="mb-8">
          <WatermarkToggle
            showWatermark={showWatermark}
            onChange={setShowWatermark}
          />
        </div>

        {/* Checkout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="sticky bottom-4 z-10"
        >
          <Button
            onClick={handleCheckout}
            disabled={isLoading}
            size="lg"
            className="w-full text-lg h-14 rounded-xl shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Payment &mdash; {PACKAGES[selectedPackage].priceDisplay}
              </>
            )}
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
