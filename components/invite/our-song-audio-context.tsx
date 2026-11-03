"use client";

import { ourSong } from "@/data/our-song";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

const DEFAULT_SRC = "/api/media/our-song";

function resolveAudioSrc(): string {
  if (typeof window === "undefined") return DEFAULT_SRC;
  return new URL(DEFAULT_SRC, window.location.origin).href;
}

type OurSongAudioContextValue = {
  enabled: boolean;
  muted: boolean;
  toggleMute: () => void;
  playFromUserGesture: () => void;
};

const OurSongAudioContext = createContext<OurSongAudioContextValue | null>(
  null,
);

export function useOurSongAudio(): OurSongAudioContextValue {
  const ctx = useContext(OurSongAudioContext);
  if (!ctx) {
    throw new Error("useOurSongAudio must be used within OurSongAudioProvider");
  }
  return ctx;
}

export function OurSongAudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wantsPlayRef = useRef(false);
  const unlockedRef = useRef(false);
  const userMutedRef = useRef(false);
  const [muted, setMuted] = useState(false);

  const tryPlay = useCallback((fromGesture: boolean) => {
    const audio = audioRef.current;
    if (!audio || !ourSong.enabled || !wantsPlayRef.current) return;
    if (!audio.paused && audio.currentTime > 0.02) return;

    audio.volume = 0.55;
    if (userMutedRef.current) {
      audio.muted = true;
    }

    const finishUnmute = () => {
      audio.muted = userMutedRef.current;
      audio.volume = 0.55;
      unlockedRef.current = true;
    };

    const attempt = () => {
      void audio.play().then(finishUnmute).catch(() => {
        if (fromGesture && !unlockedRef.current) {
          audio.muted = true;
          void audio
            .play()
            .then(finishUnmute)
            .catch(() => {
              audio.muted = userMutedRef.current;
            });
        }
      });
    };

    if (fromGesture && !unlockedRef.current) {
      audio.muted = true;
    }

    attempt();
  }, []);

  const armPlaybackRetries = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onReady = () => {
      if (wantsPlayRef.current) tryPlay(false);
    };
    audio.addEventListener("canplaythrough", onReady, { once: true });
    audio.addEventListener("canplay", onReady, { once: true });
    audio.addEventListener("loadeddata", onReady, { once: true });
  }, [tryPlay]);

  const playFromUserGesture = useCallback(() => {
    if (!ourSong.enabled) return;
    wantsPlayRef.current = true;
    tryPlay(true);
    armPlaybackRetries();
  }, [armPlaybackRetries, tryPlay]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    setMuted((prev) => {
      const next = !prev;
      userMutedRef.current = next;
      if (audio) audio.muted = next;
      return next;
    });
  }, []);

  useEffect(() => {
    if (!ourSong.enabled) return;

    const audio = document.createElement("audio");
    audio.src = resolveAudioSrc();
    audio.loop = true;
    audio.preload = "auto";
    audio.setAttribute("playsinline", "true");
    audio.className =
      "pointer-events-none fixed left-0 top-0 h-px w-px opacity-[0.01]";
    audio.setAttribute("aria-hidden", "true");
    document.body.appendChild(audio);
    audioRef.current = audio;

    void fetch("/api/media/our-song/config")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { enabled?: boolean; src?: string | null } | null) => {
        if (!data?.enabled || !data.src || !audioRef.current) return;
        const next = new URL(data.src, window.location.origin).href;
        if (audioRef.current.src !== next) {
          audioRef.current.src = next;
        }
        if (wantsPlayRef.current) {
          tryPlay(false);
          armPlaybackRetries();
        }
      })
      .catch(() => {});

    return () => {
      audio.pause();
      audio.remove();
      audioRef.current = null;
    };
  }, [armPlaybackRetries, tryPlay]);

  useEffect(() => {
    if (!ourSong.enabled) return;

    const retryOnTouch = () => {
      if (!wantsPlayRef.current) return;
      const audio = audioRef.current;
      if (!audio || !audio.paused) return;
      tryPlay(true);
      armPlaybackRetries();
    };

    window.addEventListener("pointerdown", retryOnTouch, { capture: true });
    window.addEventListener("touchend", retryOnTouch, { capture: true });
    return () => {
      window.removeEventListener("pointerdown", retryOnTouch, { capture: true });
      window.removeEventListener("touchend", retryOnTouch, { capture: true });
    };
  }, [armPlaybackRetries, tryPlay]);

  const value = useMemo(
    () => ({
      enabled: ourSong.enabled,
      muted,
      toggleMute,
      playFromUserGesture,
    }),
    [muted, playFromUserGesture, toggleMute],
  );

  return (
    <OurSongAudioContext.Provider value={value}>
      {children}
    </OurSongAudioContext.Provider>
  );
}
