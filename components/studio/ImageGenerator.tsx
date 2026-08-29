"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  OCCASIONS,
  OCCASION_STYLES,
  OCCASION_EXAMPLES,
  MAX_IMAGE_REGENERATIONS,
  OccasionKey,
  StylePreset,
  ExampleCard,
} from "@/lib/constants";
import {
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  ImageIcon,
  Palette,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TabKey = "upload" | "examples";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
// A 50-photo batch would crawl one-at-a-time; a few in flight keeps it quick
// without hammering Convex storage.
const BULK_UPLOAD_CONCURRENCY = 4;

interface ImageGeneratorProps {
  occasion: string;
  imageUrl: string | null;
  imageRegenCount: number;
  onImageGenerated: (
    url: string,
    prompt: string,
    meta?: {
      originalPhotoUrl?: string;
      imageStyle?: string;
      skipRegen?: boolean;
    }
  ) => void;
  onPhotoUploaded: (file: File) => Promise<string>;
  slug: string;
  // Gallery mode: reset the picker after each successful add so the same
  // component can produce many images in a row.
  appendMode?: boolean;
  // Owner cards regenerate without limit.
  unlimited?: boolean;
  // Gallery mode only: receives a batch of uploaded photo URLs, in the order
  // they were picked. When present the file input accepts a multi-selection
  // and skips the style picker (batches are always used as-is).
  onImagesUploaded?: (urls: string[]) => void;
  // How many photos still fit in the gallery; a batch is trimmed to this.
  remainingSlots?: number;
}

export function ImageGenerator({
  occasion,
  imageUrl,
  imageRegenCount,
  onImageGenerated,
  onPhotoUploaded,
  slug,
  appendMode = false,
  unlimited = false,
  onImagesUploaded,
  remainingSlots,
}: ImageGeneratorProps) {
  const occasionData = OCCASIONS.find((o) => o.slug === occasion);
  const ORIGINAL_STYLE: StylePreset = {
    id: "original",
    name: "Original",
    icon: "📷",
    editPrompt: "",
    generatePrompt: "",
  };
  const styles = [ORIGINAL_STYLE, ...(OCCASION_STYLES[occasion as OccasionKey] || [])];
  const examples = OCCASION_EXAMPLES[occasion as OccasionKey] || [];

  const [activeTab, setActiveTab] = useState<TabKey>("upload");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Upload photo state
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [uploadedPhotoPreview, setUploadedPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  // Batch upload progress, e.g. { done: 12, total: 50 }. Null when idle.
  const [bulkProgress, setBulkProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StylePreset | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Example state
  const [selectedExample, setSelectedExample] = useState<ExampleCard | null>(null);

  // Custom prompt state
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const remainingGenerations = MAX_IMAGE_REGENERATIONS - imageRegenCount;
  const isDisabled = isGenerating || (!unlimited && remainingGenerations <= 0);

  // In append (gallery) mode, clear the picker so the next moment starts fresh.
  const afterGenerate = () => {
    if (!appendMode) return;
    setUploadedPhotoUrl(null);
    setUploadedPhotoPreview(null);
    setSelectedStyle(null);
    setSelectedExample(null);
    setCustomPrompt("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── File Upload Handler ────────────────────────────────────────────
  // Shared gate for both the single and batch paths. Returns null when the
  // file is usable, otherwise the reason to show the user.
  const rejectReason = (file: File): string | null => {
    if (!file.type.startsWith("image/")) return "not an image";
    if (file.size > MAX_UPLOAD_BYTES) return "over 10MB";
    return null;
  };

  // Batch path (gallery only): upload every picked photo and hand the URLs
  // back in one go. No style picker — batches go in as the originals.
  const handleBulkFiles = useCallback(
    async (files: File[]) => {
      if (!onImagesUploaded) return;

      const skipped: string[] = [];
      let accepted = files.filter((file) => {
        const reason = rejectReason(file);
        if (reason) skipped.push(`${file.name} (${reason})`);
        return !reason;
      });

      // Never overfill the gallery — trim to what still fits.
      let trimmed = 0;
      if (typeof remainingSlots === "number" && accepted.length > remainingSlots) {
        trimmed = accepted.length - remainingSlots;
        accepted = accepted.slice(0, remainingSlots);
      }

      if (accepted.length === 0) {
        setError(
          skipped.length > 0
            ? `Couldn't add: ${skipped.join(", ")}`
            : "No photos left to add."
        );
        return;
      }

      setError(null);
      setBulkProgress({ done: 0, total: accepted.length });

      // Upload a few at a time, writing each result into its own slot so the
      // gallery keeps the order the photos were picked in.
      const urls: (string | null)[] = new Array(accepted.length).fill(null);
      let next = 0;
      let done = 0;
      const worker = async () => {
        while (next < accepted.length) {
          const index = next++;
          try {
            urls[index] = await onPhotoUploaded(accepted[index]);
          } catch {
            skipped.push(`${accepted[index].name} (upload failed)`);
          }
          done += 1;
          setBulkProgress({ done, total: accepted.length });
        }
      };
      await Promise.all(
        Array.from(
          { length: Math.min(BULK_UPLOAD_CONCURRENCY, accepted.length) },
          worker
        )
      );

      setBulkProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      const uploaded = urls.filter((url): url is string => !!url);
      if (uploaded.length > 0) onImagesUploaded(uploaded);

      const notes = [...skipped];
      if (trimmed > 0) notes.push(`${trimmed} over the photo limit`);
      setError(notes.length > 0 ? `Skipped: ${notes.join(", ")}` : null);
    },
    [onImagesUploaded, onPhotoUploaded, remainingSlots]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;

      // More than one photo in gallery mode: straight into the batch path.
      if (files.length > 1 && onImagesUploaded) {
        await handleBulkFiles(files);
        return;
      }

      const file = files[0];
      const reason = rejectReason(file);
      if (reason === "not an image") {
        setError("Please select an image file (JPEG, PNG, WebP)");
        return;
      }
      if (reason) {
        setError("Image must be less than 10MB");
        return;
      }

      setError(null);
      setIsUploading(true);

      // Create a local preview immediately
      const previewUrl = URL.createObjectURL(file);
      setUploadedPhotoPreview(previewUrl);

      try {
        // Upload to Convex storage and get a public HTTPS URL back
        // This URL is what fal.ai needs (it must be publicly accessible)
        const publicUrl = await onPhotoUploaded(file);
        setUploadedPhotoUrl(publicUrl);
        setIsUploading(false);
      } catch {
        setError("Failed to upload photo. Please try again.");
        setIsUploading(false);
        setUploadedPhotoPreview(null);
      }
    },
    [onPhotoUploaded, onImagesUploaded, handleBulkFiles]
  );

  const handleRemovePhoto = () => {
    setUploadedPhotoUrl(null);
    setUploadedPhotoPreview(null);
    setSelectedStyle(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ─── Drop Zone Handler ──────────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files ?? []);
      if (files.length === 0) return;
      // Create a synthetic event to reuse the file handler (which routes a
      // multi-file drop into the batch path on its own).
      const dt = new DataTransfer();
      files.forEach((file) => dt.items.add(file));
      const syntheticEvent = {
        target: { files: dt.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(syntheticEvent);
    },
    [handleFileSelect]
  );

  // ─── Generate with Style (photo upload path) ───────────────────────
  const handleApplyStyle = async () => {
    if (!uploadedPhotoUrl || !selectedStyle) return;

    // "Original" style — use the photo directly, no AI processing
    if (selectedStyle.id === "original") {
      onImageGenerated(uploadedPhotoUrl, "original", {
        originalPhotoUrl: uploadedPhotoUrl,
        imageStyle: "original",
        skipRegen: true,
      });
      afterGenerate();
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/edit-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadedPhotoUrl,
          prompt: selectedStyle.editPrompt,
          slug,
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        onImageGenerated(data.imageUrl, selectedStyle.editPrompt, {
          originalPhotoUrl: uploadedPhotoUrl,
          imageStyle: selectedStyle.id,
        });
        afterGenerate();
      }
    } catch {
      setError("Failed to apply style. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Generate from Example (pick a design path) ────────────────────
  const handleGenerateFromExample = async (example: ExampleCard) => {
    setSelectedExample(example);
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: example.prompt, slug }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        onImageGenerated(data.imageUrl, example.prompt, {
          imageStyle: example.id,
        });
        afterGenerate();
      }
    } catch {
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Generate from Custom Prompt ────────────────────────────────────
  const handleCustomGenerate = async () => {
    if (!customPrompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: customPrompt, slug }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        onImageGenerated(data.imageUrl, customPrompt);
        afterGenerate();
      }
    } catch {
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Tab Switcher */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
            activeTab === "upload"
              ? "bg-accent/15 text-accent border-b-2 border-accent"
              : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Upload className="w-4 h-4" />
          Use Your Photo
        </button>
        <button
          onClick={() => setActiveTab("examples")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
            activeTab === "examples"
              ? "bg-accent/15 text-accent border-b-2 border-accent"
              : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Palette className="w-4 h-4" />
          Pick a Design
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === "upload" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Upload Area */}
            {bulkProgress ? (
              <div className="border-2 border-dashed border-accent/40 rounded-xl p-8 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                  <div>
                    <p className="text-sm font-medium">
                      Uploading {bulkProgress.done} of {bulkProgress.total} photos
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Keep this tab open until it finishes.
                    </p>
                  </div>
                  <div className="w-full max-w-xs h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{
                        width: `${Math.round(
                          (bulkProgress.done / bulkProgress.total) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : !uploadedPhotoPreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className=                "border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple={!!onImagesUploaded}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {onImagesUploaded
                        ? "Drop your photos here or click to upload"
                        : "Drop your photo here or click to upload"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPEG, PNG, WebP up to 10MB
                      {onImagesUploaded ? " · pick several at once" : ""}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="rounded-xl overflow-hidden border border-border">
                  {isUploading ? (
                    <div className="w-full aspect-[4/3] flex items-center justify-center bg-muted">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <img
                      src={uploadedPhotoPreview}
                      alt="Your photo"
                      className="w-full aspect-[4/3] object-cover"
                    />
                  )}
                </div>
                <button
                  onClick={handleRemovePhoto}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Style Selection */}
            {uploadedPhotoPreview && !isUploading && (
              <div>
                <p className="text-sm font-medium mb-3">Choose a style:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style)}
                      disabled={style.id !== "original" && isDisabled}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center ${
                        selectedStyle?.id === style.id
                          ? "border-accent bg-accent/10 shadow-sm"
                          : "border-border hover:border-accent/30 hover:bg-muted/30"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className="text-2xl">{style.icon}</span>
                      <span className="text-xs font-medium leading-tight">
                        {style.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Apply Style / Use Photo Button */}
                <Button
                  onClick={handleApplyStyle}
                  disabled={
                    !selectedStyle ||
                    !uploadedPhotoUrl ||
                    (selectedStyle.id !== "original" && isDisabled)
                  }
                  className="w-full mt-3"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Applying Style...
                    </>
                  ) : selectedStyle?.id === "original" ? (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Use My Photo
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      {selectedStyle
                        ? `Apply ${selectedStyle.name} Style`
                        : "Select a Style"}
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "examples" && (
          <motion.div
            key="examples"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">
              Pick a design and we&apos;ll create a unique card image for you:
            </p>

            {/* Example Cards Grid */}
            <div className="grid grid-cols-3 gap-3">
              {examples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => handleGenerateFromExample(example)}
                  disabled={isDisabled}
                  className={`group relative rounded-xl border-2 overflow-hidden transition-all ${
                    selectedExample?.id === example.id && isGenerating
                      ? "border-accent ring-2 ring-accent/20"
                      : "border-border hover:border-accent/40"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {/* Thumbnail with fallback */}
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    <img
                      src={example.thumbnailUrl}
                      alt={example.label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to a colored placeholder with the occasion icon
                        const target = e.target as HTMLImageElement;
                        const occasionInfo = occasionData;
                        const bg = occasionInfo?.colorScheme.primary || "#C9A96E";
                        target.src = `https://placehold.co/400x300/${bg.slice(1)}/white?text=${encodeURIComponent(example.label)}&font=playfair-display`;
                      }}
                    />
                    {/* Generating overlay */}
                    {selectedExample?.id === example.id && isGenerating && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="p-2 text-center">
                    <p className="text-xs font-medium truncate">
                      {example.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {example.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Prompt (Collapsible) */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => setShowCustomPrompt(!showCustomPrompt)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Describe your own image (advanced)
          </span>
          {showCustomPrompt ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        <AnimatePresence>
          {showCustomPrompt && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe the image you want for your card..."
                  className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50"
                />

                {/* Quick suggestion pills from occasion data */}
                {occasionData && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Suggestions:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {occasionData.suggestedImagePrompts.map(
                        (suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setCustomPrompt(suggestion);
                            }}
                            disabled={isDisabled}
                            className="text-[11px] px-2.5 py-1 rounded-full border border-border hover:bg-accent/10 hover:border-accent/30 transition-colors disabled:opacity-50"
                          >
                            {suggestion.slice(0, 40)}...
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCustomGenerate}
                  disabled={isDisabled || !customPrompt.trim()}
                  className="w-full"
                  size="sm"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate from Description
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Remaining Generations */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {unlimited
            ? "Unlimited generations (owner)"
            : `${remainingGenerations} AI generation${
                remainingGenerations !== 1 ? "s" : ""
              } remaining${appendMode ? " · uploads are free" : ""}`}
        </span>
        {imageUrl && !appendMode && (
          <span className="flex items-center gap-1 text-accent">
            <RefreshCw className="w-3 h-3" />
            Image ready
          </span>
        )}
      </div>

      {/* Error Display */}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Generated Image Preview (single-image mode only; gallery shows its own list) */}
      <AnimatePresence mode="wait">
        {imageUrl && !appendMode && (
          <motion.div
            key={imageUrl}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-xl overflow-hidden border border-border shadow-lg"
          >
            <img
              src={imageUrl}
              alt="Generated card"
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="bg-muted/30 px-4 py-2 text-center">
              <p className="text-xs text-muted-foreground">
                Your card image preview
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
