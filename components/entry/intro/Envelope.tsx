"use client";

import { cn } from "@/lib/cn";
import { EnvelopeFlap } from "./EnvelopeFlap";
import { InvitationCard } from "./InvitationCard";
import { WaxSealButton } from "./WaxSealButton";
import type { IntroPhase } from "./types";
import { isIlluminatedPhase, isOpeningPhase, isSealVisiblePhase } from "./types";

interface EnvelopeProps {
  phase: IntroPhase;
  reduceMotion: boolean;
  onActivate: () => void;
}

/**
 * Closed state uses the full master mockup for exact visual match.
 * Opening swaps to four clipped flaps of the blank master + live seal.
 */
export function Envelope({ phase, reduceMotion, onActivate }: EnvelopeProps) {
  const opening = isOpeningPhase(phase);
  const illuminated = isIlluminatedPhase(phase);
  const closedVisual = phase === "closed" || phase === "activating" || phase === "glowing";
  const sealVisible = isSealVisiblePhase(phase) || phase === "opening";

  return (
    <div
      className={cn(
        "intro-envelope-stage",
        illuminated && "is-illuminated",
        opening && !reduceMotion && "intro-envelope-opening",
      )}
    >
      <div
        className={cn(
          "envelope-shell intro-envelope relative h-full w-full overflow-hidden",
          opening && !reduceMotion && "envelope-shell-open",
        )}
        style={
          reduceMotion
            ? undefined
            : { perspective: 1800, transformStyle: "preserve-3d" }
        }
      >
        <div className="envelope-interior absolute inset-0" aria-hidden />

        {/* Exact closed mockup */}
        <div
          className={cn(
            "envelope-closed-master absolute inset-0 z-[6]",
            "transition-opacity duration-500",
            closedVisual ? "opacity-100" : "pointer-events-none opacity-0",
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
        </div>

        {/* Animated flaps (blank master) — under closed image until open */}
        <div
          className={cn(
            "absolute inset-0",
            closedVisual && "opacity-0",
            opening && "opacity-100",
          )}
        >
          <EnvelopeFlap side="bottom" phase={phase} reduceMotion={reduceMotion} />
          <EnvelopeFlap side="left" phase={phase} reduceMotion={reduceMotion} />
          <EnvelopeFlap side="right" phase={phase} reduceMotion={reduceMotion} />
          <EnvelopeFlap side="top" phase={phase} reduceMotion={reduceMotion} />
        </div>

        <InvitationCard visible={opening && !reduceMotion} />

        <WaxSealButton
          phase={phase}
          reduceMotion={reduceMotion}
          onActivate={onActivate}
          visible={sealVisible}
          hotspotOnly={closedVisual}
        />
      </div>
    </div>
  );
}
