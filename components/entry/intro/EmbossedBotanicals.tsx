"use client";

import { cn } from "@/lib/cn";
import type { FlapSide } from "./types";

interface EmbossedBotanicalsProps {
  side: FlapSide;
  illuminated: boolean;
}

/**
 * Per-flap embossed botanical artwork — transparent navy filigree clipped by flap.
 * Glow layers add restrained antique-gold rim light on seal activation.
 */
export function EmbossedBotanicals({ side, illuminated }: EmbossedBotanicalsProps) {
  if (side === "top") {
    return (
      <>
        <EmbossLayer
          className="envelope-flap-art-top"
          src="/images/envelope-flap-top.webp"
        />
        <GlowLayer
          className="envelope-flap-art-top"
          src="/images/envelope-flap-top-glow.webp"
          illuminated={illuminated}
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
          illuminated={illuminated}
        />
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
}: {
  className: string;
  src: string;
}) {
  return (
    <div
      className={cn("envelope-flap-art envelope-flap-art-emboss", className)}
      style={{ backgroundImage: `url(${src})` }}
      aria-hidden="true"
    />
  );
}

function GlowLayer({
  className,
  src,
  illuminated,
}: {
  className: string;
  src: string;
  illuminated: boolean;
}) {
  return (
    <div
      className={cn(
        "envelope-flap-art envelope-flap-art-glow",
        className,
        illuminated && "is-lit",
      )}
      style={{ backgroundImage: `url(${src})` }}
      aria-hidden="true"
    />
  );
}
