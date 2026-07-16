"use client";

import { use, useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ViewerExperience } from "@/components/viewer/ViewerExperience";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { getCardImages, getCardTracks } from "@/lib/media";

export default function CardViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const card = useQuery(api.cards.getBySlug, { slug });
  const incrementViewCount = useMutation(api.cards.incrementViewCount);
  const voiceFileUrl = useQuery(
    api.files.getFileUrl,
    card?.voiceStorageId ? { storageId: card.voiceStorageId } : "skip"
  );

  const [hasTrackedView, setHasTrackedView] = useState(false);

  const handleOpen = () => {
    if (!hasTrackedView) {
      incrementViewCount({ slug }).catch(console.error);
      setHasTrackedView(true);
    }
  };

  if (card === undefined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your card...</p>
      </div>
    );
  }

  if (card === null || card.status === "pending_payment") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Logo size="md" className="mb-4" />
        <h1 className="text-2xl font-bold mb-2">Card Not Found</h1>
        <p className="text-muted-foreground text-center">
          This card doesn&apos;t exist or isn&apos;t ready yet.
        </p>
      </div>
    );
  }

  return (
    <ViewerExperience
      card={{
        slug: card.slug,
        occasion: card.occasion,
        recipientName: card.recipientName,
        senderName: card.senderName,
        messageText: card.messageText,
        images: getCardImages(card),
        voiceUrl: voiceFileUrl || null,
        musicUrls: getCardTracks(card).map((t) => t.url),
        showWatermark: card.showWatermark,
        particleEffect: card.particleEffect,
        fontFamily: card.fontFamily,
        messageStyle: card.messageStyle,
      }}
      onOpen={handleOpen}
    />
  );
}
