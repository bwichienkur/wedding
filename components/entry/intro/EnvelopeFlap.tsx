"use client";

import { cn } from "@/lib/cn";
import { EmbossedBotanicals } from "./EmbossedBotanicals";
import type { FlapSide, IntroPhase } from "./types";
import { isIlluminatedPhase, isOpeningPhase } from "./types";

interface EnvelopeFlapProps {
  side: FlapSide;
  phase: IntroPhase;
  reduceMotion: boolean;
}

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
      )}
      aria-hidden
    >
      <div className="envelope-flap-face envelope-paper absolute inset-0">
        <div className="envelope-flap-fold-line" aria-hidden />
        <EmbossedBotanicals side={side} illuminated={illuminated} />
      </div>
    </div>
  );
}
