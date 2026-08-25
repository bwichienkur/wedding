"use client";

import { cn } from "@/lib/cn";
import type { FlapSide, IntroPhase } from "./types";
import { isIlluminatedPhase, isOpeningPhase } from "./types";

interface EnvelopeFlapProps {
  side: FlapSide;
  phase: IntroPhase;
  reduceMotion: boolean;
}

/**
 * One triangular flap. Clip stays on the outer shell; 3D peel runs on the
 * inner face so clip-path does not flatten the transform.
 */
export function EnvelopeFlap({ side, phase, reduceMotion }: EnvelopeFlapProps) {
  const opening = isOpeningPhase(phase);
  const illuminated = isIlluminatedPhase(phase);

  return (
    <div
      className={cn(
        "envelope-flap absolute inset-0 pointer-events-none",
        `envelope-flap-${side}`,
      )}
      aria-hidden
    >
      <div
        className={cn(
          "envelope-flap-hinge absolute inset-0",
          opening && !reduceMotion && "is-open",
          opening && reduceMotion && "is-open-instant",
          illuminated && "is-illuminated",
        )}
      >
        <div
          className="envelope-flap-face absolute inset-0 envelope-master-face"
          style={{
            backgroundImage: "url(/images/envelope-master.webp)",
          }}
        />
        <div
          className={cn(
            "envelope-flap-face absolute inset-0 envelope-floral-glow-face",
            illuminated && "is-lit",
          )}
          style={{
            backgroundImage: "url(/images/envelope-master-glow.webp)",
          }}
        />
        <div className="envelope-flap-rim" />
      </div>
    </div>
  );
}
