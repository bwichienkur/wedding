"use client";

import { ourSong } from "@/data/our-song";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
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
  const enabledRef = useRef<boolean>(ourSong.enabled);

  useEffect(() => {
    if (!ourSong.enabled) {
      enabledRef.current = false;
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/media/our-song/config");
        const data = (await response.json()) as {
          enabled?: boolean;
          src?: string | null;
        };
        if (cancelled) return;
        enabledRef.current = Boolean(data.enabled && data.src);
        if (!enabledRef.current) {
          const audio = audioRef.current;
          if (audio) {
            audio.pause();
            audio.removeAttribute("src");
            audio.load();
          }
        }
      } catch {
        if (!cancelled) enabledRef.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tryPlay = () => {
    const audio = audioRef.current;
    if (!audio || !enabledRef.current) return;
    if (!audio.paused && audio.currentTime > 0.05) return;

    audio.volume = 0.55;

    const playAttempt = () => {
      if (!enabledRef.current) return;
      if (!audio.paused && audio.currentTime > 0.05) return;
      void audio.play().catch(() => {});
    };

    if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      playAttempt();
      return;
    }

    playAttempt();
    audio.addEventListener("canplay", playAttempt, { once: true });
  };

  useImperativeHandle(ref, () => ({
    playFromUserGesture() {
      if (!ourSong.enabled) return;
      tryPlay();
    },
  }));

  if (!ourSong.enabled) return null;

  return (
    <audio
      ref={audioRef}
      src={DEFAULT_SRC}
      loop
      preload="auto"
      className="pointer-events-none fixed size-0 opacity-0"
      aria-hidden
      playsInline
    />
  );
});
