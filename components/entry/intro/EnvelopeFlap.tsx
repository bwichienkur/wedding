"use client";

import { cn } from "@/lib/cn";
import type { FlapSide, IntroPhase } from "./types";
import { isOpeningPhase } from "./types";

interface EnvelopeFlapProps {
  side: FlapSide;
  phase: IntroPhase;
  reduceMotion: boolean;
}

/**
 * One triangular flap. Clip on the outer shell; peel on the inner hinge.
 * Uses the closed master so the open reads as the same envelope peeling away
 * (glow stays on the sealed layer only — avoids laser-seam ghosts while opening).
 */
export function EnvelopeFlap({ side, phase, reduceMotion }: EnvelopeFlapProps) {
  const opening = isOpeningPhase(phase);

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
        )}
      >
        <div
          className="envelope-flap-face absolute inset-0 envelope-master-face"
          style={{
            backgroundImage: "url(/images/envelope-master-closed.webp)",
          }}
        />
        <div className="envelope-flap-rim" />
      </div>
    </div>
  );
}
