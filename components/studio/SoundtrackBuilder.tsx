"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MusicGenerator } from "./MusicGenerator";
import { CardTrack } from "@/lib/media";
import { Play, Pause, Trash2, Music, Plus } from "lucide-react";

interface SoundtrackBuilderProps {
  occasion: string;
  slug: string;
  // How many tracks this package allows (1 for Music/Full, 3 for Story).
  maxTracks: number;
  initialTracks: CardTrack[];
  onPersist: (tracks: CardTrack[]) => Promise<void> | void;
}

function TrackRow({
  track,
  index,
  onRemove,
}: {
  track: CardTrack;
  index: number;
  onRemove: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center flex-shrink-0"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Track {index + 1}</p>
        {track.prompt && (
          <p className="text-xs text-muted-foreground truncate">{track.prompt}</p>
        )}
      </div>
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive transition-colors"
        aria-label="Remove track"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <audio ref={audioRef} src={track.url} onEnded={() => setPlaying(false)} />
    </div>
  );
}

export function SoundtrackBuilder({
  occasion,
  slug,
  maxTracks,
  initialTracks,
  onPersist,
}: SoundtrackBuilderProps) {
  const [tracks, setTracks] = useState<CardTrack[]>(initialTracks);
  const [showAdd, setShowAdd] = useState(initialTracks.length === 0);
  const multi = maxTracks > 1;

  useEffect(() => {
    if (tracks.length === 0 && initialTracks.length > 0) {
      setTracks(initialTracks);
      setShowAdd(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTracks]);

  const persist = useCallback(
    (next: CardTrack[]) => {
      setTracks(next);
      void onPersist(next);
    },
    [onPersist]
  );

  const atMax = tracks.length >= maxTracks;

  const handleGenerated = useCallback(
    (url: string, prompt: string) => {
      if (tracks.length >= maxTracks) return;
      const next = [...tracks, { url, prompt }];
      persist(next);
      if (next.length >= maxTracks) setShowAdd(false);
    },
    [tracks, maxTracks, persist]
  );

  const removeAt = (index: number) => {
    persist(tracks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">
        {multi
          ? `Add up to ${maxTracks} tracks. They play one after another when the card is opened.`
          : "Generate a track to play in the background when the card is opened."}
      </p>

      {tracks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {multi ? `Soundtrack · ${tracks.length}/${maxTracks}` : "Your track"}
          </p>
          {tracks.map((track, index) => (
            <TrackRow
              key={track.url}
              track={track}
              index={index}
              onRemove={() => removeAt(index)}
            />
          ))}
        </div>
      )}

      {!atMax && !showAdd && (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-accent/40 hover:text-foreground transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add {tracks.length === 0 ? "a track" : "another track"}
        </button>
      )}

      {atMax && multi && (
        <p className="text-xs text-center text-muted-foreground">
          Maximum of {maxTracks} tracks reached.
        </p>
      )}
      {atMax && !multi && (
        <p className="text-xs text-center text-muted-foreground">
          Want a full soundtrack? Upgrade to the Story package for up to 3 tracks.
        </p>
      )}

      {showAdd && !atMax && (
        <div className="rounded-xl border border-border p-4 bg-muted/20">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Music className="w-4 h-4 text-accent" />
              New track
            </span>
            {tracks.length > 0 && (
              <button
                onClick={() => setShowAdd(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Done
              </button>
            )}
          </div>
          <MusicGenerator
            occasion={occasion}
            musicUrl={null}
            onMusicGenerated={handleGenerated}
            slug={slug}
            appendMode
          />
        </div>
      )}
    </div>
  );
}
