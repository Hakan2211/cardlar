"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { ImageGenerator } from "./ImageGenerator";
import { CardImage } from "@/lib/media";
import { GripVertical, Plus, Trash2, ImageIcon } from "lucide-react";

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
  onCaption,
  onDate,
  onRemove,
}: {
  image: CardImage;
  index: number;
  onCaption: (v: string) => void;
  onDate: (v: string) => void;
  onRemove: () => void;
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

      <button
        onClick={onRemove}
        className="mt-1 text-muted-foreground hover:text-destructive transition-colors"
        aria-label="Remove moment"
      >
        <Trash2 className="w-4 h-4" />
      </button>
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
  // A single-photo package hides the timeline framing; Story shows it.
  const isTimeline = maxImages > 1;
  const [items, setItems] = useState<CardImage[]>(initialImages);
  // Batch uploads resolve over many seconds, long after the callback that
  // started them captured `items`. Append from this ref instead of that
  // stale snapshot.
  const itemsRef = useRef<CardImage[]>(initialImages);
  const [showAdd, setShowAdd] = useState(initialImages.length === 0);
  const [addError, setAddError] = useState<string | null>(null);

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
      void onPersist(next);
    },
    [onPersist]
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
      persist([...items, { url, caption: "", dateLabel: "", source }]);
      if (items.length + 1 >= maxImages) setShowAdd(false);
    },
    [items, maxImages, onCountRegen, persist]
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
                onCaption={(v) => updateAt(index, { caption: v })}
                onDate={(v) => updateAt(index, { dateLabel: v })}
                onRemove={() => removeAt(index)}
              />
            ))}
          </Reorder.Group>
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
          Want a scrolling photo story? Upgrade to the Story package for up to 10
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
