"use client";

import {
  getOurSongUserMuted,
  ourSongFeatureEnabled,
  playOurSongFromUserGesture,
  setOurSongUserMuted,
  subscribeOurSongUnlock,
} from "@/lib/media/our-song-engine";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(getOurSongUserMuted());
    return subscribeOurSongUnlock(() => {
      setMuted(getOurSongUserMuted());
    });
  }, []);

  const toggleMute = useCallback(() => {
    const next = !getOurSongUserMuted();
    setOurSongUserMuted(next);
    setMuted(next);
  }, []);

  const playFromUserGesture = useCallback(() => {
    playOurSongFromUserGesture();
  }, []);

  const value = useMemo(
    () => ({
      enabled: ourSongFeatureEnabled(),
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
