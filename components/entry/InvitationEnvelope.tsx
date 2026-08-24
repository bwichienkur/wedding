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
 * Portrait invitation envelope with four meeting flaps and a central wax seal.
 * Closed until `open` is set by an explicit seal click — no mount animation.
 */
export function InvitationEnvelope({
  open,
  glowing,
  reduceMotion,
  onOpen,
}: InvitationEnvelopeProps) {
  return (
    <div className="relative mx-auto w-[min(72vw,17.5rem)] sm:w-[18.5rem]">
      <div
        className={cn(
          "envelope-shell relative aspect-[9/16] w-full overflow-visible rounded-sm",
          "shadow-[0_28px_60px_-18px_rgba(48,20,24,0.55),0_8px_20px_rgba(48,20,24,0.25)]",
          open && !reduceMotion && "envelope-shell-open",
        )}
        style={
          reduceMotion
            ? undefined
            : { perspective: 1400, transformStyle: "preserve-3d" }
        }
      >
        <div
          className="envelope-liner absolute inset-0 rounded-sm"
          aria-hidden
        />

        <div
          className={cn(
            "absolute inset-[12%] z-0 flex flex-col items-center justify-center bg-[#f4ebe0] text-center",
            "opacity-0 transition-opacity duration-300",
            open && "opacity-100 delay-200",
          )}
          aria-hidden
        >
          <p className="font-display text-lg text-[#3a2426]">
            {wedding.couple.partnerOne}
          </p>
          <p className="font-display text-base text-[#8f655c]">&</p>
          <p className="font-display text-lg text-[#3a2426]">
            {wedding.couple.partnerTwo}
          </p>
          <p className="mt-3 font-sans text-[0.65rem] uppercase tracking-[0.22em] text-[#6b605a]">
            {wedding.wedding.dateDisplay}
          </p>
        </div>

        <EnvelopeFlap side="top" open={open} reduceMotion={reduceMotion} />
        <EnvelopeFlap side="bottom" open={open} reduceMotion={reduceMotion} />
        <EnvelopeFlap side="left" open={open} reduceMotion={reduceMotion} />
        <EnvelopeFlap side="right" open={open} reduceMotion={reduceMotion} />

        <WaxSeal
          open={open}
          glowing={glowing}
          reduceMotion={reduceMotion}
          onOpen={onOpen}
        />
      </div>

      <p
        className={cn(
          "pointer-events-none mt-6 text-center font-display text-xl text-[#3a2426] transition-opacity duration-300 sm:text-2xl",
          open && "opacity-0",
        )}
      >
        {wedding.couple.displayName}
      </p>
      <p
        className={cn(
          "pointer-events-none mt-2 text-center font-sans text-xs uppercase tracking-[0.28em] text-[#6b605a] transition-opacity duration-300",
          open && "opacity-0",
        )}
      >
        {wedding.wedding.dateDisplay}
      </p>
      <p
        className={cn(
          "pointer-events-none mt-5 text-center font-sans text-sm tracking-wide text-[#8f655c] transition-opacity duration-300",
          open && "opacity-0",
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
        <EmbossMotif side={side} />
      </div>
    </div>
  );
}

function EmbossMotif({ side }: { side: "top" | "bottom" | "left" | "right" }) {
  if (side !== "left" && side !== "right") return null;

  return (
    <svg
      viewBox="0 0 120 240"
      className="absolute inset-0 h-full w-full opacity-[0.14]"
      aria-hidden
    >
      <g
        fill="#e8d5c4"
        opacity="0.9"
        transform={side === "right" ? "translate(120,0) scale(-1,1)" : undefined}
      >
        <ellipse cx="46" cy="96" rx="10" ry="16" transform="rotate(-28 46 96)" />
        <ellipse cx="58" cy="128" rx="12" ry="18" transform="rotate(18 58 128)" />
        <ellipse cx="44" cy="158" rx="9" ry="14" transform="rotate(-12 44 158)" />
        <ellipse cx="62" cy="186" rx="11" ry="15" transform="rotate(22 62 186)" />
      </g>
    </svg>
  );
}
