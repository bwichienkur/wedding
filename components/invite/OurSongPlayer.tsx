"use client";

import { ourSong } from "@/data/our-song";
import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";

/** Tap-to-play “our song” — no autoplay. Supports Vercel Blob via `/api/media/our-song`. */
export function OurSongPlayer({ className }: { className?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/media/our-song/config");
        const data = (await response.json()) as {
          enabled?: boolean;
          src?: string | null;
        };
        if (cancelled) return;
        if (!data.enabled || !data.src) {
          setAvailable(false);
          setLoading(false);
          return;
        }
        setSrc(data.src);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setAvailable(false);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ourSong.enabled) return null;

  async function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !available || !src) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 text-center",
        className,
      )}
    >
      {src ? (
        <audio
          ref={audioRef}
          src={src}
          preload="none"
          onEnded={() => setPlaying(false)}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          onError={() => {
            setAvailable(false);
            setPlaying(false);
          }}
        />
      ) : null}
      {loading ? (
        <p className="text-xs tracking-wide text-[var(--invite-ink-muted)]">
          Loading song…
        </p>
      ) : available && src ? (
        <button
          type="button"
          onClick={() => void togglePlay()}
          className={cn(
            "invite-hero-stack-occasion rounded-full border border-[var(--invite-gold-soft)]/40",
            "bg-[var(--invite-navy)]/50 px-5 py-2 text-xs tracking-[0.2em] uppercase",
            "text-[var(--invite-ivory)] backdrop-blur-sm transition-colors",
            "hover:border-[var(--invite-gold)]/70 hover:text-[var(--invite-gold-soft)]",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--invite-gold)]",
          )}
          aria-pressed={playing}
        >
          {playing ? "Pause" : "Play"} · {ourSong.title}
        </button>
      ) : (
        <p className="max-w-xs text-xs tracking-wide text-[var(--invite-ink-muted)]">
          Song not available. In Vercel, set{" "}
          <code className="text-[var(--invite-ivory)]/80">OUR_SONG_BLOB_PATH</code>{" "}
          to your Blob path (e.g.{" "}
          <code className="text-[var(--invite-ivory)]/80">music/ordinary.mp3</code>
          ).
        </p>
      )}
      <span className="sr-only">{ourSong.artistLabel}</span>
    </div>
  );
}
