"use client";

import { useOurSongAudio } from "@/components/invite/our-song-audio-context";
import {
  getOurSongIsAudiblyPlaying,
  getOurSongUserMuted,
  subscribeOurSongPlaying,
} from "@/lib/media/our-song-engine";
import { cn } from "@/lib/cn";
import { useSyncExternalStore } from "react";

function SpeakerOnIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
      aria-hidden
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" strokeLinecap="round" />
      <path d="M18 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
    </svg>
  );
}

function SpeakerOffIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className={className}
      aria-hidden
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
      <path d="m16 9 5 5M21 9l-5 5" strokeLinecap="round" />
    </svg>
  );
}

/** Fixed mute control for background music — stays visible while scrolling. */
export function OurSongMuteButton({ className }: { className?: string }) {
  const { enabled, muted, toggleMute, playFromUserGesture } = useOurSongAudio();
  const playing = useSyncExternalStore(
    subscribeOurSongPlaying,
    getOurSongIsAudiblyPlaying,
    () => false,
  );

  if (!enabled) return null;

  const needsTap = !muted && !playing;

  function handleClick() {
    if (muted) {
      toggleMute();
      return;
    }
    if (playing) {
      toggleMute();
      return;
    }
    playFromUserGesture();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "invite-chrome-fab",
        needsTap && "invite-chrome-fab--attention",
        className,
      )}
      aria-pressed={muted}
      aria-label={
        muted
          ? "Unmute background music"
          : needsTap
            ? "Tap to start background music"
            : "Mute background music"
      }
      title={
        muted
          ? "Unmute music"
          : needsTap
            ? "Tap to start music"
            : "Mute music"
      }
    >
      {muted ? (
        <SpeakerOffIcon className="h-5 w-5" />
      ) : (
        <SpeakerOnIcon className="h-5 w-5" />
      )}
    </button>
  );
}
