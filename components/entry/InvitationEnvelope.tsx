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

type FlapSide = "top" | "bottom" | "left" | "right";
type VineAsset = "h" | "v" | "corner" | "bottom";

/**
 * Full-viewport navy envelope with gold wax seal.
 * Silvery filigree spreads along outer flap edges and corners
 * (WooowInvites-style). On seal open, only the emboss illuminates gold.
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
      <div className="envelope-liner absolute inset-0" aria-hidden />

      <EnvelopeFlap side="bottom" open={open} reduceMotion={reduceMotion} />
      <EnvelopeFlap side="left" open={open} reduceMotion={reduceMotion} />
      <EnvelopeFlap side="right" open={open} reduceMotion={reduceMotion} />
      <EnvelopeFlap side="top" open={open} reduceMotion={reduceMotion} />

      <div
        className={cn(
          "pointer-events-none absolute left-1/2 top-[10%] z-20 w-[min(92%,26rem)] -translate-x-1/2 text-center",
          "transition-opacity duration-700",
          (glowing || open) && "opacity-0",
        )}
      >
        <p className="font-display text-[1.35rem] font-medium italic leading-snug tracking-[0.01em] text-[#e8c872] drop-shadow-[0_1px_3px_rgba(8,16,32,0.75)] sm:text-[1.7rem]">
          {wedding.entry.inviteHeadline}
        </p>
        <p className="mt-3 font-sans text-[0.68rem] uppercase tracking-[0.28em] text-[#d4b65c] sm:text-[0.72rem]">
          {wedding.entry.inviteSubline}
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
  side: FlapSide;
  open: boolean;
  reduceMotion: boolean;
}) {
  return (
    <div
      className={cn(
        "envelope-flap absolute inset-0 pointer-events-none",
        `envelope-flap-${side}`,
        open && !reduceMotion && "is-open",
        open && reduceMotion && "is-open-instant",
      )}
      aria-hidden
    >
      <div className="envelope-flap-face absolute inset-0">
        {side === "top" && (
          <>
            <VineOrnament asset="h" className="envelope-ornament-top-edge" />
            <VineOrnament asset="corner" className="envelope-ornament-top-left" />
            <VineOrnament
              asset="corner"
              className="envelope-ornament-top-right"
              mirror
            />
          </>
        )}
        {side === "left" && (
          <VineOrnament asset="v" className="envelope-ornament-left-edge" />
        )}
        {side === "right" && (
          <VineOrnament asset="v" className="envelope-ornament-right-edge" />
        )}
        {side === "bottom" && (
          <>
            <VineOrnament asset="h" className="envelope-ornament-bottom-edge" />
            <VineOrnament
              asset="bottom"
              className="envelope-ornament-bottom-center"
            />
          </>
        )}
      </div>
    </div>
  );
}

function VineOrnament({
  asset,
  className,
  mirror,
}: {
  asset: VineAsset;
  className?: string;
  mirror?: boolean;
}) {
  const src = {
    h: "envelope-vine-h",
    v: "envelope-vine-v",
    corner: "envelope-vine-corner",
    bottom: "envelope-vine-bottom",
  }[asset];

  return (
    <>
      <div
        className={cn(
          "envelope-design envelope-design-emboss",
          className,
          mirror && "envelope-design-mirror",
        )}
        style={{ backgroundImage: `url(/images/${src}.webp)` }}
      />
      <div
        className={cn(
          "envelope-design envelope-design-glow",
          className,
          mirror && "envelope-design-mirror",
        )}
        style={{ backgroundImage: `url(/images/${src}-glow.webp)` }}
      />
    </>
  );
}
