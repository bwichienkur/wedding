/** Centralized intro animation timings (ms) — total open ~3.2s */
export const INTRO_TIMING = {
  activating: 220,
  glow: 1400,
  open: 2800,
  exit: 900,
} as const;

export const INTRO_CSS_VARS = {
  activating: `${INTRO_TIMING.activating}ms`,
  glow: `${INTRO_TIMING.glow}ms`,
  open: `${INTRO_TIMING.open}ms`,
  exit: `${INTRO_TIMING.exit}ms`,
} as const;
