"use client";

import { InviteDivider } from "@/components/invite/InviteDecor";
import { wedding } from "@/data/wedding";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

const VIDEO_SRC = "/videos/ambient-atmosphere.mp4";
const POSTER_SRC = "/videos/ambient-atmosphere-poster.jpg";

/** Minimal wooowinvites-style overlay — names and date only, no blur panel. */
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
        {reduceMotion ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={POSTER_SRC} alt="" className="invite-hero-media" />
        ) : (
          <video
            ref={videoRef}
            className="invite-hero-media"
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          />
        )}

        <div className="invite-hero-content">
          <div className="invite-hero-stack">
            <h1 id="invite-hero-title" className="invite-hero-stack-names">
              <span className="invite-hero-stack-name">
                {wedding.couple.partnerOne}
              </span>
              <span className="invite-hero-stack-amp">&amp;</span>
              <span className="invite-hero-stack-name">
                {wedding.couple.partnerTwo}
              </span>
            </h1>
            <p className="invite-hero-stack-occasion">Wedding Day</p>
            <InviteDivider className="invite-hero-stack-divider my-0 w-40" />
            <p className="invite-hero-stack-date">{dateUpper}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
