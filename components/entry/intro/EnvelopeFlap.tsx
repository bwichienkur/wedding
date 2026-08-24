"use client";

import { cn } from "@/lib/cn";
import type { FlapSide, IntroPhase } from "./types";
import { isIlluminatedPhase, isOpeningPhase } from "./types";

interface EnvelopeFlapProps {
  side: FlapSide;
  phase: IntroPhase;
  reduceMotion: boolean;
}

/** One triangular flap showing a clipped slice of the shared master illustration */
export function EnvelopeFlap({ side, phase, reduceMotion }: EnvelopeFlapProps) {
  const opening = isOpeningPhase(phase);
  const illuminated = isIlluminatedPhase(phase);

  return (
    <div
      className={cn(
        "envelope-flap absolute inset-0 pointer-events-none",
        `envelope-flap-${side}`,
        opening && !reduceMotion && "is-open",
        opening && reduceMotion && "is-open-instant",
        illuminated && "is-illuminated",
      )}
      aria-hidden
    >
      <div
        className="envelope-flap-face absolute inset-0 envelope-master-face"
        style={{
          backgroundImage: "url(/images/envelope-master.webp)",
        }}
      />
      <div className="envelope-flap-rim" />
    </div>
  );
}
