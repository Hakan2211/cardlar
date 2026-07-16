"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { PackageInfo, PackageKey } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PackageCardProps {
  packageKey: PackageKey;
  pkg: PackageInfo;
  isSelected: boolean;
  onSelect: (key: PackageKey) => void;
  index: number;
}

export function PackageCard({
  packageKey,
  pkg,
  isSelected,
  onSelect,
  index,
}: PackageCardProps) {
  const badgeLabel =
    packageKey === "story"
      ? "Most Magical"
      : packageKey === "full"
      ? "Best Value"
      : null;
  const isBestValue = badgeLabel !== null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(packageKey)}
      className={cn(
        "relative rounded-xl border-2 p-6 cursor-pointer transition-all duration-200 bg-card",
        isSelected
          ? "border-accent shadow-md"
          : "border-border hover:border-accent/30 hover:shadow-sm",
        isBestValue && "ring-1 ring-accent/30"
      )}
    >
      {badgeLabel && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full tracking-wide">
          {badgeLabel}
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">{pkg.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
        </div>
        <div
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 transition-colors",
            isSelected ? "border-accent bg-accent" : "border-border"
          )}
        >
          {isSelected && <Check className="w-4 h-4 text-accent-foreground" />}
        </div>
      </div>

      <div className="mb-4">
        <span
          className="text-3xl font-bold"
          style={{ fontFamily: "var(--font-heading), 'Playfair Display', Georgia, serif" }}
        >
          {pkg.priceDisplay}
        </span>
        <span className="text-muted-foreground text-sm ml-1.5">one-time</span>
      </div>

      <ul className="space-y-2">
        {pkg.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-accent flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
