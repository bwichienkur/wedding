"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type VineFlapSide = "top" | "bottom" | "left" | "right";

const CLIP_POINTS: Record<VineFlapSide, string> = {
  top: "0,0 100,0 50,50",
  bottom: "50,50 100,100 0,100",
  left: "0,0 50,50 0,100",
  right: "100,0 100,100 50,50",
};

export interface FlapVineCanvasProps {
  side: VineFlapSide;
  glowing?: boolean;
  children: ReactNode;
  className?: string;
}

/** SVG root clipped to the exact flap triangle — scales via viewBox. */
export function FlapVineCanvas({
  side,
  glowing,
  children,
  className,
}: FlapVineCanvasProps) {
  const clipId = `envelope-vine-clip-${side}`;

  return (
    <svg
      className={cn(
        "envelope-vines-svg pointer-events-none absolute inset-0 h-full w-full",
        glowing && "envelope-vines--illuminated",
        className,
      )}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <polygon points={CLIP_POINTS[side]} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>{children}</g>
    </svg>
  );
}
