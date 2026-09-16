"use client";

import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";
import type { IntroPhase } from "./types";

const OPENING_VIDEO = "/videos/opening-animation.mp4";
const OPENING_POSTER = "/videos/opening-animation-poster.jpg";

interface VideoOpeningIntroProps {
  phase: IntroPhase;
  reduceMotion: boolean;
  onActivate: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

/** Full-screen opening — tap the envelope poster; video plays in place (no overlay ring). */
export function VideoOpeningIntro({
  phase,
  reduceMotion,
  onActivate,
  videoRef,
}: VideoOpeningIntroProps) {
  const interactive = phase === "closed";
  const glowing = phase === "glowing";
  const exiting = phase === "opening" || phase === "opened";
  const showCue = interactive;

  return (
    <div
      className={cn(
        "video-opening-fullscreen relative h-[100dvh] w-full overflow-hidden bg-[#070e1a]",
        exiting && !reduceMotion && "video-opening-fullscreen-exit",
      )}
    >
      <video
        ref={videoRef}
        className="video-opening-media absolute inset-0 z-[1]"
        src={OPENING_VIDEO}
        poster={OPENING_POSTER}
        playsInline
        muted
        preload="auto"
      />

      <button
        type="button"
        disabled={!interactive}
        onClick={(e) => {
          e.preventDefault();
          if (interactive) onActivate();
        }}
        aria-label={wedding.entry.beginLabel}
        className={cn(
          "absolute inset-0 z-[2]",
          interactive ? "cursor-pointer" : "pointer-events-none",
        )}
      >
        {showCue ? (
          <div
            className={cn("video-opening-invite-cue", glowing && "is-lit")}
            aria-hidden
          >
            <span className="video-opening-invite-cue-mark">
              <span className="video-opening-invite-cue-line" />
              <span className="video-opening-invite-cue-dot" />
            </span>
            <span className="video-opening-invite-cue-text">
              {wedding.entry.openCueLabel}
            </span>
          </div>
        ) : null}
      </button>
    </div>
  );
}
