"use client";

import {
  INVITE_SCROLL_BG_POSTER,
  INVITE_SCROLL_BG_VIDEO,
} from "@/lib/media/invite-scroll-background";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Fixed floral scroll video — wooowinvites-style layer behind the invite column. */
export function AmbientBackground({
  active,
  warm = false,
}: {
  active: boolean;
  /** Start loading the video as soon as the page mounts (before reveal). */
  warm?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 3000], [0, -180]);
  const scale = useTransform(scrollY, [0, 3000], [1.08, 1.18]);
  const shouldLoad = warm || active;

  useEffect(() => {
    if (!shouldLoad) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.readyState < 1) {
      video.load();
    }
  }, [shouldLoad]);

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

  if (!shouldLoad) return null;

  const visible = active;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden",
        "transition-opacity duration-500 ease-out",
        visible ? "opacity-100" : "opacity-0",
      )}
      aria-hidden
    >
      {/* Poster shows immediately on reveal; video crossfades when buffered. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={INVITE_SCROLL_BG_POSTER}
        alt=""
        className={cn(
          "absolute inset-0 h-full w-full scale-105 object-cover object-center transition-opacity duration-700",
          visible && !videoReady && !reduceMotion ? "opacity-100" : "opacity-100",
        )}
      />

      {reduceMotion ? null : (
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ y, scale }}
        >
          <video
            ref={videoRef}
            className={cn(
              "h-full w-full object-cover object-center transition-opacity duration-700 ease-out",
              videoReady && visible ? "opacity-100" : "opacity-0",
            )}
            src={INVITE_SCROLL_BG_VIDEO}
            poster={INVITE_SCROLL_BG_POSTER}
            autoPlay={false}
            loop
            muted
            playsInline
            preload="auto"
            onCanPlay={() => setVideoReady(true)}
            onLoadedData={() => setVideoReady(true)}
          />
        </motion.div>
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_85%_at_50%_45%,transparent_55%,rgba(5,10,20,0.18)_100%)]" />
    </div>
  );
}
