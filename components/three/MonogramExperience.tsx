"use client";

import { MonogramSvg } from "@/components/monogram/MonogramSvg";
import { CanvasShell } from "@/components/three/CanvasShell";
import {
  MonogramKnot,
  MonogramLights,
} from "@/components/three/MonogramKnot";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";
import { useExperienceCapabilities } from "@/lib/three/useExperienceCapabilities";

interface MonogramExperienceProps {
  className?: string;
  showDate?: boolean;
}

/**
 * Dimensional monogram with static SVG fallback.
 * Import this module dynamically so Three.js stays out of the initial bundle.
 */
export function MonogramExperience({
  className,
  showDate = true,
}: MonogramExperienceProps) {
  const capabilities = useExperienceCapabilities();
  const use3d =
    wedding.featureFlags.threeMonogram &&
    capabilities.webgl &&
    !capabilities.simplified;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {use3d ? (
        <CanvasShell
          className="h-36 w-36 sm:h-44 sm:w-44"
          ariaLabel={`${wedding.couple.displayName} dimensional monogram`}
          camera={{ position: [0, 0, 3.4], fov: 40 }}
        >
          <MonogramLights tier={capabilities.tier} />
          <MonogramKnot
            reducedMotion={capabilities.reducedMotion}
            pointerParallax={capabilities.tier !== "low"}
          />
        </CanvasShell>
      ) : (
        <MonogramSvg className="h-28 w-28 sm:h-36 sm:w-36" />
      )}
      {showDate ? (
        <p className="font-sans text-xs uppercase tracking-[0.22em] text-gold">
          {wedding.wedding.dateDisplay}
        </p>
      ) : null}
    </div>
  );
}
