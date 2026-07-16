"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { OCCASIONS, PACKAGES, PackageKey } from "@/lib/constants";
import { Loader2, Sparkles, KeyRound } from "lucide-react";

const SECRET_KEY = "cardlar_admin_secret";

export default function AdminPage() {
  const [occasion, setOccasion] = useState("birthday");
  const [customOccasionName, setCustomOccasionName] = useState("");
  const [packageType, setPackageType] = useState<PackageKey>("full");
  const [showWatermark, setShowWatermark] = useState(false);
  const [adminSecret, setAdminSecret] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Remember the secret so it survives reloads (owner convenience).
  useEffect(() => {
    const saved = localStorage.getItem(SECRET_KEY);
    if (saved) setAdminSecret(saved);
  }, []);

  const handleCreate = async () => {
    setIsLoading(true);
    setError(null);
    if (adminSecret) localStorage.setItem(SECRET_KEY, adminSecret);

    try {
      const res = await fetch("/api/admin/create-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageType,
          occasion,
          showWatermark,
          ...(occasion === "custom" && customOccasionName
            ? { customOccasionName }
            : {}),
          ...(adminSecret ? { adminSecret } : {}),
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Failed to create card");
        setIsLoading(false);
      }
    } catch {
      setError("Request failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/30">
            <Sparkles className="w-3.5 h-3.5" />
            Owner Mode
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-1">Create a free card</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Bypasses payment. The card is fully unlocked and shareable like any
          other.
        </p>

        {/* Occasion */}
        <label className="block text-sm font-medium mb-2">Occasion</label>
        <select
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          {OCCASIONS.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.icon} {o.name}
            </option>
          ))}
        </select>

        {occasion === "custom" && (
          <input
            type="text"
            value={customOccasionName}
            onChange={(e) => setCustomOccasionName(e.target.value)}
            placeholder="Name your custom occasion"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        )}

        {/* Package */}
        <label className="block text-sm font-medium mb-2">Package</label>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(Object.entries(PACKAGES) as [PackageKey, (typeof PACKAGES)[PackageKey]][]).map(
            ([key, pkg]) => (
              <button
                key={key}
                onClick={() => setPackageType(key)}
                className={`text-left p-3 rounded-lg border-2 transition-all ${
                  packageType === key
                    ? "border-accent bg-accent/10"
                    : "border-border hover:border-accent/30"
                }`}
              >
                <p className="text-sm font-medium">{pkg.name}</p>
                <p className="text-xs text-muted-foreground">
                  {pkg.priceDisplay}
                </p>
              </button>
            )
          )}
        </div>

        {/* Watermark */}
        <label className="flex items-center gap-2 mb-6 text-sm">
          <input
            type="checkbox"
            checked={showWatermark}
            onChange={(e) => setShowWatermark(e.target.checked)}
            className="w-4 h-4 accent-[var(--accent)]"
          />
          Show &ldquo;Made with Cardlar&rdquo; watermark
        </label>

        {/* Admin secret */}
        <label className="block text-sm font-medium mb-2">
          Admin secret
          <span className="font-normal text-muted-foreground">
            {" "}
            — required in production, optional in dev
          </span>
        </label>
        <div className="relative mb-6">
          <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="password"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            placeholder="ADMIN_SECRET"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        <Button
          onClick={handleCreate}
          disabled={isLoading}
          size="lg"
          className="w-full h-12"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Create free card
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
