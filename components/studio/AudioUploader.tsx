"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Music2, Upload, X } from "lucide-react";

interface AudioUploaderProps {
  // Pushes the file into storage and resolves the public URL (StudioLayout).
  onAudioUploaded: (file: File) => Promise<string>;
  // Hands the stored track back to the SoundtrackBuilder.
  onAdd: (url: string, title: string) => void;
}

// Convex storage takes the file whole rather than streaming it, and a card's
// soundtrack is background music — not an album master. 20MB is roughly a
// 10-minute MP3 at V0.
const MAX_BYTES = 20 * 1024 * 1024;

const ACCEPT = "audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/ogg,audio/webm";

function prettySize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

// Strip the extension — the filename is shown as the track title.
function titleFromFile(name: string): string {
  return name.replace(/\.[^.]+$/, "");
}

export function AudioUploader({ onAudioUploaded, onAdd }: AudioUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  // Object URL for the local preview, so the user can hear the file before
  // it finishes uploading.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const reset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [previewUrl]);

  const accept = useCallback(
    (picked: File | undefined) => {
      if (!picked) return;

      // Safari hands .m4a files an empty type often enough that a strict
      // startsWith("audio/") check would reject a valid pick; fall back to the
      // extension before giving up.
      const looksAudio =
        picked.type.startsWith("audio/") ||
        /\.(mp3|m4a|wav|ogg|oga|webm|aac|flac)$/i.test(picked.name);
      if (!looksAudio) {
        setError("Please choose an audio file (MP3, M4A, WAV, OGG).");
        return;
      }
      if (picked.size > MAX_BYTES) {
        setError(`That file is ${prettySize(picked.size)} — the limit is 20MB.`);
        return;
      }

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setError(null);
      setFile(picked);
      setPreviewUrl(URL.createObjectURL(picked));
    },
    [previewUrl]
  );

  const handleAdd = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const url = await onAudioUploaded(file);
      onAdd(url, titleFromFile(file.name));
      reset();
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-2">
        <div
          onDrop={(e) => {
            e.preventDefault();
            accept(e.dataTransfer.files?.[0]);
          }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={(e) => accept(e.target.files?.[0])}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Drop your song here or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                MP3, M4A, WAV, OGG up to 20MB
              </p>
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <p className="text-xs text-muted-foreground">
          Only upload music you have the rights to share.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card">
        <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Music2 className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{titleFromFile(file.name)}</p>
          <p className="text-xs text-muted-foreground">{prettySize(file.size)}</p>
        </div>
        <button
          onClick={reset}
          disabled={isUploading}
          className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
          aria-label="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {previewUrl && (
        <audio src={previewUrl} controls className="w-full" preload="metadata" />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={handleAdd} disabled={isUploading} className="w-full">
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Add track
          </>
        )}
      </Button>
    </div>
  );
}
