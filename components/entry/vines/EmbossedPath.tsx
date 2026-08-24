"use client";

import { cn } from "@/lib/cn";
import { VINE_COLORS } from "./colors";

export interface EmbossedPathProps {
  d: string;
  strokeWidth?: number;
  fill?: string;
  className?: string;
  goldAccent?: boolean;
}

/**
 * Layered SVG stroke: shadow → base → highlight (+ optional gold accent).
 * No filters — GPU-friendly transforms only.
 */
export function EmbossedPath({
  d,
  strokeWidth = 0.26,
  fill = "none",
  className,
  goldAccent = false,
}: EmbossedPathProps) {
  return (
    <g className={cn(className)}>
      <path
        d={d}
        fill={fill}
        stroke={VINE_COLORS.shadow}
        strokeWidth={strokeWidth + 0.1}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0.2 0.2)"
        opacity={0.8}
      />
      <path
        d={d}
        fill={fill}
        stroke={VINE_COLORS.base}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="envelope-vine-base"
      />
      <path
        d={d}
        fill={fill}
        stroke={VINE_COLORS.highlight}
        strokeWidth={strokeWidth * 0.55}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(-0.15 -0.15)"
        opacity={0.5}
        className="envelope-vine-highlight"
      />
      {goldAccent && (
        <path
          d={d}
          fill={fill}
          stroke={VINE_COLORS.gold}
          strokeWidth={strokeWidth * 0.45}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="envelope-vine-gold-accent"
        />
      )}
    </g>
  );
}

export function EmbossedLeaf({
  cx,
  cy,
  angle = 0,
  scale = 1,
}: {
  cx: number;
  cy: number;
  angle?: number;
  scale?: number;
}) {
  const d = `M 0 0 C ${0.8 * scale} ${-0.4 * scale} ${1.6 * scale} ${0.2 * scale} ${0.6 * scale} ${1.4 * scale} C ${0.1 * scale} ${0.9 * scale} ${-0.5 * scale} ${0.4 * scale} 0 0 Z`;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${angle})`}>
      <EmbossedPath d={d} strokeWidth={0.14} fill={VINE_COLORS.base} />
    </g>
  );
}

export function GoldBud({ cx, cy, r = 0.45 }: { cx: number; cy: number; r?: number }) {
  return (
    <>
      <circle
        cx={cx + 0.15}
        cy={cy + 0.15}
        r={r}
        fill={VINE_COLORS.shadow}
        opacity={0.5}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.85}
        fill={VINE_COLORS.base}
        className="envelope-vine-base"
      />
      <circle
        cx={cx - 0.1}
        cy={cy - 0.1}
        r={r * 0.5}
        fill={VINE_COLORS.highlight}
        opacity={0.45}
      />
      <circle
        cx={cx}
        cy={cy}
        r={r * 0.35}
        fill={VINE_COLORS.gold}
        className="envelope-vine-gold-accent"
      />
    </>
  );
}

/** Closed rosebud matching embossed filigree artwork. */
export function EmbossedRosebud({
  cx,
  cy,
  scale = 1,
  goldAccent = false,
}: {
  cx: number;
  cy: number;
  scale?: number;
  goldAccent?: boolean;
}) {
  const d = `M 0 0 C ${0.5 * scale} ${-0.9 * scale}, ${1.3 * scale} ${-0.6 * scale}, ${1.3 * scale} ${0.1 * scale} C ${1.3 * scale} ${0.75 * scale}, ${0.65 * scale} ${1.15 * scale}, 0 ${0.95 * scale} C ${-0.65 * scale} ${1.15 * scale}, ${-1.3 * scale} ${0.75 * scale}, ${-1.3 * scale} ${0.1 * scale} C ${-1.3 * scale} ${-0.6 * scale}, ${-0.5 * scale} ${-0.9 * scale}, 0 0 Z`;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <EmbossedPath
        d={d}
        strokeWidth={0.12}
        fill={VINE_COLORS.base}
        goldAccent={goldAccent}
      />
    </g>
  );
}

/** Tight curling tendril spiral. */
export function EmbossedSpiral({
  cx,
  cy,
  scale = 1,
  rotation = 0,
}: {
  cx: number;
  cy: number;
  scale?: number;
  rotation?: number;
}) {
  const d = `M 0 0 C ${0.8 * scale} ${-0.2 * scale}, ${1.1 * scale} ${0.4 * scale}, ${0.6 * scale} ${0.9 * scale} C ${0.1 * scale} ${1.3 * scale}, ${-0.7 * scale} ${0.9 * scale}, ${-0.6 * scale} ${0.2 * scale}`;
  return (
    <g transform={`translate(${cx} ${cy}) rotate(${rotation})`}>
      <EmbossedPath d={d} strokeWidth={0.14} />
    </g>
  );
}
