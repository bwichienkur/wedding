"use client";

import { WaxSeal } from "@/components/entry/WaxSeal";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";
import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
} from "react";

interface InvitationEnvelopeProps {
  open: boolean;
  glowing: boolean;
  reduceMotion: boolean;
  onOpen: () => void;
}

type FlapSide = "top" | "bottom" | "left" | "right";

/**
 * Full-viewport navy envelope with gold wax seal.
 * Crisp silvery filigree embossing runs along each flap’s diagonal folds
 * (WooowInvites-style). On seal open, vines illuminate gold.
 */
export function InvitationEnvelope({
  open,
  glowing,
  reduceMotion,
  onOpen,
}: InvitationEnvelopeProps) {
  const [shellEl, setShellEl] = useState<HTMLDivElement | null>(null);
  const { foldAngle, foldLengthPx } = useShellMetrics(shellEl);

  return (
    <div
      ref={setShellEl}
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

      <EnvelopeFlap
        side="bottom"
        open={open}
        reduceMotion={reduceMotion}
        foldAngle={foldAngle}
        foldLengthPx={foldLengthPx}
      />
      <EnvelopeFlap
        side="left"
        open={open}
        reduceMotion={reduceMotion}
        foldAngle={foldAngle}
        foldLengthPx={foldLengthPx}
      />
      <EnvelopeFlap
        side="right"
        open={open}
        reduceMotion={reduceMotion}
        foldAngle={foldAngle}
        foldLengthPx={foldLengthPx}
      />
      <EnvelopeFlap
        side="top"
        open={open}
        reduceMotion={reduceMotion}
        foldAngle={foldAngle}
        foldLengthPx={foldLengthPx}
      />

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

function useShellMetrics(shell: HTMLElement | null) {
  const [metrics, setMetrics] = useState({ foldAngle: 45, foldLengthPx: 480 });

  const measure = useCallback(() => {
    if (!shell) return;
    const { width, height } = shell.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;
    setMetrics({
      foldAngle: (Math.atan(height / width) * 180) / Math.PI,
      // Leave room for the seal at center
      foldLengthPx: 0.5 * Math.hypot(width, height) * 0.74,
    });
  }, [shell]);

  useEffect(() => {
    if (!shell) return;
    const observer = new ResizeObserver(measure);
    observer.observe(shell);
    return () => observer.disconnect();
  }, [shell, measure]);

  return metrics;
}

function EnvelopeFlap({
  side,
  open,
  reduceMotion,
  foldAngle,
  foldLengthPx,
}: {
  side: FlapSide;
  open: boolean;
  reduceMotion: boolean;
  foldAngle: number;
  foldLengthPx: number;
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
        {/* Filigree along both hypotenuses of every flap (reference X look) */}
        <FoldVine
          side={side}
          which="a"
          foldAngle={foldAngle}
          foldLengthPx={foldLengthPx}
        />
        <FoldVine
          side={side}
          which="b"
          foldAngle={foldAngle}
          foldLengthPx={foldLengthPx}
        />
      </div>
    </div>
  );
}

function FoldVine({
  side,
  which,
  foldAngle,
  foldLengthPx,
}: {
  side: FlapSide;
  which: "a" | "b";
  foldAngle: number;
  foldLengthPx: number;
}) {
  const style = foldStyle(side, which, foldAngle, foldLengthPx);

  return (
    <>
      <div
        className="envelope-design envelope-design-emboss"
        style={{
          ...style,
          backgroundImage: "url(/images/envelope-vine-edge.webp)",
        }}
      />
      <div
        className="envelope-design envelope-design-glow"
        style={{
          ...style,
          backgroundImage: "url(/images/envelope-vine-edge-glow.webp)",
        }}
      />
    </>
  );
}

function foldStyle(
  side: FlapSide,
  which: "a" | "b",
  foldAngle: number,
  foldLengthPx: number,
): CSSProperties {
  // Wide enough for leaf/rose detail to read on mobile (reference look)
  const band = "min(13vmax, 6.75rem)";
  const inset = "4%";
  const width = `${Math.round(foldLengthPx)}px`;

  const base = {
    width,
    height: band,
  } as CSSProperties;

  // Each flap owns vines along its two hypotenuses, inset so folds don’t double-stack
  if (side === "top" && which === "a") {
    return {
      ...base,
      left: inset,
      top: inset,
      transformOrigin: "left center",
      transform: `rotate(${foldAngle}deg)`,
    };
  }
  if (side === "top" && which === "b") {
    return {
      ...base,
      right: inset,
      top: inset,
      transformOrigin: "right center",
      transform: `rotate(${-foldAngle}deg)`,
    };
  }
  if (side === "bottom" && which === "a") {
    return {
      ...base,
      left: inset,
      bottom: inset,
      transformOrigin: "left center",
      transform: `rotate(${-foldAngle}deg)`,
    };
  }
  if (side === "bottom" && which === "b") {
    return {
      ...base,
      right: inset,
      bottom: inset,
      transformOrigin: "right center",
      transform: `rotate(${foldAngle}deg)`,
    };
  }
  if (side === "left" && which === "a") {
    return {
      ...base,
      left: inset,
      top: inset,
      transformOrigin: "left center",
      transform: `rotate(${foldAngle}deg)`,
    };
  }
  if (side === "left" && which === "b") {
    return {
      ...base,
      left: inset,
      bottom: inset,
      transformOrigin: "left center",
      transform: `rotate(${-foldAngle}deg)`,
    };
  }
  if (side === "right" && which === "a") {
    return {
      ...base,
      right: inset,
      top: inset,
      transformOrigin: "right center",
      transform: `rotate(${-foldAngle}deg)`,
    };
  }
  return {
    ...base,
    right: inset,
    bottom: inset,
    transformOrigin: "right center",
    transform: `rotate(${foldAngle}deg)`,
  };
}
