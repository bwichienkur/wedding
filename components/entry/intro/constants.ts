/** Centralized intro animation timings (ms) */
export const INTRO_TIMING = {
  activating: 220,
  /** Slow emboss + seam illumination (mask wipe + opacity) */
  glow: 4500,
  /** Flap peel + seal lift before homepage takes over */
  open: 1600,
  /** Overlay unmount after peel settles */
  exit: 280,
  /** Monogram starts after florals begin filling */
  monogramDelay: 900,
} as const;

export const INTRO_CSS_VARS = {
  activating: `${INTRO_TIMING.activating}ms`,
  glow: `${INTRO_TIMING.glow}ms`,
  open: `${INTRO_TIMING.open}ms`,
  exit: `${INTRO_TIMING.exit}ms`,
  monogramDelay: `${INTRO_TIMING.monogramDelay}ms`,
} as const;
