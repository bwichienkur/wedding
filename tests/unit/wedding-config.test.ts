import { wedding, weddingLocationLine } from "@/data/wedding";
import { storyMilestones } from "@/data/story";
import { describe, expect, it } from "vitest";

describe("wedding config", () => {
  it("includes confirmed couple and ceremony facts only", () => {
    expect(wedding.couple.displayName).toBe("Bright & Lexi");
    expect(wedding.wedding.dateISO).toBe("2027-05-15");
    expect(wedding.wedding.venueName).toBe("Bella Cosa");
    expect(wedding.anniversary.dating.dateISO).toBe("2025-03-20");
    expect(wedding.wedding.ceremonyBegins).toBe("4:00 PM");
  });

  it("marks remaining unknown content as placeholders", () => {
    expect(wedding.hero.statementIsPlaceholder).toBe(true);
    expect(wedding.proposal.dateIsPlaceholder).toBe(false);
    expect(wedding.proposal.locationIsPlaceholder).toBe(false);
    expect(wedding.proposal.dateLabel).toContain("December 13");
    expect(weddingLocationLine()).toContain("Lake Wales");
  });

  it("defaults to flat SVG thread language (no metallic 3D)", () => {
    expect(wedding.featureFlags.threeMonogram).toBe(false);
    expect(wedding.featureFlags.floatingGallery).toBe(false);
  });
});

describe("story milestones", () => {
  it("includes only how we met and the proposal", () => {
    expect(storyMilestones.map((m) => m.id)).toEqual([
      "how-we-met",
      "proposal",
    ]);
  });

  it("keeps placeholder copy clearly marked", () => {
    const open = storyMilestones.filter((m) =>
      m.passages.some((p) => p.isPlaceholder),
    );
    expect(open.length).toBeGreaterThan(0);
  });
});
