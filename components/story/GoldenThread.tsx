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

const PATHS: Record<
  ThreadChapter,
  { single: string; bright?: string; lexi?: string }
> = {
  entry: {
    single: "M20 70 C90 20, 170 120, 250 70 S410 20, 480 70",
  },
  hero: {
    single: "M0 90 C120 40, 220 130, 340 80 S520 30, 640 95",
  },
  story: {
    single:
      "M40 20 C60 120, 20 220, 48 320 S20 480, 52 600 S24 760, 48 900 S30 1040, 40 1180",
    bright:
      "M28 20 C18 140, 8 260, 22 380 S10 560, 26 720 S12 920, 24 1100",
    lexi:
      "M52 20 C72 140, 88 260, 74 380 S90 560, 70 720 S92 920, 60 1100",
  },
  gallery: {
    single: "M30 40 C120 80, 60 160, 150 210 S80 320, 180 380",
  },
  proposal: {
    single: "M40 100 C160 40, 280 160, 400 100 S560 40, 680 110",
    bright: "M40 40 C180 60, 260 20, 360 90 C460 160, 520 120, 680 110",
    lexi: "M40 160 C180 140, 260 190, 360 110 C460 40, 540 90, 680 110",
  },
  wedding: {
    single: "M20 80 C140 40, 200 120, 320 70 S480 20, 620 90 S740 140, 780 100",
  },
  closing: {
    single:
      "M40 100 C160 40, 260 140, 360 80 S500 20, 560 70 C600 95, 620 110, 640 120",
  },
};

/**
 * Editorial antique-gold filament.
 * SVG-first — refined curves, not a progress bar or decorative squiggle.
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
  const drawProgress =
    reduceMotion || progress === undefined ? 1 : Math.min(1, Math.max(0, progress));

  const strokeStyle = {
    strokeDasharray: 1,
    strokeDashoffset: 1 - drawProgress,
  } satisfies CSSProperties;

  return (
    <svg
      viewBox={chapter === "story" ? "0 0 80 1200" : "0 0 800 200"}
      preserveAspectRatio={chapter === "story" ? "none" : "xMidYMid meet"}
      className={cn("pointer-events-none text-gold", className)}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? "presentation" : "img"}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="45%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {split && paths.bright && paths.lexi ? (
        <>
          <path
            d={paths.bright}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="1.35"
            strokeLinecap="round"
            pathLength={1}
            style={strokeStyle}
            opacity={0.75}
          />
          <path
            d={paths.lexi}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="1.35"
            strokeLinecap="round"
            pathLength={1}
            style={strokeStyle}
            opacity={0.75}
          />
        </>
      ) : (
        <path
          d={paths.single}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
          strokeLinecap="round"
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
