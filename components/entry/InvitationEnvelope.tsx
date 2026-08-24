"use client";

import { WaxSeal } from "@/components/entry/WaxSeal";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";

interface InvitationEnvelopeProps {
  open: boolean;
  glowing: boolean;
  reduceMotion: boolean;
  onOpen: () => void;
}

/**
 * Full-viewport navy envelope with gold wax seal.
 * Flaps open onto the live site (transparent liner) — no interstitial card.
 */
export function InvitationEnvelope({
  open,
  glowing,
  reduceMotion,
  onOpen,
}: InvitationEnvelopeProps) {
  return (
    <div
      className={cn(
        "envelope-shell absolute inset-0 h-full w-full overflow-hidden",
        glowing && "is-illuminated",
        open && !reduceMotion && "envelope-shell-open",
      )}
      style={
        reduceMotion
          ? undefined
          : { perspective: 1800, transformStyle: "preserve-3d" }
      }
    >
      {/* Transparent so opening flaps reveal the homepage underneath */}
      <div className="envelope-liner absolute inset-0" aria-hidden />

      <EnvelopeFlap side="top" open={open} reduceMotion={reduceMotion} />
      <EnvelopeFlap side="bottom" open={open} reduceMotion={reduceMotion} />
      <EnvelopeFlap side="left" open={open} reduceMotion={reduceMotion} />
      <EnvelopeFlap side="right" open={open} reduceMotion={reduceMotion} />

      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-[12%] z-20 w-[min(92%,24rem)] -translate-x-1/2 text-center",
          "transition-opacity duration-700",
          (glowing || open) && "opacity-0",
        )}
      >
        <p className="font-annotation text-[1.65rem] leading-snug text-[#e8c872] drop-shadow-[0_1px_2px_rgba(8,16,32,0.65)] sm:text-3xl">
          For {wedding.couple.partnerOne} & {wedding.couple.partnerTwo}
        </p>
        <p className="mt-3 font-sans text-[0.7rem] uppercase tracking-[0.32em] text-[#d4b65c]">
          {wedding.wedding.dateDisplay}
        </p>
      </div>

      <WaxSeal
        open={open}
        glowing={glowing}
        reduceMotion={reduceMotion}
        onOpen={onOpen}
        className="scale-110 sm:scale-125"
      />

      <p
        className={cn(
          "pointer-events-none absolute bottom-[11%] left-1/2 z-20 -translate-x-1/2",
          "font-sans text-sm tracking-[0.14em] text-[#e0c56a]",
          "transition-opacity duration-700",
          (glowing || open) && "opacity-0",
        )}
      >
        Tap the seal to open
      </p>
    </div>
  );
}

function EnvelopeFlap({
  side,
  open,
  reduceMotion,
}: {
  side: "top" | "bottom" | "left" | "right";
  open: boolean;
  reduceMotion: boolean;
}) {
  return (
    <div
      className={cn(
        "envelope-flap absolute pointer-events-none",
        `envelope-flap-${side}`,
        open && !reduceMotion && "is-open",
        open && reduceMotion && "is-open-instant",
      )}
      aria-hidden
    >
      <div className="envelope-flap-face absolute inset-0">
        <div className="envelope-texture envelope-texture-rest" />
        <div className="envelope-texture envelope-texture-foil" />
      </div>
    </div>
  );
}
