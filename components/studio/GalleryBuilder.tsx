"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { ImageGenerator } from "./ImageGenerator";
import { CardImage } from "@/lib/media";
import {
  OCCASION_STYLES,
  MAX_IMAGE_REGENERATIONS,
  OccasionKey,
  StylePreset,
} from "@/lib/constants";
import {
  GripVertical,
  Plus,
  Trash2,
  ImageIcon,
  Sparkles,
  Loader2,
  X,
} from "lucide-react";

interface GalleryBuilderProps {
  occasion: string;
  slug: string;
  imageRegenCount: number;
  unlimited: boolean;
  // How many photos this package allows (1 for all tiers except Story).
  maxImages: number;
  initialImages: CardImage[];
  onPhotoUploaded: (file: File) => Promise<string>;
  // Persist the full ordered list (also mirrors slot 0 into the cover).
  onPersist: (images: CardImage[]) => Promise<void> | void;
  // Count an AI generation against the regen cap; throws when capped.
  onCountRegen: () => Promise<void>;
}

function MomentRow({
  image,
  index,
  canRestyle,
  isRestyling,
  onCaption,
  onDate,
  onRemove,
  onRestyle,
}: {
  image: CardImage;
  index: number;
  canRestyle: boolean;
  isRestyling: boolean;
  onCaption: (v: string) => void;
  onDate: (v: string) => void;
  onRemove: () => void;
  onRestyle: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={image}
      dragListener={false}
      dragControls={controls}
      className="flex gap-3 items-start p-3 rounded-xl border border-border bg-card"
    >
      <button
        onPointerDown={(e) => controls.start(e)}
        className="mt-8 cursor-grab active:cursor-grabbing text-muted-foreground touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="relative w-24 flex-shrink-0">
        <img
          src={image.url}
          alt={image.caption || `Moment ${index + 1}`}
          className="w-24 h-18 aspect-[4/3] object-cover rounded-lg border border-border"
        />
        {index === 0 && (
          <span className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-full bg-accent text-[10px] font-semibold text-white shadow">
            Cover
          </span>
        )}
        {isRestyling && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <input
          type="text"
          defaultValue={image.caption || ""}
          onBlur={(e) => onCaption(e.target.value)}
          placeholder="Caption (e.g. The day we met)"
          maxLength={80}
          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <input
          type="text"
          defaultValue={image.dateLabel || ""}
          onBlur={(e) => onDate(e.target.value)}
          placeholder="Date label (e.g. Summer 2019)"
          maxLength={40}
          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="mt-1 flex flex-col gap-2">
        {canRestyle && (
          <button
            onClick={onRestyle}
            disabled={isRestyling}
            className="text-muted-foreground hover:text-accent transition-colors disabled:opacity-40"
            aria-label="Restyle this photo with AI"
            title="Restyle with AI"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive transition-colors"
          aria-label="Remove moment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Reorder.Item>
  );
}

export function GalleryBuilder({
  occasion,
  slug,
  imageRegenCount,
  unlimited,
  maxImages,
  initialImages,
  onPhotoUploaded,
  onPersist,
  onCountRegen,
}: GalleryBuilderProps) {
  // A single-photo package hides the timeline framing; multi-photo shows it.
  const isTimeline = maxImages > 1;
  const [items, setItems] = useState<CardImage[]>(initialImages);
  // Batch uploads resolve over many seconds, long after the callback that
  // started them captured `items`. Append from this ref instead of that
  // stale snapshot.
  const itemsRef = useRef<CardImage[]>(initialImages);
  const [showAdd, setShowAdd] = useState(initialImages.length === 0);
  const [addError, setAddError] = useState<string | null>(null);
  // Set when writing the gallery to the card failed. The photos are still in
  // local state, so without this the sender sees a finished timeline that was
  // never actually saved.
  const [saveError, setSaveError] = useState(false);
  const [retrying, setRetrying] = useState(false);

  // Which photo the style picker is open for, and whether a style is being
  // applied to it. Styling is optional and always happens *after* the photo is
  // already saved to the card, so abandoning it mid-way loses nothing.
  const [restyleIndex, setRestyleIndex] = useState<number | null>(null);
  const [restyling, setRestyling] = useState(false);
  const [restyleError, setRestyleError] = useState<string | null>(null);

  // Maps a styled photo's URL back to the photo it was made from, so restyling
  // the same moment twice always starts from the untouched original instead of
  // stacking one AI edit on top of another. Session-scoped: an unmapped URL is
  // simply treated as its own original.
  const originalsRef = useRef<Record<string, string>>({});

  // Keep in sync if the card loads/changes underneath us (first mount).
  useEffect(() => {
    if (items.length === 0 && initialImages.length > 0) {
      itemsRef.current = initialImages;
      setItems(initialImages);
      setShowAdd(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImages]);

  const persist = useCallback(
    (next: CardImage[]) => {
      itemsRef.current = next;
      setItems(next);
      Promise.resolve(onPersist(next)).then(
        () => setSaveError(false),
        (e) => {
          console.error("Failed to save gallery:", e);
          setSaveError(true);
        }
      );
    },
    [onPersist]
  );

  // Re-send whatever is on screen now, not the list that failed earlier.
  const retrySave = useCallback(async () => {
    setRetrying(true);
    try {
      await onPersist(itemsRef.current);
      setSaveError(false);
    } catch (e) {
      console.error("Failed to save gallery:", e);
    } finally {
      setRetrying(false);
    }
  }, [onPersist]);

  const styles: StylePreset[] = OCCASION_STYLES[occasion as OccasionKey] || [];
  const regensLeft = MAX_IMAGE_REGENERATIONS - imageRegenCount;
  const canRestyle = styles.length > 0 && (unlimited || regensLeft > 0);

  // Replace one photo with an AI-styled version of itself. "Original" simply
  // restores the untouched upload and costs nothing.
  const applyStyle = useCallback(
    async (index: number, style: StylePreset | null) => {
      const target = itemsRef.current[index];
      if (!target) return;
      const source = originalsRef.current[target.url] ?? target.url;

      const commit = (url: string, src: string) => {
        originalsRef.current[url] = source;
        persist(
          itemsRef.current.map((it, i) =>
            i === index ? { ...it, url, source: src } : it
          )
        );
      };

      // Restore the original — free, no AI call.
      if (!style) {
        setRestyleError(null);
        setRestyleIndex(null);
        if (source !== target.url) commit(source, "upload");
        return;
      }

      setRestyling(true);
      setRestyleError(null);
      try {
        await onCountRegen();
      } catch {
        setRestyling(false);
        setRestyleError(
          "You've used all AI generations. The photo is unchanged."
        );
        return;
      }

      try {
        const response = await fetch("/api/edit-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: source,
            prompt: style.editPrompt,
            slug,
          }),
        });
        const data = await response.json();
        if (data.error || !data.imageUrl) {
          setRestyleError(data.error || "Couldn't apply that style.");
        } else {
          commit(data.imageUrl, "edited");
          setRestyleIndex(null);
        }
      } catch {
        setRestyleError("Couldn't apply that style. Please try again.");
      } finally {
        setRestyling(false);
      }
    },
    [onCountRegen, persist, slug]
  );

  const atMax = items.length >= maxImages;

  const handleGenerated = useCallback(
    async (
      url: string,
      _prompt: string,
      meta?: { originalPhotoUrl?: string; imageStyle?: string; skipRegen?: boolean }
    ) => {
      setAddError(null);
      // AI generations count against the cap; direct uploads are free.
      if (!meta?.skipRegen) {
        try {
          await onCountRegen();
        } catch {
          setAddError("You've used all AI generations. Upload photos instead.");
          return;
        }
      }
      const source = meta?.skipRegen
        ? "upload"
        : meta?.imageStyle && meta.imageStyle !== "original"
        ? "edited"
        : "generated";
      // Append from the ref, not the render snapshot: an AI generation resolves
      // many seconds after the click that started it, by which time a batch
      // upload may already have added photos.
      const next = [
        ...itemsRef.current,
        { url, caption: "", dateLabel: "", source },
      ];
      if (next.length > maxImages) return;
      persist(next);
      if (next.length >= maxImages) setShowAdd(false);
    },
    [maxImages, onCountRegen, persist]
  );

  // Direct uploads never cost a generation, so a batch goes straight in.
  const handleBulkUploaded = useCallback(
    (urls: string[]) => {
      const room = maxImages - itemsRef.current.length;
      if (room <= 0) return;
      const added = urls.slice(0, room).map((url) => ({
        url,
        caption: "",
        dateLabel: "",
        source: "upload",
      }));
      const next = [...itemsRef.current, ...added];
      persist(next);
      if (next.length >= maxImages) setShowAdd(false);
    },
    [maxImages, persist]
  );

  const updateAt = (index: number, patch: Partial<CardImage>) => {
    persist(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const removeAt = (index: number) => {
    persist(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      {saveError && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2.5">
          <p className="text-sm text-destructive">
            Your photos aren&apos;t saved yet — the recipient won&apos;t see
            them until this succeeds.
          </p>
          <button
            onClick={retrySave}
            disabled={retrying}
            className="flex-shrink-0 rounded-lg border border-destructive/40 px-2.5 py-1 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            {retrying ? "Saving..." : "Retry"}
          </button>
        </div>
      )}

      {/* Current moments */}
      {items.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">
              {isTimeline
                ? `Your timeline · ${items.length}/${maxImages}`
                : "Your photo"}
            </p>
            {isTimeline && (
              <p className="text-xs text-muted-foreground">Drag to reorder</p>
            )}
          </div>
          <Reorder.Group
            axis="y"
            values={items}
            onReorder={persist}
            className="space-y-2"
          >
            {items.map((image, index) => (
              <MomentRow
                key={image.url}
                image={image}
                index={index}
                canRestyle={canRestyle}
                isRestyling={restyling && restyleIndex === index}
                onCaption={(v) => updateAt(index, { caption: v })}
                onDate={(v) => updateAt(index, { dateLabel: v })}
                onRemove={() => removeAt(index)}
                onRestyle={() => {
                  setRestyleError(null);
                  setRestyleIndex(restyleIndex === index ? null : index);
                }}
              />
            ))}
          </Reorder.Group>

          {restyleIndex !== null && items[restyleIndex] && (
            <div className="mt-3 rounded-xl border border-border bg-muted/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Restyle photo {restyleIndex + 1} with AI
                </span>
                <button
                  onClick={() => setRestyleIndex(null)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Close style picker"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="mb-3 text-xs text-muted-foreground">
                Optional — your photo is already saved.{" "}
                {unlimited
                  ? "Styles are unlimited on this card."
                  : `Each style uses one of your ${regensLeft} remaining AI generation${
                      regensLeft === 1 ? "" : "s"
                    }.`}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => applyStyle(restyleIndex, style)}
                    disabled={restyling}
                    className="flex flex-col items-center gap-1.5 rounded-lg border-2 border-border p-3 text-center transition-all hover:border-accent/40 hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-2xl">{style.icon}</span>
                    <span className="text-xs font-medium leading-tight">
                      {style.name}
                    </span>
                  </button>
                ))}
              </div>

              {originalsRef.current[items[restyleIndex].url] && (
                <button
                  onClick={() => applyStyle(restyleIndex, null)}
                  disabled={restyling}
                  className="mt-3 w-full rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 disabled:opacity-50"
                >
                  Back to my original photo (free)
                </button>
              )}

              {restyleError && (
                <p className="mt-2 text-sm text-destructive">{restyleError}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add-a-moment toggle */}
      {!atMax && !showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-accent/40 hover:text-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add {items.length === 0 ? "your first photo" : "another moment"}
        </button>
      )}

      {atMax && isTimeline && (
        <p className="text-xs text-center text-muted-foreground">
          Maximum of {maxImages} photos reached.
        </p>
      )}
      {atMax && !isTimeline && (
        <p className="text-xs text-center text-muted-foreground">
          Want a scrolling photo story? Upgrade to the Story package for up to 20
          photos.
        </p>
      )}

      {showAdd && !atMax && (
        <div className="rounded-xl border border-border p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <ImageIcon className="w-4 h-4 text-accent" />
              Add a moment
            </span>
            {items.length > 0 && (
              <button
                onClick={() => setShowAdd(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Done
              </button>
            )}
          </div>
          {addError && (
            <p className="text-sm text-destructive mb-2">{addError}</p>
          )}
          <ImageGenerator
            occasion={occasion}
            imageUrl={null}
            imageRegenCount={imageRegenCount}
            onImageGenerated={handleGenerated}
            onPhotoUploaded={onPhotoUploaded}
            slug={slug}
            appendMode
            unlimited={unlimited}
            onImagesUploaded={isTimeline ? handleBulkUploaded : undefined}
            remainingSlots={maxImages - items.length}
          />
        </div>
      )}
    </div>
  );
}
