"use client";

import { cn } from "@/lib/cn";
import { useReducedMotion } from "motion/react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export type ThreadChapter =
  | "entry"
  | "hero"
  | "story"
  | "gallery"
  | "proposal"
  | "wedding"
  | "closing";

interface GoldenThreadProps {
  chapter?: ThreadChapter;
  className?: string;
  /** 0–1 progress for draw animation; ignored under reduced motion */
  progress?: number;
  split?: boolean;
  decorative?: boolean;
}

/**
 * Hairline filament paths — editorial ink/embroidery, not extruded metal.
 * Keep strokes thin; avoid thick “pipe” curves.
 */
const PATHS: Record<
  ThreadChapter,
  { single: string; bright?: string; lexi?: string }
> = {
  entry: {
    single: "M40 88 C140 48, 220 118, 320 78 S480 42, 560 82",
  },
  hero: {
    single: "M0 88 C110 52, 200 118, 310 78 S470 42, 600 90 S700 108, 760 86",
  },
  story: {
    single:
      "M40 16 C54 110, 28 210, 44 310 S28 470, 46 590 S30 750, 42 890 S34 1030, 40 1160",
    bright:
      "M30 16 C22 130, 16 250, 28 380 S18 560, 30 720 S20 920, 28 1100",
    lexi:
      "M50 16 C64 130, 74 250, 60 380 S74 560, 58 720 S72 920, 54 1100",
  },
  gallery: {
    single: "M40 36 C120 72, 80 150, 160 190 S100 300, 200 360",
  },
  proposal: {
    single: "M48 100 C180 56, 280 140, 400 100 S540 56, 680 104",
    bright: "M48 52 C170 64, 260 44, 360 92 C430 124, 520 110, 680 104",
    lexi: "M48 148 C170 136, 260 158, 360 108 C430 76, 540 96, 680 104",
  },
  wedding: {
    single: "M24 82 C130 48, 210 112, 320 72 S470 36, 600 88 S700 122, 760 96",
  },
  closing: {
    single:
      "M48 96 C150 52, 250 128, 360 84 S490 40, 560 72 C600 92, 628 112, 652 122",
  },
};

const STROKE: Record<ThreadChapter, { single: number; split: number }> = {
  entry: { single: 1.15, split: 1 },
  hero: { single: 1.1, split: 1 },
  story: { single: 1.25, split: 1.05 },
  gallery: { single: 1.1, split: 1 },
  proposal: { single: 1.2, split: 1.05 },
  wedding: { single: 1.1, split: 1 },
  closing: { single: 1.15, split: 1 },
};

/**
 * Editorial antique-gold filament.
 * SVG hairline — refined curves, not a progress bar or metallic tube.
 */
export function GoldenThread({
  chapter = "story",
  className,
  progress,
  split = false,
  decorative = true,
}: GoldenThreadProps) {
  const reduceMotion = useReducedMotion();
  const gradientId = useId().replace(/:/g, "");
  const paths = PATHS[chapter];
  const stroke = STROKE[chapter];
  const drawProgress =
    reduceMotion || progress === undefined
      ? 1
      : Math.min(1, Math.max(0, progress));

  const strokeStyle = {
    strokeDasharray: 1,
    strokeDashoffset: 1 - drawProgress,
  } satisfies CSSProperties;

  return (
    <svg
      viewBox={chapter === "story" ? "0 0 80 1200" : "0 0 800 200"}
      preserveAspectRatio={
        chapter === "story" ? "xMidYMin meet" : "xMidYMid meet"
      }
      className={cn("pointer-events-none text-gold", className)}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? "presentation" : "img"}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1={chapter === "story" ? "0%" : "0%"}
          x2={chapter === "story" ? "0%" : "100%"}
          y2={chapter === "story" ? "100%" : "0%"}
        >
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="40%" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      {split && paths.bright && paths.lexi ? (
        <>
          <path
            d={paths.bright}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke.split}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="nonScalingStroke"
            pathLength={1}
            style={strokeStyle}
            opacity={0.8}
          />
          <path
            d={paths.lexi}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke.split}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="nonScalingStroke"
            pathLength={1}
            style={strokeStyle}
            opacity={0.8}
          />
        </>
      ) : (
        <path
          d={paths.single}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke.single}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="nonScalingStroke"
          pathLength={1}
          style={strokeStyle}
        />
      )}
    </svg>
  );
}

/** Scroll-scrubbed thread for tall story columns. */
export function ScrollScrubbedThread({
  className,
  split = false,
}: {
  className?: string;
  split?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0.08);

  useEffect(() => {
    if (reduceMotion) return;

    const element = ref.current;
    if (!element) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const total = rect.height + view;
      const traveled = view - rect.top;
      const next = Math.min(1, Math.max(0.05, traveled / total));
      setProgress(next);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reduceMotion]);

  return (
    <div ref={ref} className={cn("absolute inset-y-0", className)}>
      <GoldenThread
        chapter="story"
        split={split}
        progress={reduceMotion ? 1 : progress}
        className="h-full w-full"
      />
    </div>
  );
}
