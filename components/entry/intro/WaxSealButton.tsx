"use client";

import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";
import { GoldParticles } from "./GoldParticles";
import type { IntroPhase } from "./types";

interface WaxSealButtonProps {
  phase: IntroPhase;
  reduceMotion: boolean;
  onActivate: () => void;
  visible: boolean;
}

export function WaxSealButton({
  phase,
  reduceMotion,
  onActivate,
  visible,
}: WaxSealButtonProps) {
  const activating = phase === "activating";
  const glowing = phase === "glowing";
  const opening = phase === "opening";
  const interactive = phase === "closed";

  const hint =
    glowing || activating
      ? wedding.entry.openingHint
      : wedding.entry.tapHint;

  return (
    <>
      <div
        className={cn(
          "intro-seal-glow pointer-events-none absolute left-1/2 top-1/2 z-[25] -translate-x-1/2 -translate-y-1/2",
          (glowing || opening) && "is-active",
          activating && "is-activating",
        )}
        aria-hidden
      />

      <div
        className={cn(
          "intro-seal-wrap absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2",
          "transition-opacity duration-500",
          !visible && "opacity-0",
        )}
      >
        <GoldParticles
          active={glowing || opening}
          reduceMotion={reduceMotion}
        />

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (interactive) onActivate();
          }}
          disabled={!interactive}
          aria-label={wedding.entry.beginLabel}
          className={cn(
            "intro-seal-button relative block rounded-full",
            "transition-transform duration-300 ease-out",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e0c56a]",
            "disabled:cursor-default",
            interactive &&
              !reduceMotion &&
              "hover:scale-[1.03] active:scale-[0.97]",
            activating && !reduceMotion && "is-pressing",
            glowing && !reduceMotion && "is-glowing",
            opening && !reduceMotion && "is-lifting",
            opening && reduceMotion && "opacity-0",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/wax-seal-bl.webp"
            alt=""
            width={200}
            height={200}
            draggable={false}
            className={cn(
              "intro-seal-image pointer-events-none select-none",
              "drop-shadow-[0_14px_28px_rgba(8,16,40,0.6)]",
            )}
          />
        </button>
      </div>

      <p
        className={cn(
          "intro-seal-hint pointer-events-none absolute left-1/2 z-20 -translate-x-1/2",
          "font-sans uppercase tracking-[0.18em] text-[#e0c56a]",
          "transition-opacity duration-500",
          !visible && "opacity-0",
          (glowing || opening) && "opacity-90",
        )}
        aria-live="polite"
      >
        <span className="intro-seal-hint-flourish" aria-hidden>
          ✦
        </span>
        {hint}
        <span className="intro-seal-hint-flourish" aria-hidden>
          ✦
        </span>
      </p>
    </>
  );
}
