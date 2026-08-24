"use client";

import { cn } from "@/lib/cn";
import { WaxSealButton } from "./WaxSealButton";
import type { IntroPhase } from "./types";
import { isIlluminatedPhase, isOpeningPhase, isSealVisiblePhase } from "./types";

interface EnvelopeProps {
  phase: IntroPhase;
  reduceMotion: boolean;
  onActivate: () => void;
}

/**
 * Closed master illustration with seal hotspot.
 * After glow, the envelope fades out and the homepage takes over immediately
 * (no flap-morph / card-rise handoff).
 */
export function Envelope({ phase, reduceMotion, onActivate }: EnvelopeProps) {
  const opening = isOpeningPhase(phase);
  const illuminated = isIlluminatedPhase(phase);
  const sealVisible = isSealVisiblePhase(phase);
  const floralGlow =
    phase === "activating" || phase === "glowing" || phase === "opening";

  return (
    <div
      className={cn(
        "intro-envelope-stage",
        illuminated && "is-illuminated",
        floralGlow && "is-floral-glow",
        opening && "intro-envelope-exiting",
      )}
    >
      <div className="envelope-shell intro-envelope relative h-full w-full overflow-hidden">
        <div
          className={cn(
            "envelope-closed-master absolute inset-0 z-[6]",
            "transition-opacity ease-out",
            opening ? "pointer-events-none opacity-0 duration-500" : "opacity-100 duration-500",
          )}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/envelope-master-closed.webp"
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/envelope-master-glow.webp"
            alt=""
            className={cn(
              "envelope-floral-glow absolute inset-0 h-full w-full object-cover",
              floralGlow && "is-lit",
            )}
            draggable={false}
          />
        </div>

        <WaxSealButton
          phase={phase}
          reduceMotion={reduceMotion}
          onActivate={onActivate}
          visible={sealVisible}
          hotspotOnly
        />
      </div>
    </div>
  );
}
