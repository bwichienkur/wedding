"use client";

import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";
import type { IntroPhase } from "./types";

interface WaxSealButtonProps {
  phase: IntroPhase;
  reduceMotion: boolean;
  onActivate: () => void;
  visible: boolean;
  /** Invisible hit-target over baked-in seal in the closed master image */
  hotspotOnly?: boolean;
  /** Soft idle twinkle while waiting for the first tap */
  idleTwinkle?: boolean;
}

export function WaxSealButton({
  phase,
  reduceMotion,
  onActivate,
  visible,
  hotspotOnly = false,
  idleTwinkle = false,
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
          "intro-seal-wrap absolute left-1/2 top-[var(--intro-seal-y,42.34%)] z-30 -translate-x-1/2 -translate-y-1/2",
          "transition-opacity duration-500",
          !visible && "opacity-0",
          idleTwinkle && "is-idle-twinkle",
          (activating || glowing) && "is-seal-lit",
        )}
      >
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
            opening && !reduceMotion && "is-lifting",
            opening && reduceMotion && "opacity-0",
            hotspotOnly && "intro-seal-hotspot",
          )}
        >
          {(idleTwinkle || activating || glowing) && !opening ? (
            <span className="intro-seal-idle-aura" aria-hidden />
          ) : null}
          {hotspotOnly ? (
            <span className="intro-seal-hotspot-area" aria-hidden />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/images/wax-seal-bl.webp"
              alt=""
              width={220}
              height={220}
              draggable={false}
              className={cn(
                "intro-seal-image pointer-events-none select-none",
                "drop-shadow-[0_16px_32px_rgba(8,16,40,0.65)]",
              )}
            />
          )}
        </button>
      </div>

      <p
        className={cn(
          "intro-seal-hint pointer-events-none absolute left-1/2 z-20 -translate-x-1/2",
          "font-sans uppercase tracking-[0.2em] text-[#e0c56a]",
          "transition-opacity duration-500",
          /* Master art already paints the tap line — only show HTML hint when
             we render a separate seal image (not hotspot-only). */
          hotspotOnly ||
            !(glowing || activating) ||
            opening ||
            !visible
            ? "opacity-0"
            : "opacity-100",
        )}
        aria-live="polite"
      >
        <span className="intro-seal-hint-flourish" aria-hidden>
          —
        </span>
        {hint}
        <span className="intro-seal-hint-flourish" aria-hidden>
          —
        </span>
      </p>
    </>
  );
}
