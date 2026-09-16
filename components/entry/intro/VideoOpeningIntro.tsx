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

/** Full-screen opening — tap anywhere; subtle seal pulse + bottom cue (no pill button). */
export function VideoOpeningIntro({
  phase,
  reduceMotion,
  onActivate,
  videoRef,
}: VideoOpeningIntroProps) {
  const interactive = phase === "closed";
  const glowing = phase === "activating" || phase === "glowing";
  const playbackStarted =
    phase === "glowing" || phase === "opening" || phase === "opened";
  const exiting = phase === "opening" || phase === "opened";
  const showPoster = phase === "closed" || phase === "activating";
  const showCue = interactive && showPoster && !playbackStarted;

  return (
    <div
      className={cn(
        "video-opening-fullscreen relative h-[100dvh] w-full overflow-hidden bg-[#070e1a]",
        exiting && !reduceMotion && "video-opening-fullscreen-exit",
      )}
    >
      {showPoster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={OPENING_POSTER}
          alt=""
          className="video-opening-media absolute inset-0 z-[1]"
          draggable={false}
        />
      ) : null}

      {showCue && !reduceMotion ? (
        <div
          className={cn(
            "video-opening-seal-pulse pointer-events-none absolute z-[2]",
            glowing && "is-lit",
          )}
          aria-hidden
        />
      ) : null}

      <video
        ref={videoRef}
        className={cn(
          "video-opening-media absolute inset-0 z-[2]",
          playbackStarted
            ? "opacity-100"
            : "pointer-events-none opacity-0",
        )}
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
          "absolute inset-0 z-[3]",
          interactive ? "cursor-pointer" : "pointer-events-none",
        )}
      >
        {showCue ? (
          <div
            className={cn(
              "video-opening-invite-cue",
              glowing && "is-lit",
            )}
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
