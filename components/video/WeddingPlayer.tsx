"use client";

import { cn } from "@/lib/cn";
import MuxPlayer from "@mux/mux-player-react";
import { useCallback, useEffect, useId, useState } from "react";

export type PlayerStatus =
  | "idle"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "processing"
  | "unavailable"
  | "error";

export interface WeddingPlayerProps {
  playbackId?: string | null;
  playbackToken?: string | null;
  title: string;
  posterUrl?: string | null;
  captionsUrl?: string | null;
  transcript?: string | null;
  status?: PlayerStatus;
  aspectRatio?: string | null;
  autoPlayMuted?: boolean;
  className?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onClose?: () => void;
}

/**
 * Custom presentation around Mux Player — ivory chrome, antique-gold accent.
 * Never autoplays with sound. Supports processing / unavailable / error states.
 */
export function WeddingPlayer({
  playbackId,
  playbackToken,
  title,
  posterUrl,
  captionsUrl,
  transcript,
  status = "idle",
  aspectRatio,
  autoPlayMuted = false,
  className,
  onPlay,
  onPause,
  onEnded,
  onClose,
}: WeddingPlayerProps) {
  const labelId = useId();
  const [playbackPhase, setPlaybackPhase] = useState<"playing" | "paused" | null>(
    null,
  );
  const [showTranscript, setShowTranscript] = useState(false);
  const [localError, setLocalError] = useState(false);

  const resolvedStatus: PlayerStatus = localError
    ? "error"
    : playbackPhase === "playing"
      ? "playing"
      : playbackPhase === "paused"
        ? "paused"
        : status;

  useEffect(() => {
    if (!onClose) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const ratioPadding =
    aspectRatio === "9:16" ? "177.78%" : aspectRatio === "1:1" ? "100%" : "56.25%";

  if (resolvedStatus === "processing") {
    return (
      <div
        className={cn("wedding-player border border-stone bg-parchment", className)}
        role="status"
        aria-live="polite"
      >
        <div className="flex aspect-video items-center justify-center px-6 text-center">
          <div>
            <p className="font-display text-2xl text-gold">{title}</p>
            <p className="mt-3 text-sm text-ivory/70">Processing video…</p>
          </div>
        </div>
      </div>
    );
  }

  if (resolvedStatus === "unavailable" || !playbackId) {
    return (
      <div
        className={cn("wedding-player border border-stone bg-parchment", className)}
        role="img"
        aria-label={`${title} unavailable`}
      >
        <div className="relative w-full" style={{ paddingBottom: ratioPadding }}>
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center bg-parchment/80 px-6 text-center">
            <div>
              <p className="font-display text-2xl text-gold">{title}</p>
              <p className="mt-3 text-sm text-ivory/70">
                Film coming soon — poster and captions will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (resolvedStatus === "error") {
    return (
      <div
        className={cn(
          "wedding-player border border-stone bg-parchment p-8 text-center",
          className,
        )}
        role="alert"
      >
        <p className="font-display text-2xl text-gold">Unable to play video</p>
        <p className="mt-3 text-sm text-ivory/70">
          Please try again on a stronger connection, or continue the story below.
        </p>
        {onClose ? (
          <button
            type="button"
            className="mt-6 min-h-11 px-4 font-sans text-sm uppercase tracking-[0.12em] text-ivory underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            onClick={handleClose}
          >
            Close
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn("wedding-player relative overflow-hidden bg-forest", className)}
      aria-labelledby={labelId}
    >
      <p id={labelId} className="sr-only">
        {title}
      </p>
      <MuxPlayer
        playbackId={playbackId}
        tokens={playbackToken ? { playback: playbackToken } : undefined}
        streamType="on-demand"
        poster={posterUrl ?? undefined}
        primaryColor="#F4EBDA"
        secondaryColor="#070F1C"
        accentColor="#D4AF37"
        metadata={{ video_title: title }}
        playsInline
        autoPlay={autoPlayMuted ? "muted" : false}
        muted={autoPlayMuted}
        style={{
          width: "100%",
          aspectRatio: aspectRatio === "9:16" ? "9 / 16" : "16 / 9",
        }}
        onPlay={() => {
          setPlaybackPhase("playing");
          onPlay?.();
        }}
        onPause={() => {
          setPlaybackPhase("paused");
          onPause?.();
        }}
        onEnded={() => {
          setPlaybackPhase("paused");
          onEnded?.();
        }}
        onError={() => setLocalError(true)}
      >
        {captionsUrl ? (
          <track
            kind="captions"
            src={captionsUrl}
            srcLang="en"
            label="English"
            default
          />
        ) : null}
      </MuxPlayer>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gold/25 bg-parchment px-4 py-3">
        <p className="font-sans text-xs uppercase tracking-[0.16em] text-ivory/70">
          {title}
        </p>
        <div className="flex flex-wrap gap-2">
          {transcript ? (
            <button
              type="button"
              className="min-h-11 px-3 font-sans text-xs uppercase tracking-[0.12em] text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              onClick={() => setShowTranscript((value) => !value)}
              aria-expanded={showTranscript}
            >
              {showTranscript ? "Hide transcript" : "Transcript"}
            </button>
          ) : null}
          {onClose ? (
            <button
              type="button"
              className="min-h-11 px-3 font-sans text-xs uppercase tracking-[0.12em] text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              onClick={handleClose}
            >
              Close
            </button>
          ) : null}
        </div>
      </div>

      {showTranscript && transcript ? (
        <div className="max-h-48 overflow-auto border-t border-gold/25 bg-parchment px-4 py-3 text-sm leading-relaxed text-ivory/80">
          {transcript}
        </div>
      ) : null}
    </div>
  );
}
