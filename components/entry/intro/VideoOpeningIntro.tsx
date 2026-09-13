"use client";

import { InviteCornerFrame, InviteDivider } from "@/components/invite/InviteDecor";
import { wedding, weddingLocationLine } from "@/data/wedding";
import { cn } from "@/lib/cn";
import type { IntroPhase } from "./types";

const OPENING_VIDEO = "/videos/opening-animation.mp4";
const OPENING_POSTER = "/videos/opening-animation-poster.jpg";
const VENUE_ART = "/images/venue/bella-cosa-watercolor.png";

interface VideoOpeningIntroProps {
  phase: IntroPhase;
  reduceMotion: boolean;
  onActivate: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

/**
 * Wooowinvites-style opening card — venue watercolor, tap glow, then opening video.
 */
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

  const dateUpper = wedding.wedding.dateDisplay.toUpperCase();

  return (
    <div
      className={cn(
        "video-opening-viewport flex min-h-[100dvh] items-center justify-center px-3 pb-24 pt-4",
      )}
    >
      <div
        className={cn(
          "video-opening-card relative w-full max-w-[26.5rem] overflow-hidden rounded-sm",
          "shadow-[0_24px_64px_rgba(74,48,32,0.25)]",
          exiting && !reduceMotion && "video-opening-card-exit",
        )}
      >
        {/* Opening animation video (hidden until play) */}
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 z-[3] h-full w-full object-cover",
            playing ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          src={OPENING_VIDEO}
          poster={OPENING_POSTER}
          playsInline
          muted
          preload="auto"
        />

        {/* Pre-play: venue watercolor + invitation copy */}
        <div
          className={cn(
            "relative z-[2] transition-opacity duration-500",
            playing ? "opacity-0" : "opacity-100",
          )}
        >
          <div className="video-opening-hero-art">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={VENUE_ART}
              alt=""
              className="h-full w-full object-cover object-center"
              draggable={false}
            />
            <div className="video-opening-art-scrim" aria-hidden />
          </div>

          <div className="video-opening-copy">
            <InviteCornerFrame />
            <p className="video-opening-eyebrow">Together with their families</p>
            <h2 className="video-opening-names">
              {wedding.couple.partnerOne}
              <span className="video-opening-amp">&</span>
              {wedding.couple.partnerTwo}
            </h2>
            <p className="video-opening-tagline">Our love story continues</p>
            <InviteDivider className="my-4" />
            <p className="video-opening-date">{dateUpper}</p>
            <p className="video-opening-venue">{weddingLocationLine()}</p>
          </div>
        </div>

        {/* Tap target + glow */}
        <button
          type="button"
          disabled={!interactive}
          onClick={(e) => {
            e.preventDefault();
            if (interactive) onActivate();
          }}
          aria-label={wedding.entry.beginLabel}
          className={cn(
            "video-opening-tap absolute inset-0 z-[4] flex flex-col items-center justify-end pb-10",
            "transition-opacity duration-300",
            interactive ? "cursor-pointer" : "pointer-events-none opacity-0",
          )}
        >
          <span
            className={cn(
              "video-opening-tap-glow",
              glowing && "is-lit",
              interactive && "is-idle",
            )}
            aria-hidden
          />
          <span className="video-opening-tap-label">{wedding.entry.tapHint}</span>
        </button>
      </div>
    </div>
  );
}
