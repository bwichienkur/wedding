"use client";

import {
  INVITE_SCROLL_BG_POSTER,
  INVITE_SCROLL_BG_VIDEO,
} from "@/lib/media/invite-scroll-background";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Fixed floral scroll video — full-bleed on mobile; wider frame than the card on desktop. */
export function AmbientBackground({
  active,
  warm = false,
}: {
  active: boolean;
  warm?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
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

  return (
    <div
      className={cn(
        "invite-ambient-bg pointer-events-none fixed inset-0 z-0 overflow-hidden",
        "transition-opacity duration-500 ease-out",
        active ? "opacity-100" : "opacity-0",
      )}
      aria-hidden
    >
      <div className="invite-ambient-bg__frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={INVITE_SCROLL_BG_POSTER}
          alt=""
          className={cn(
            "invite-ambient-bg__media absolute inset-0 h-full w-full object-cover object-center",
            videoReady && !reduceMotion ? "opacity-0" : "opacity-100",
          )}
          decoding="async"
        />
        {reduceMotion ? null : (
          <video
            ref={videoRef}
            className={cn(
              "invite-ambient-bg__media absolute inset-0 h-full w-full object-cover object-center",
              "transition-opacity duration-700 ease-out",
              videoReady && active ? "opacity-100" : "opacity-0",
            )}
            src={INVITE_SCROLL_BG_VIDEO}
            poster={INVITE_SCROLL_BG_POSTER}
            autoPlay={false}
            loop
            muted
            playsInline
            preload={active ? "auto" : "metadata"}
            onCanPlay={() => setVideoReady(true)}
          />
        )}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_85%_at_50%_45%,transparent_55%,rgba(5,10,20,0.18)_100%)]" />
    </div>
  );
}
