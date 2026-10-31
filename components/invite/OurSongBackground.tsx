"use client";

import { ourSong } from "@/data/our-song";
import {
  forwardRef,
  useCallback,
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
  const wantsPlayRef = useRef(false);
  const srcRef = useRef(DEFAULT_SRC);

  const tryPlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !ourSong.enabled || !wantsPlayRef.current) return;
    if (!audio.paused && audio.currentTime > 0.02) return;

    audio.volume = 0.55;
    void audio.play().catch(() => {
      /* Retry when enough data is buffered (common on mobile). */
    });
  }, []);

  const armPlaybackRetries = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onReady = () => {
      if (wantsPlayRef.current) tryPlay();
    };
    audio.addEventListener("canplay", onReady, { once: true });
    audio.addEventListener("loadeddata", onReady, { once: true });
  }, [tryPlay]);

  useEffect(() => {
    if (!ourSong.enabled) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/media/our-song/config");
        if (!response.ok) return;
        const data = (await response.json()) as {
          enabled?: boolean;
          src?: string | null;
        };
        if (cancelled || !data.enabled || !data.src) return;
        srcRef.current = data.src;
        const audio = audioRef.current;
        if (audio && audio.src !== new URL(data.src, window.location.origin).href) {
          audio.src = data.src;
        }
        if (wantsPlayRef.current) {
          tryPlay();
          armPlaybackRetries();
        }
      } catch {
        /* Keep default API src — never block playback on config errors. */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [armPlaybackRetries, tryPlay]);

  useImperativeHandle(ref, () => ({
    playFromUserGesture() {
      if (!ourSong.enabled) return;
      wantsPlayRef.current = true;
      tryPlay();
      armPlaybackRetries();
    },
  }));

  if (!ourSong.enabled) return null;

  return (
    <audio
      ref={audioRef}
      src={DEFAULT_SRC}
      loop
      preload="auto"
      className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0"
      aria-hidden
      playsInline
    />
  );
});
