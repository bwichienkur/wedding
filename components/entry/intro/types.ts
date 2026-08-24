/** Intro overlay lifecycle — single source of truth for animation phases */
export type IntroPhase =
  | "closed"
  | "activating"
  | "glowing"
  | "opening"
  | "opened"
  | "skipped";

export type FlapSide = "top" | "bottom" | "left" | "right";

export function isInteractivePhase(phase: IntroPhase): boolean {
  return phase === "closed";
}

export function isSealVisiblePhase(phase: IntroPhase): boolean {
  return phase === "closed" || phase === "activating" || phase === "glowing";
}

export function isOpeningPhase(phase: IntroPhase): boolean {
  return phase === "opening" || phase === "opened";
}

export function isIlluminatedPhase(phase: IntroPhase): boolean {
  return (
    phase === "activating" ||
    phase === "glowing" ||
    phase === "opening" ||
    phase === "opened"
  );
}
