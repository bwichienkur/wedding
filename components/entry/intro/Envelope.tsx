"use client";

import { cn } from "@/lib/cn";
import type { CSSProperties } from "react";
import { WaxSealButton } from "./WaxSealButton";
import type { IntroPhase } from "./types";
import { isIlluminatedPhase, isOpeningPhase, isSealVisiblePhase } from "./types";

interface EnvelopeProps {
  phase: IntroPhase;
  reduceMotion: boolean;
  onActivate: () => void;
}

/** Closed master illustration with seal hotspot and CSS-aligned radiance. */
export function Envelope({ phase, reduceMotion, onActivate }: EnvelopeProps) {
  const opening = isOpeningPhase(phase);
  const illuminated = isIlluminatedPhase(phase);
  const sealVisible = isSealVisiblePhase(phase);
  const floralGlow =
    phase === "activating" || phase === "glowing" || phase === "opening";
  const sealLit =
    phase === "activating" || phase === "glowing" || phase === "opening";
  const idleTwinkle = false;

  return (
    <div
      className={cn(
        "intro-envelope-stage",
        illuminated && "is-illuminated",
        floralGlow && "is-floral-glow",
        sealLit && "is-seal-lit",
        opening && !reduceMotion && "intro-envelope-opening",
        opening && reduceMotion && "intro-envelope-exiting",
      )}
      style={
        {
          ["--intro-seal-x" as string]: "47.73%",
          ["--intro-seal-y" as string]: "47.5%",
        } as CSSProperties
      }
    >
      <div
        className={cn(
          "envelope-shell intro-envelope relative h-full w-full overflow-hidden",
          opening && !reduceMotion && "envelope-shell-open",
        )}
      >
        <div
          className={cn(
            "envelope-closed-master absolute inset-0 z-[6]",
            opening && !reduceMotion && "is-opening",
            opening && reduceMotion && "opacity-0",
          )}
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/envelope-master-closed.webp?v=3"
            alt=""
            className="h-full w-full object-fill"
            draggable={false}
          />
          <div className="intro-envelope-copy pointer-events-none absolute inset-0 z-[4]">
            <p className="intro-envelope-names">For Bright and Lexi</p>
            <p className="intro-envelope-tap">Tap to open</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/envelope-master-glow.webp?v=3"
            alt=""
            className={cn(
              "envelope-floral-glow absolute inset-0 h-full w-full object-fill",
              floralGlow && "is-lit",
            )}
            draggable={false}
          />
          <div
            className={cn(
              "intro-seal-radiance pointer-events-none absolute z-[5]",
              sealLit && "is-lit",
            )}
            aria-hidden
          />
        </div>

        <WaxSealButton
          phase={phase}
          reduceMotion={reduceMotion}
          onActivate={onActivate}
          visible={sealVisible}
          hotspotOnly
          idleTwinkle={idleTwinkle}
        />
      </div>
    </div>
  );
}
