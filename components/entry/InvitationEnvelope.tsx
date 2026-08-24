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
 * Full-viewport sealed invitation — four flaps edge-to-edge, embossed florals
 * that illuminate on seal click, then open into the site.
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
          : { perspective: 1600, transformStyle: "preserve-3d" }
      }
    >
      <div className="envelope-liner absolute inset-0" aria-hidden />

      <div
        className={cn(
          "absolute inset-[8%] z-0 flex flex-col items-center justify-center bg-[#f4ebe0] text-center",
          "opacity-0 transition-opacity duration-500",
          open && "opacity-100 delay-150",
        )}
        aria-hidden
      >
        <p className="font-display text-3xl text-[#3a2426] sm:text-4xl">
          {wedding.couple.partnerOne}
        </p>
        <p className="font-display text-2xl text-[#8f655c]">&</p>
        <p className="font-display text-3xl text-[#3a2426] sm:text-4xl">
          {wedding.couple.partnerTwo}
        </p>
        <p className="mt-4 font-sans text-xs uppercase tracking-[0.28em] text-[#6b605a]">
          {wedding.wedding.dateDisplay}
        </p>
      </div>

      <EnvelopeFlap side="top" open={open} reduceMotion={reduceMotion} />
      <EnvelopeFlap side="bottom" open={open} reduceMotion={reduceMotion} />
      <EnvelopeFlap side="left" open={open} reduceMotion={reduceMotion} />
      <EnvelopeFlap side="right" open={open} reduceMotion={reduceMotion} />

      <p
        className={cn(
          "pointer-events-none absolute left-1/2 top-[14%] z-20 w-[min(90%,22rem)] -translate-x-1/2 text-center",
          "font-annotation text-xl text-[#f3e6dc]/85] sm:text-2xl",
          "transition-opacity duration-300",
          (glowing || open) && "opacity-0",
        )}
      >
        For {wedding.couple.partnerOne} and {wedding.couple.partnerTwo}
      </p>

      <WaxSeal
        open={open}
        glowing={glowing}
        reduceMotion={reduceMotion}
        onOpen={onOpen}
        className="scale-110 sm:scale-125"
      />

      <p
        className={cn(
          "pointer-events-none absolute bottom-[12%] left-1/2 z-20 -translate-x-1/2",
          "font-sans text-sm tracking-wide text-[#e8d5c4]/70",
          "transition-opacity duration-300",
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
        <EmbossMotif side={side} />
      </div>
    </div>
  );
}

function EmbossMotif({ side }: { side: "top" | "bottom" | "left" | "right" }) {
  if (side === "left" || side === "right") {
    return (
      <svg
        viewBox="0 0 200 480"
        className="envelope-emboss absolute inset-0 h-full w-full"
        aria-hidden
        preserveAspectRatio="xMidYMid slice"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={
            side === "right" ? "translate(200,0) scale(-1,1)" : undefined
          }
        >
          {/* Chrysanthemum-like bloom */}
          <g transform="translate(48,170)">
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i * Math.PI * 2) / 12;
              const x2 = Math.cos(a) * 36;
              const y2 = Math.sin(a) * 36;
              return (
                <path
                  key={i}
                  d={`M0 0 C ${x2 * 0.35} ${y2 * 0.15}, ${x2 * 0.7} ${y2 * 0.55}, ${x2} ${y2}`}
                />
              );
            })}
            <circle cx="0" cy="0" r="7" fill="currentColor" stroke="none" opacity="0.55" />
          </g>
          {/* Secondary bloom */}
          <g transform="translate(70,300)">
            {Array.from({ length: 10 }).map((_, i) => {
              const a = (i * Math.PI * 2) / 10;
              const x2 = Math.cos(a) * 26;
              const y2 = Math.sin(a) * 26;
              return (
                <path
                  key={i}
                  d={`M0 0 C ${x2 * 0.4} ${y2 * 0.2}, ${x2 * 0.75} ${y2 * 0.6}, ${x2} ${y2}`}
                />
              );
            })}
            <circle cx="0" cy="0" r="5" fill="currentColor" stroke="none" opacity="0.5" />
          </g>
          {/* Vine */}
          <path d="M48 210 C58 240, 52 270, 70 300 C86 328, 78 360, 92 400" />
          <path d="M58 250 C40 248, 34 268, 46 274" />
          <path d="M62 270 C80 262, 88 280, 74 288" />
          <path d="M78 330 C62 336, 58 354, 72 358" />
          <path d="M82 350 C98 342, 108 360, 94 368" />
          <ellipse cx="46" cy="274" rx="7" ry="11" transform="rotate(-20 46 274)" fill="currentColor" stroke="none" opacity="0.35" />
          <ellipse cx="74" cy="288" rx="6" ry="10" transform="rotate(24 74 288)" fill="currentColor" stroke="none" opacity="0.35" />
          <ellipse cx="72" cy="358" rx="6" ry="10" transform="rotate(-16 72 358)" fill="currentColor" stroke="none" opacity="0.35" />
          <ellipse cx="94" cy="368" rx="7" ry="11" transform="rotate(18 94 368)" fill="currentColor" stroke="none" opacity="0.35" />
        </g>
      </svg>
    );
  }

  if (side === "top") {
    return (
      <svg
        viewBox="0 0 400 220"
        className="envelope-emboss absolute inset-0 h-full w-full"
        aria-hidden
        preserveAspectRatio="xMidYMid slice"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M200 48 C188 62, 192 78, 200 92 C208 78, 212 62, 200 48" />
          <path d="M200 92 C170 88, 150 108, 168 122" />
          <path d="M200 92 C230 88, 250 108, 232 122" />
          <path d="M200 70 C176 66, 166 84, 180 90" />
          <path d="M200 70 C224 66, 234 84, 220 90" />
          <circle cx="200" cy="92" r="3.5" fill="currentColor" stroke="none" opacity="0.45" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 400 220"
      className="envelope-emboss absolute inset-0 h-full w-full"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M120 150 C160 130, 200 170, 240 145 C270 128, 290 150, 310 140" />
        <path d="M200 155 C188 140, 210 128, 218 146" />
        <path d="M240 145 C248 128, 272 132, 266 150" />
        <ellipse cx="218" cy="146" rx="6" ry="10" transform="rotate(-18 218 146)" fill="currentColor" stroke="none" opacity="0.35" />
        <ellipse cx="266" cy="150" rx="6" ry="10" transform="rotate(20 266 150)" fill="currentColor" stroke="none" opacity="0.35" />
      </g>
    </svg>
  );
}
