// Normalizing helpers that bridge the legacy single-image/single-track fields
// and the new gallery/soundtrack arrays. Everything downstream (studio preview,
// viewer) reads through these so old and new cards render identically.

export interface CardImage {
  url: string;
  caption?: string;
  dateLabel?: string;
  source?: string;
}

export interface CardTrack {
  url: string;
  prompt?: string;
  title?: string;
}

export interface ImageSource {
  images?: CardImage[] | null;
  imageUrl?: string | null;
}

export interface TrackSource {
  musicTracks?: CardTrack[] | null;
  musicUrl?: string | null;
}

// Returns the ordered list of gallery moments. Falls back to the single
// imageUrl for cards created before Memory Lane.
export function getCardImages(card: ImageSource): CardImage[] {
  if (card.images && card.images.length > 0) {
    return card.images.filter((img) => !!img.url);
  }
  if (card.imageUrl) return [{ url: card.imageUrl }];
  return [];
}

// The cover image (slot 0), or null.
export function getCoverImage(card: ImageSource): string | null {
  return getCardImages(card)[0]?.url ?? null;
}

// Returns the ordered soundtrack (max 3). Falls back to the single musicUrl.
export function getCardTracks(card: TrackSource): CardTrack[] {
  if (card.musicTracks && card.musicTracks.length > 0) {
    return card.musicTracks.filter((t) => !!t.url).slice(0, 3);
  }
  if (card.musicUrl) return [{ url: card.musicUrl }];
  return [];
}

export const MAX_GALLERY_IMAGES = 10;
export const MAX_SOUNDTRACK_TRACKS = 3;
