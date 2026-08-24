"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

const PARTICLES = [
  { x: -18, y: -12, delay: 0, size: 3 },
  { x: 22, y: -8, delay: 0.08, size: 2.5 },
  { x: -8, y: 18, delay: 0.12, size: 2 },
  { x: 14, y: 14, delay: 0.05, size: 2.8 },
  { x: -24, y: 6, delay: 0.15, size: 2.2 },
  { x: 6, y: -20, delay: 0.1, size: 2.4 },
  { x: 28, y: 4, delay: 0.18, size: 1.8 },
  { x: -12, y: -22, delay: 0.06, size: 2.6 },
] as const;

interface GoldParticlesProps {
  active: boolean;
  reduceMotion?: boolean;
}

/** Restrained gold dust burst when the seal illuminates */
export function GoldParticles({ active, reduceMotion }: GoldParticlesProps) {
  if (reduceMotion || !active) return null;

  return (
    <div className="intro-seal-particles pointer-events-none absolute inset-0" aria-hidden>
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={cn("intro-seal-particle", active && "is-active")}
          style={
            {
              "--px": `${p.x}px`,
              "--py": `${p.y}px`,
              "--ps": `${p.size}px`,
              "--pd": `${p.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
