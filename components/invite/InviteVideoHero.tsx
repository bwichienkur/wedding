"use client";

import { InviteCornerFrame, InviteDivider } from "@/components/invite/InviteDecor";
import { wedding, weddingLocationLine } from "@/data/wedding";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const VIDEO_SRC = "/videos/ambient-atmosphere.mp4";
const POSTER_SRC = "/videos/ambient-atmosphere-poster.jpg";
const VENUE_ART = "/images/venue/bella-cosa-watercolor.png";

/**
 * Wooowinvites-style hero — ambient video is the focal visual with
 * Bright & Lexi wedding details overlaid in gold script.
 */
export function InviteVideoHero() {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (reduceMotion) return;
    const video = videoRef.current;
    if (!video) return;
    const play = () => void video.play().catch(() => {});
    if (video.readyState >= 2) play();
    else video.addEventListener("canplay", play, { once: true });
    return () => video.removeEventListener("canplay", play);
  }, [reduceMotion]);

  const dateUpper = wedding.wedding.dateDisplay.toUpperCase();

  return (
    <section id="home" className="invite-hero" aria-labelledby="invite-hero-title">
      <div className="invite-hero-video-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={VENUE_ART}
          alt=""
          className="invite-hero-media invite-hero-watercolor"
          draggable={false}
        />

        {reduceMotion ? null : (
          <video
            ref={videoRef}
            className="invite-hero-media invite-hero-ambient"
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden
          />
        )}

        <div className="invite-hero-scrim" aria-hidden />

        <div className="invite-hero-content">
          <InviteCornerFrame />

          <p className="invite-hero-eyebrow">Together with their families</p>

          <h1 id="invite-hero-title" className="invite-hero-names">
            <span className="invite-hero-name">{wedding.couple.partnerOne}</span>
            <span className="invite-hero-amp">&</span>
            <span className="invite-hero-name">{wedding.couple.partnerTwo}</span>
          </h1>

          <p className="invite-hero-tagline">Our love story continues</p>

          <InviteDivider />

          <p className="invite-hero-date">{dateUpper}</p>
          <p className="invite-hero-venue">{weddingLocationLine()}</p>

          <p
            className={cn(
              "invite-hero-statement mx-auto mt-4 max-w-[18rem] text-balance",
              wedding.hero.statementIsPlaceholder && "opacity-90 italic",
            )}
          >
            {wedding.hero.statement}
          </p>
        </div>
      </div>
    </section>
  );
}
