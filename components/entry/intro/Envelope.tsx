"use client";

import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";
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
 * After glow, the sealed envelope folds open gently onto the homepage.
 */
export function Envelope({ phase, reduceMotion, onActivate }: EnvelopeProps) {
  const opening = isOpeningPhase(phase);
  const illuminated = isIlluminatedPhase(phase);
  const closedVisual =
    phase === "closed" || phase === "activating" || phase === "glowing";
  const sealVisible = isSealVisiblePhase(phase) || phase === "opening";
  const floralGlow =
    phase === "activating" || phase === "glowing" || phase === "opening";
  const monogramLit =
    phase === "activating" || phase === "glowing" || phase === "opening";
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
      style={
        {
          ["--intro-seal-x" as string]: "49.91%",
          ["--intro-seal-y" as string]: "46.08%",
        } as CSSProperties
      }
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
            : { perspective: 1200, transformStyle: "preserve-3d" }
        }
      >
        <div className="envelope-interior absolute inset-0" aria-hidden />

        {/* Exact closed mockup — stays through glow, then crossfades into peeling flaps */}
        <div
          className={cn(
            "envelope-closed-master absolute inset-0 z-[6]",
            closedVisual
              ? "opacity-100"
              : "pointer-events-none opacity-0 duration-200",
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
              floralGlow && "is-lit",
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

        {/* Peeling flaps — matched closed art, under sealed layer until open */}
        <div
          className={cn(
            "absolute inset-0 z-[5]",
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
