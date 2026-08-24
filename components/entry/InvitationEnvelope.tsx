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
type EdgeKind = "outer" | "fold-a" | "fold-b";

/**
 * Full-viewport navy envelope with gold wax seal.
 * Vine embossing runs along each flap edge (outer + both folds).
 * On seal open, only the embossed relief illuminates gold.
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

      {/* Stack like a real envelope: bottom → sides → top */}
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
      // Fold lines run from outer corners to center → atan(H/W) from horizontal
      foldAngle: (Math.atan(height / width) * 180) / Math.PI,
      // Stop short of the wax seal at center
      foldLengthPx: 0.5 * Math.hypot(width, height) * 0.88,
    });
  }, [shell]);

  useEffect(() => {
    measure();
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
        <EdgeVine
          side={side}
          edge="outer"
          foldAngle={foldAngle}
          foldLengthPx={foldLengthPx}
        />
        <EdgeVine
          side={side}
          edge="fold-a"
          foldAngle={foldAngle}
          foldLengthPx={foldLengthPx}
        />
        <EdgeVine
          side={side}
          edge="fold-b"
          foldAngle={foldAngle}
          foldLengthPx={foldLengthPx}
        />
      </div>
    </div>
  );
}

function EdgeVine({
  side,
  edge,
  foldAngle,
  foldLengthPx,
}: {
  side: FlapSide;
  edge: EdgeKind;
  foldAngle: number;
  foldLengthPx: number;
}) {
  const style = edgeStyle(side, edge, foldAngle, foldLengthPx);
  const assetSide = edgeAssetSide(side, edge);

  return (
    <>
      <div
        className="envelope-design envelope-design-emboss"
        style={{
          ...style,
          backgroundImage: `url(/images/envelope-flap-${assetSide}.webp)`,
        }}
      />
      <div
        className="envelope-design envelope-design-glow"
        style={{
          ...style,
          backgroundImage: `url(/images/envelope-flap-${assetSide}-glow.webp)`,
        }}
      />
    </>
  );
}

/** Which strip orientation asset to use for this edge */
function edgeAssetSide(side: FlapSide, edge: EdgeKind): FlapSide {
  if (edge === "outer") return side;
  // Diagonal folds use the horizontal vine strip, rotated in CSS
  return "top";
}

function edgeStyle(
  side: FlapSide,
  edge: EdgeKind,
  foldAngle: number,
  foldLengthPx: number,
): CSSProperties {
  const band = "min(11vmax, 5.5rem)";
  const inset = "1.25%";
  // Keep diagonal vines slightly inside the flap so shared folds don’t double-stack
  const foldInset = "2%";

  if (edge === "outer") {
    switch (side) {
      case "top":
        return {
          left: "3%",
          right: "3%",
          top: inset,
          height: band,
        };
      case "bottom":
        return {
          left: "3%",
          right: "3%",
          bottom: inset,
          height: band,
        };
      case "left":
        return {
          top: "3%",
          bottom: "3%",
          left: inset,
          width: band,
        };
      case "right":
        return {
          top: "3%",
          bottom: "3%",
          right: inset,
          width: band,
        };
    }
  }

  const foldWidth = `${Math.round(foldLengthPx)}px`;

  if (side === "top" && edge === "fold-a") {
    return {
      left: foldInset,
      top: foldInset,
      width: foldWidth,
      height: band,
      transformOrigin: "left center",
      transform: `rotate(${foldAngle}deg)`,
    };
  }
  if (side === "top" && edge === "fold-b") {
    return {
      right: foldInset,
      top: foldInset,
      width: foldWidth,
      height: band,
      transformOrigin: "right center",
      transform: `rotate(${-foldAngle}deg)`,
    };
  }
  if (side === "bottom" && edge === "fold-a") {
    return {
      left: foldInset,
      bottom: foldInset,
      width: foldWidth,
      height: band,
      transformOrigin: "left center",
      transform: `rotate(${-foldAngle}deg)`,
    };
  }
  if (side === "bottom" && edge === "fold-b") {
    return {
      right: foldInset,
      bottom: foldInset,
      width: foldWidth,
      height: band,
      transformOrigin: "right center",
      transform: `rotate(${foldAngle}deg)`,
    };
  }
  if (side === "left" && edge === "fold-a") {
    return {
      left: foldInset,
      top: foldInset,
      width: foldWidth,
      height: band,
      transformOrigin: "left center",
      transform: `rotate(${foldAngle}deg)`,
    };
  }
  if (side === "left" && edge === "fold-b") {
    return {
      left: foldInset,
      bottom: foldInset,
      width: foldWidth,
      height: band,
      transformOrigin: "left center",
      transform: `rotate(${-foldAngle}deg)`,
    };
  }
  if (side === "right" && edge === "fold-a") {
    return {
      right: foldInset,
      top: foldInset,
      width: foldWidth,
      height: band,
      transformOrigin: "right center",
      transform: `rotate(${-foldAngle}deg)`,
    };
  }
  return {
    right: foldInset,
    bottom: foldInset,
    width: foldWidth,
    height: band,
    transformOrigin: "right center",
    transform: `rotate(${foldAngle}deg)`,
  };
}
