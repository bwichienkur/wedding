import { hasSeenIntro, INTRO_SEEN_KEY, markIntroSeen } from "@/lib/intro-storage";
import { beforeEach, describe, expect, it } from "vitest";

describe("intro storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("starts unseen", () => {
    expect(hasSeenIntro()).toBe(false);
  });

  it("remembers when the intro has been seen", () => {
    markIntroSeen();
    expect(window.localStorage.getItem(INTRO_SEEN_KEY)).toBe("1");
    expect(hasSeenIntro()).toBe(true);
  });
});
