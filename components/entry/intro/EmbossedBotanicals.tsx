"use client";

import { cn } from "@/lib/cn";
import type { FlapSide } from "./types";

interface EmbossedBotanicalsProps {
  side: FlapSide;
  illuminated: boolean;
}

/**
 * Per-flap illustrated emboss + glow layers, clipped by parent flap geometry.
 * Uses dedicated webp filigree per flap; seal-area SVG accents on top/bottom.
 */
export function EmbossedBotanicals({ side, illuminated }: EmbossedBotanicalsProps) {
  if (side === "top") {
    return (
      <>
        <EmbossLayer
          className="envelope-flap-art-top-left"
          src="/images/envelope-flap-top.webp"
        />
        <EmbossLayer
          className="envelope-flap-art-top-right"
          src="/images/envelope-flap-top.webp"
          mirrored
        />
        <GlowLayer
          className="envelope-flap-art-top-left"
          src="/images/envelope-flap-top-glow.webp"
          illuminated={illuminated}
        />
        <GlowLayer
          className="envelope-flap-art-top-right"
          src="/images/envelope-flap-top-glow.webp"
          illuminated={illuminated}
          mirrored
        />
        <SealAreaFlorals side="top" illuminated={illuminated} />
      </>
    );
  }

  if (side === "bottom") {
    return (
      <>
        <EmbossLayer
          className="envelope-flap-art-bottom"
          src="/images/envelope-flap-bottom.webp"
        />
        <GlowLayer
          className="envelope-flap-art-bottom"
          src="/images/envelope-flap-bottom-glow.webp"
          illuminated={illuminated}
        />
        <SealAreaFlorals side="bottom" illuminated={illuminated} />
      </>
    );
  }

  if (side === "left") {
    return (
      <>
        <EmbossLayer
          className="envelope-flap-art-side-left"
          src="/images/envelope-flap-left.webp"
        />
        <GlowLayer
          className="envelope-flap-art-side-left"
          src="/images/envelope-flap-left-glow.webp"
          illuminated={illuminated}
        />
      </>
    );
  }

  return (
    <>
      <EmbossLayer
        className="envelope-flap-art-side-right"
        src="/images/envelope-flap-right.webp"
      />
      <GlowLayer
        className="envelope-flap-art-side-right"
        src="/images/envelope-flap-right-glow.webp"
        illuminated={illuminated}
      />
    </>
  );
}

function EmbossLayer({
  className,
  src,
  mirrored,
}: {
  className: string;
  src: string;
  mirrored?: boolean;
}) {
  return (
    <div
      className={cn(
        "envelope-flap-art envelope-flap-art-emboss",
        className,
        mirrored && "envelope-flap-art--mirrored",
      )}
      style={{ backgroundImage: `url(${src})` }}
      aria-hidden="true"
    />
  );
}

function GlowLayer({
  className,
  src,
  illuminated,
  mirrored,
}: {
  className: string;
  src: string;
  illuminated: boolean;
  mirrored?: boolean;
}) {
  return (
    <div
      className={cn(
        "envelope-flap-art envelope-flap-art-glow",
        className,
        mirrored && "envelope-flap-art--mirrored",
        illuminated && "is-lit",
      )}
      style={{ backgroundImage: `url(${src})` }}
      aria-hidden="true"
    />
  );
}

/** Small SVG stems framing the wax seal — tone-on-tone emboss with gold rim on glow */
function SealAreaFlorals({
  side,
  illuminated,
}: {
  side: "top" | "bottom";
  illuminated: boolean;
}) {
  const className = cn(
    "intro-seal-florals pointer-events-none absolute z-[2]",
    side === "top" ? "intro-seal-florals-top" : "intro-seal-florals-bottom",
    illuminated && "is-illuminated",
  );

  return (
    <svg
      className={className}
      viewBox="0 0 200 80"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <filter id="emboss-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0.4" dy="0.6" stdDeviation="0.3" floodColor="#07152A" floodOpacity="0.55" />
          <feDropShadow dx="-0.3" dy="-0.4" stdDeviation="0.2" floodColor="#91A8B5" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#emboss-soft)" className="intro-seal-floral-stems">
        {side === "top" ? (
          <>
            <path
              d="M 30 72 C 48 58, 62 42, 78 28 C 86 20, 92 14, 98 8"
              fill="none"
              stroke="#4a6580"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M 170 72 C 152 58, 138 42, 122 28 C 114 20, 108 14, 102 8"
              fill="none"
              stroke="#4a6580"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <ellipse cx="78" cy="24" rx="5" ry="8" fill="#3d5670" transform="rotate(-25 78 24)" />
            <ellipse cx="122" cy="24" rx="5" ry="8" fill="#3d5670" transform="rotate(25 122 24)" />
            <circle cx="98" cy="10" r="3.5" fill="#526a82" />
            <circle cx="92" cy="16" r="2.2" fill="#526a82" />
            <circle cx="104" cy="16" r="2.2" fill="#526a82" />
          </>
        ) : (
          <>
            <path
              d="M 20 8 C 40 22, 55 38, 72 52 C 82 60, 90 66, 98 72"
              fill="none"
              stroke="#4a6580"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M 180 8 C 160 22, 145 38, 128 52 C 118 60, 110 66, 102 72"
              fill="none"
              stroke="#4a6580"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M 98 72 C 98 58, 98 44, 98 28"
              fill="none"
              stroke="#4a6580"
              strokeWidth="1"
              strokeLinecap="round"
            />
            <ellipse cx="72" cy="48" rx="6" ry="10" fill="#3d5670" transform="rotate(-35 72 48)" />
            <ellipse cx="128" cy="48" rx="6" ry="10" fill="#3d5670" transform="rotate(35 128 48)" />
            <ellipse cx="98" cy="32" rx="7" ry="11" fill="#3d5670" />
            <circle cx="88" cy="38" r="2.5" fill="#526a82" />
            <circle cx="108" cy="38" r="2.5" fill="#526a82" />
          </>
        )}
      </g>
    </svg>
  );
}
