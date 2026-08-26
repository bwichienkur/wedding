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

/**
 * Closed master illustration with seal hotspot.
 * After glow, the sealed envelope lifts/fades open onto the homepage
 * (avoids misregistered 3D flap morphs on the baked diamond art).
 */
export function Envelope({ phase, reduceMotion, onActivate }: EnvelopeProps) {
  const opening = isOpeningPhase(phase);
  const illuminated = isIlluminatedPhase(phase);
  const sealVisible = isSealVisiblePhase(phase);
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
          ["--intro-seal-x" as string]: "49.78%",
          ["--intro-seal-y" as string]: "42.34%",
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
