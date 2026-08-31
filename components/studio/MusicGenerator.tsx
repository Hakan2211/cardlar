"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { OCCASIONS } from "@/lib/constants";
import { Loader2, Music, Play, Pause } from "lucide-react";

interface MusicGeneratorProps {
  occasion: string;
  musicUrl: string | null;
  onMusicGenerated: (url: string, prompt: string) => void;
  slug: string;
  // Soundtrack mode: label the button "Add track" and skip the built-in preview
  // (the SoundtrackBuilder renders its own track list).
  appendMode?: boolean;
}

export function MusicGenerator({
  occasion,
  musicUrl,
  onMusicGenerated,
  slug,
  appendMode = false,
}: MusicGeneratorProps) {
  const occasionData = OCCASIONS.find((o) => o.slug === occasion);
  const [prompt, setPrompt] = useState(occasionData?.defaultMusicPrompt || "");
  const [lyricsPrompt, setLyricsPrompt] = useState("[instrumental]");
  const [durationSeconds, setDurationSeconds] = useState(60);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, lyricsPrompt, durationSeconds, slug }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.audioUrl) {
        onMusicGenerated(data.audioUrl, prompt);
      } else {
        setError(data.message || "No music generated");
      }
    } catch {
      setError("Failed to generate music. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !musicUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Music Style & Mood
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the music style, mood, and instruments..."
          className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Lyrics (optional)
        </label>
        <textarea
          value={lyricsPrompt}
          onChange={(e) => setLyricsPrompt(e.target.value)}
          placeholder="[verse] Your lyrics here... [chorus] Chorus lyrics..."
          className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use [verse], [chorus], [bridge], [outro] tags. Leave as [instrumental] for no lyrics.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Length</label>
        <select
          value={durationSeconds}
          onChange={(e) => setDurationSeconds(Number(e.target.value))}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={30}>30 seconds</option>
          <option value={60}>1 minute</option>
          <option value={120}>2 minutes</option>
          <option value={180}>3 minutes</option>
        </select>
        <p className="text-xs text-muted-foreground mt-1">
          Upper bound — the track may finish a little earlier.
        </p>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating Music (this may take a minute)...
          </>
        ) : (
          <>
            <Music className="w-4 h-4 mr-2" />
            {appendMode
              ? "Add track"
              : musicUrl
              ? "Regenerate Music"
              : "Generate Music"}
          </>
        )}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Music Preview (single mode only) */}
      {musicUrl && !appendMode && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/50">
          <button
            onClick={togglePlayback}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>
          <div className="flex-1">
            <p className="text-sm font-medium">Generated Music</p>
            <p className="text-xs text-muted-foreground">
              Tap play to preview
            </p>
          </div>
          <audio
            ref={audioRef}
            src={musicUrl}
            onEnded={() => setIsPlaying(false)}
          />
        </div>
      )}
    </div>
  );
}
