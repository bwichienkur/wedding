import {
  hasSeenIntro,
  INTRO_FORCE_SKIP_KEY,
  INTRO_SEEN_KEY,
  isIntroForceSkipped,
  markIntroSeen,
} from "@/lib/intro-storage";
import { beforeEach, describe, expect, it } from "vitest";

describe("intro storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts unseen", () => {
    expect(hasSeenIntro()).toBe(false);
    expect(isIntroForceSkipped()).toBe(false);
  });

  it("remembers when the intro has been seen", () => {
    markIntroSeen();
    expect(window.localStorage.getItem(INTRO_SEEN_KEY)).toBe("1");
    expect(hasSeenIntro()).toBe(true);
  });

  it("supports a test-only force skip without treating it as seen", () => {
    window.localStorage.setItem(INTRO_FORCE_SKIP_KEY, "1");
    expect(isIntroForceSkipped()).toBe(true);
    expect(hasSeenIntro()).toBe(false);
  });
});
