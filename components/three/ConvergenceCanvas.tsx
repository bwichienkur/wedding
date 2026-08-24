"use client";

import { CanvasShell } from "@/components/three/CanvasShell";
import { ConvergenceScene } from "@/components/three/ConvergenceScene";
import { useExperienceCapabilities } from "@/lib/three/useExperienceCapabilities";
import { useEffect, useRef, useState } from "react";

export function ConvergenceCanvas() {
  const capabilities = useExperienceCapabilities();
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(capabilities.reducedMotion ? 1 : 0);

  useEffect(() => {
    if (capabilities.reducedMotion) return;

    const onScroll = () => {
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const value = Math.min(
        1,
        Math.max(0, (view * 0.75 - rect.top) / (rect.height * 0.9)),
      );
      setProgress(value);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [capabilities.reducedMotion]);

  return (
    <div ref={ref} className="h-[22rem] w-full sm:h-[28rem]">
      <CanvasShell
        className="h-full w-full"
        ariaLabel="Bright and Lexi’s paths weaving into one golden thread"
        camera={{ position: [0.4, 0, 4.2], fov: 40 }}
      >
        <ConvergenceScene
          progress={progress}
          reducedMotion={capabilities.reducedMotion}
        />
      </CanvasShell>
    </div>
  );
}
