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

/** Full-screen opening animation with a floating tap hint near the seal. */
export function VideoOpeningIntro({
  phase,
  reduceMotion,
  onActivate,
  videoRef,
}: VideoOpeningIntroProps) {
  const interactive = phase === "closed";
  const glowing = phase === "activating" || phase === "glowing";
  const playing = phase === "glowing";
  const exiting = phase === "opening" || phase === "opened";

  return (
    <div
      className={cn(
        "video-opening-fullscreen relative h-[100dvh] w-full overflow-hidden bg-[#070e1a]",
        exiting && !reduceMotion && "video-opening-fullscreen-exit",
      )}
    >
      {/* Poster frame before playback */}
      {!playing ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={OPENING_POSTER}
          alt=""
          className="absolute inset-0 z-[1] h-full w-full object-cover"
          draggable={false}
        />
      ) : null}

      <video
        ref={videoRef}
        className={cn(
          "absolute inset-0 z-[2] h-full w-full object-cover",
          playing ? "opacity-100" : "pointer-events-none opacity-0",
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
        <span
          className={cn(
            "video-opening-float-hint",
            glowing && "is-lit",
            interactive && !playing && "is-visible",
            playing && "opacity-0",
          )}
        >
          {wedding.entry.tapHint}
        </span>
      </button>
    </div>
  );
}
