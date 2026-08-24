import { cn } from "@/lib/cn";
import { wedding } from "@/data/wedding";

export interface MonogramSvgProps {
  className?: string;
  title?: string;
  decorative?: boolean;
}

/**
 * Static monogram — interlaced hairline strokes with B & L.
 * Prefer this over metallic TubeGeometry; reads as print/embroidery, not CGI.
 */
export function MonogramSvg({
  className,
  title = `${wedding.couple.displayName} monogram`,
  decorative = false,
}: MonogramSvgProps) {
  const [b, l] = wedding.couple.monogramLetters;

  return (
    <svg
      viewBox="0 0 120 120"
      role={decorative ? "presentation" : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : title}
      className={cn("text-gold", className)}
    >
      {!decorative ? <title>{title}</title> : null}
      <circle
        cx="60"
        cy="60"
        r="54"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.65"
        opacity="0.45"
        vectorEffect="nonScalingStroke"
      />
      {/* Outer filament — soft loop */}
      <path
        d="M36 76 C36 44, 50 30, 60 30 C72 30, 82 40, 82 54 C82 70, 70 78, 60 78 C50 78, 44 70, 44 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="nonScalingStroke"
      />
      {/* Crossing filament */}
      <path
        d="M44 36 C58 34, 84 48, 84 72 C84 90, 72 98, 60 98 C48 98, 38 90, 38 78"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.05"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
        vectorEffect="nonScalingStroke"
      />
      <text
        x="60"
        y="64"
        textAnchor="middle"
        className="fill-forest font-display"
        style={{ fontSize: "17px", letterSpacing: "0.14em" }}
      >
        {b}
        <tspan dx="3">{l}</tspan>
      </text>
    </svg>
  );
}
