"use client";

import {
  getOurSongUserMuted,
  ourSongFeatureEnabled,
  playOurSongFromUserGesture,
  setOurSongUserMuted,
  subscribeOurSongMuted,
} from "@/lib/media/our-song-engine";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
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
  const muted = useSyncExternalStore(
    subscribeOurSongMuted,
    getOurSongUserMuted,
    () => false,
  );

  const toggleMute = useCallback(() => {
    setOurSongUserMuted(!getOurSongUserMuted());
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
