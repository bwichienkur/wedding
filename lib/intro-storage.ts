export const INTRO_SEEN_KEY = "bl-wedding-intro-seen";

/** Test-only bypass — never set this in product UI. */
export const INTRO_FORCE_SKIP_KEY = "bl-wedding-intro-force-skip";

export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // Private mode / blocked storage — treat as one-time only.
  }
}

/** Used by Playwright helpers so content tests can reach the page. */
export function isIntroForceSkipped(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(INTRO_FORCE_SKIP_KEY) === "1";
  } catch {
    return false;
  }
}
