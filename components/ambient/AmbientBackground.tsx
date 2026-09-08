"use client";

import { cn } from "@/lib/cn";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/videos/ambient-atmosphere.mp4";
const POSTER_SRC = "/videos/ambient-atmosphere-poster.jpg";

/**
 * Full-page ambient video inspired by luxury invite sites — soft motion behind
 * editorial sections with gentle parallax while scrolling.
 */
export function AmbientBackground({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 2400], [0, -120]);
  const scale = useTransform(scrollY, [0, 2400], [1.05, 1.12]);
  const opacity = useTransform(scrollY, [0, 400, 1200], [0.55, 0.42, 0.28]);

  useEffect(() => {
    if (!active || reduceMotion) return;
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      void video.play().catch(() => {
        /* Autoplay may be blocked until interaction; poster remains visible */
      });
    };

    if (video.readyState >= 2) {
      play();
    } else {
      video.addEventListener("canplay", play, { once: true });
    }

    return () => video.removeEventListener("canplay", play);
  }, [active, reduceMotion]);

  if (!active) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        "transition-opacity duration-700 ease-out",
        ready || reduceMotion ? "opacity-100" : "opacity-0",
      )}
      aria-hidden
    >
      <div className="absolute inset-0 bg-forest" />

      {reduceMotion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={POSTER_SRC}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-40"
        />
      ) : (
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ y, scale, opacity }}
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setReady(true)}
          />
        </motion.div>
      )}

      {/* Navy wash so sections stay readable over the warm video */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest/60 via-forest/45 to-forest/75" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(212,175,55,0.08),transparent_55%)]" />
      <div className="absolute inset-0 opacity-[0.35] mix-blend-soft-light grain-overlay" />
    </div>
  );
}
