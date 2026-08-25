/** Centralized intro animation timings (ms) */
export const INTRO_TIMING = {
  activating: 220,
  /** Slow emboss + seal fill (mask wipe + opacity) */
  glow: 2800,
  /** Brief fade-out of the sealed envelope before homepage */
  open: 450,
  /** Overlay unmount — keep snappy so we land on home immediately */
  exit: 120,
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
