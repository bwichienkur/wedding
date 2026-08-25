"use client";

import { cn } from "@/lib/cn";
import { EnvelopeFlap } from "./EnvelopeFlap";
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
 * After glow, four flaps peel open with the seal, revealing the homepage beneath.
 */
export function Envelope({ phase, reduceMotion, onActivate }: EnvelopeProps) {
  const opening = isOpeningPhase(phase);
  const illuminated = isIlluminatedPhase(phase);
  const closedVisual =
    phase === "closed" || phase === "activating" || phase === "glowing";
  const sealVisible = isSealVisiblePhase(phase) || phase === "opening";
  const floralGlow =
    phase === "activating" || phase === "glowing" || phase === "opening";
  const monogramLit = phase === "activating" || phase === "glowing";
  const idleTwinkle = phase === "closed" && !reduceMotion;

  return (
    <div
      className={cn(
        "intro-envelope-stage",
        illuminated && "is-illuminated",
        floralGlow && "is-floral-glow",
        opening && !reduceMotion && "intro-envelope-opening",
        opening && reduceMotion && "intro-envelope-exiting",
      )}
    >
      <div
        className={cn(
          "envelope-shell intro-envelope relative h-full w-full",
          opening && !reduceMotion ? "overflow-visible" : "overflow-hidden",
          opening && !reduceMotion && "envelope-shell-open",
        )}
        style={
          reduceMotion
            ? undefined
            : { perspective: 1800, transformStyle: "preserve-3d" }
        }
      >
        <div className="envelope-interior absolute inset-0" aria-hidden />

        {/* Exact closed mockup — visible through glow, then yields to peeling flaps */}
        <div
          className={cn(
            "envelope-closed-master absolute inset-0 z-[6]",
            "transition-opacity duration-400 ease-out",
            closedVisual ? "opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/envelope-master-closed.webp"
            alt=""
            className="h-full w-full object-fill"
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/envelope-master-glow.webp"
            alt=""
            className={cn(
              "envelope-floral-glow absolute inset-0 h-full w-full object-fill",
              floralGlow && closedVisual && "is-lit",
            )}
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/seal-monogram-glow.webp"
            alt=""
            className={cn(
              "intro-monogram-glow absolute inset-0 h-full w-full object-fill",
              monogramLit && "is-lit",
              idleTwinkle && "is-idle-twinkle",
            )}
            draggable={false}
          />
        </div>

        {/* Peeling flaps — under closed image until open begins */}
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

        <WaxSealButton
          phase={phase}
          reduceMotion={reduceMotion}
          onActivate={onActivate}
          visible={sealVisible}
          hotspotOnly={closedVisual}
          idleTwinkle={idleTwinkle}
        />
      </div>
    </div>
  );
}
