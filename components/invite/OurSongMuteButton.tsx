"use client";

import { useOurSongAudio } from "@/components/invite/our-song-audio-context";
import { cn } from "@/lib/cn";

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
  const { enabled, muted, toggleMute } = useOurSongAudio();

  if (!enabled) return null;

  return (
    <button
      type="button"
      onClick={toggleMute}
      className={cn(
        "invite-chrome-fab",
        className,
      )}
      aria-pressed={muted}
      aria-label={muted ? "Unmute background music" : "Mute background music"}
      title={muted ? "Unmute music" : "Mute music"}
    >
      {muted ? (
        <SpeakerOffIcon className="h-5 w-5" />
      ) : (
        <SpeakerOnIcon className="h-5 w-5" />
      )}
    </button>
  );
}
