"use client";

import { cn } from "@/lib/cn";
import type { VineFlapSide } from "./FlapVineCanvas";

export interface FlapEmbossedArtProps {
  side: VineFlapSide;
  glowing?: boolean;
}

/**
 * Illustrated embossed artwork per flap — webp filigree clipped by parent flap.
 * Top/bottom use restored botanical illustrations; sides use SVG (SideFlapVines).
 */
export function FlapEmbossedArt({ side, glowing }: FlapEmbossedArtProps) {
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
          glowing={glowing}
        />
        <GlowLayer
          className="envelope-flap-art-top-right"
          src="/images/envelope-flap-top-glow.webp"
          glowing={glowing}
          mirrored
        />
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
          glowing={glowing}
        />
      </>
    );
  }

  if (side === "left") {
    return (
      <>
        <EmbossLayer
          className="envelope-flap-art-side-left"
          src="/images/envelope-flap-top.webp"
        />
        <GlowLayer
          className="envelope-flap-art-side-left"
          src="/images/envelope-flap-top-glow.webp"
          glowing={glowing}
        />
      </>
    );
  }

  if (side === "right") {
    return (
      <>
        <EmbossLayer
          className="envelope-flap-art-side-right"
          src="/images/envelope-flap-top.webp"
        />
        <GlowLayer
          className="envelope-flap-art-side-right"
          src="/images/envelope-flap-top-glow.webp"
          glowing={glowing}
        />
      </>
    );
  }

  return null;
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
  glowing,
  mirrored,
}: {
  className: string;
  src: string;
  glowing?: boolean;
  mirrored?: boolean;
}) {
  return (
    <div
      className={cn(
        "envelope-flap-art envelope-flap-art-glow",
        className,
        mirrored && "envelope-flap-art--mirrored",
        glowing && "is-lit",
      )}
      style={{ backgroundImage: `url(${src})` }}
      aria-hidden="true"
    />
  );
}
