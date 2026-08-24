"use client";

import { WeddingPlayer } from "@/components/video/WeddingPlayer";
import { useEffect, useRef, useState } from "react";

/**
 * Muted, playsInline background/teaser video that pauses when offscreen.
 * Never plays with sound.
 */
export function BackgroundTeaser({
  playbackId,
  posterUrl,
  title,
}: {
  playbackId: string;
  posterUrl?: string | null;
  title: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="overflow-hidden">
      {active ? (
        <WeddingPlayer
          playbackId={playbackId}
          title={title}
          posterUrl={posterUrl}
          autoPlayMuted
          status="ready"
        />
      ) : (
        <div className="aspect-video bg-parchment">
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={posterUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
      )}
    </div>
  );
}
