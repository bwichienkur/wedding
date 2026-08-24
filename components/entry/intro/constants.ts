/** Centralized intro animation timings (ms) */
export const INTRO_TIMING = {
  activating: 220,
  glow: 1200,
  /** Brief fade-out of the sealed envelope before homepage */
  open: 450,
  /** Overlay unmount — keep snappy so we land on home immediately */
  exit: 120,
} as const;

export const INTRO_CSS_VARS = {
  activating: `${INTRO_TIMING.activating}ms`,
  glow: `${INTRO_TIMING.glow}ms`,
  open: `${INTRO_TIMING.open}ms`,
  exit: `${INTRO_TIMING.exit}ms`,
} as const;
