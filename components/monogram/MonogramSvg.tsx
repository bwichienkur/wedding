import { cn } from "@/lib/cn";
import { wedding } from "@/data/wedding";

export interface MonogramSvgProps {
  className?: string;
  title?: string;
  decorative?: boolean;
}

/**
 * Static monogram fallback — abstract interlaced B & L formed as a golden knot.
 * Used when WebGL is unavailable or reduced-motion is preferred.
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
        strokeWidth="0.75"
        opacity="0.55"
      />
      <path
        d="M34 78 C34 42, 52 28, 60 28 C68 28, 78 36, 78 52 C78 68, 68 76, 60 76 C52 76, 46 70, 46 60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M42 34 C58 34, 86 46, 86 72 C86 90, 74 98, 60 98 C46 98, 36 90, 36 78"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        opacity="0.85"
      />
      <text
        x="60"
        y="64"
        textAnchor="middle"
        className="fill-forest font-display"
        style={{ fontSize: "18px", letterSpacing: "0.12em" }}
      >
        {b}
        <tspan dx="2">{l}</tspan>
      </text>
    </svg>
  );
}
