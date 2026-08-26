"use client";

import { CanvasShell } from "@/components/three/CanvasShell";
import { MemoryGalleryScene } from "@/components/three/MemoryGalleryScene";
import type { MemoryCard } from "@/data/memories";
import { useExperienceCapabilities } from "@/lib/three/useExperienceCapabilities";
import { useEffect, useRef, useState } from "react";

export function MemoryGalleryCanvas({
  cards,
  onSelect,
}: {
  cards: MemoryCard[];
  onSelect: (id: string) => void;
}) {
  const capabilities = useExperienceCapabilities();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (capabilities.reducedMotion) {
      return;
    }

    const onScroll = () => {
      const element = sectionRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const progress = Math.min(
        1,
        Math.max(0, (view - rect.top) / (rect.height + view * 0.35)),
      );
      setScrollProgress(progress);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [capabilities.reducedMotion]);

  return (
    <div ref={sectionRef} className="relative h-[70vh] min-h-[28rem] w-full">
      <CanvasShell
        className="h-full w-full"
        ariaLabel="Spatial gallery of relationship photographs"
        camera={{ position: [0, 0, 3.4], fov: 42 }}
      >
        <MemoryGalleryScene
          cards={cards}
          scrollProgress={capabilities.reducedMotion ? 0.35 : scrollProgress}
          reducedMotion={capabilities.reducedMotion}
          onSelect={onSelect}
        />
      </CanvasShell>
      <p className="pointer-events-none absolute bottom-4 left-4 right-4 text-center font-sans text-xs uppercase tracking-[0.16em] text-ivory/70">
        Scroll to move through the memories · select a print for its story
      </p>
    </div>
  );
}
