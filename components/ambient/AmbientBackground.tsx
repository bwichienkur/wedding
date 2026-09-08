"use client";

import { cn } from "@/lib/cn";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/videos/ambient-atmosphere.mp4";
const POSTER_SRC = "/videos/ambient-atmosphere-poster.jpg";

/** Full-bleed ambient video — clearly visible behind the invitation scroll column. */
export function AmbientBackground({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 3000], [0, -180]);
  const scale = useTransform(scrollY, [0, 3000], [1.08, 1.18]);

  useEffect(() => {
    if (!active || reduceMotion) return;
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      void video.play().catch(() => {});
    };

    if (video.readyState >= 2) play();
    else video.addEventListener("canplay", play, { once: true });

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
      {reduceMotion ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={POSTER_SRC}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover"
        />
      ) : (
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ y, scale }}
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

      {/* Soft edge vignette — video stays prominent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_75%_at_50%_45%,transparent_20%,rgba(7,15,28,0.22)_100%)]" />
    </div>
  );
}
