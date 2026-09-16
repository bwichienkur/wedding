"use client";

import {
  INVITE_SCROLL_BG_POSTER,
  INVITE_SCROLL_BG_VIDEO,
} from "@/lib/media/invite-scroll-background";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Fixed floral scroll video — wooowinvites-style layer behind the invite column. */
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
          src={INVITE_SCROLL_BG_POSTER}
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
            className="h-full w-full object-cover object-center"
            src={INVITE_SCROLL_BG_VIDEO}
            poster={INVITE_SCROLL_BG_POSTER}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setReady(true)}
          />
        </motion.div>
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_50%_40%,transparent_35%,rgba(5,10,20,0.35)_100%)]" />
    </div>
  );
}
