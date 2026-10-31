"use client";

import { ourSong } from "@/data/our-song";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

export type OurSongBackgroundHandle = {
  /** Call from a user gesture (intro tap) so playback is allowed. */
  playFromUserGesture: () => void;
};

const DEFAULT_SRC = "/api/media/our-song";

/**
 * Hidden looping background track — no UI. Start via ref from the intro tap.
 */
export const OurSongBackground = forwardRef<
  OurSongBackgroundHandle,
  object
>(function OurSongBackground(_props, ref) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const pendingPlayRef = useRef(false);
  const [src, setSrc] = useState<string | null>(
    ourSong.enabled ? DEFAULT_SRC : null,
  );

  useEffect(() => {
    if (!ourSong.enabled) return;
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
          setSrc(null);
          pendingPlayRef.current = false;
          return;
        }
        setSrc(data.src);
      } catch {
        if (!cancelled) setSrc(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tryPlay = () => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    audio.volume = 0.55;
    void audio.play().catch(() => {
      pendingPlayRef.current = false;
    });
  };

  useImperativeHandle(ref, () => ({
    playFromUserGesture() {
      if (!ourSong.enabled || !src) {
        pendingPlayRef.current = true;
        return;
      }
      pendingPlayRef.current = true;
      tryPlay();
    },
  }));

  useEffect(() => {
    if (!pendingPlayRef.current || !src) return;
    tryPlay();
  }, [src]);

  if (!ourSong.enabled || !src) return null;

  return (
    <audio
      ref={audioRef}
      src={src}
      loop
      preload="auto"
      className="pointer-events-none fixed size-0 opacity-0"
      aria-hidden
      playsInline
    />
  );
});
