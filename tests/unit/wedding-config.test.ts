import { wedding, weddingLocationLine } from "@/data/wedding";
import { storyMilestones } from "@/data/story";
import { describe, expect, it } from "vitest";

describe("wedding config", () => {
  it("includes confirmed couple and ceremony facts only", () => {
    expect(wedding.couple.displayName).toBe("Lexi & Bright");
    expect(wedding.wedding.dateISO).toBe("2027-05-15");
    expect(wedding.wedding.venueName).toBe("Bella Cosa");
    expect(wedding.anniversary.dating.dateISO).toBe("2025-03-20");
    expect(wedding.wedding.ceremonyBegins).toBe("4:00 PM");
    expect(wedding.rsvp.deadlineIsPlaceholder).toBe(false);
    expect(wedding.rsvp.deadlineISO).toBe("2027-04-10T23:59:59-04:00");
    expect(wedding.rsvp.deadlineLabel).toContain("April 10, 2027");
  });

  it("marks remaining unknown content as placeholders", () => {
    expect(wedding.hero.statementIsPlaceholder).toBe(false);
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
  it("includes how we met, the proposal, and wedding", () => {
    expect(storyMilestones.map((m) => m.id)).toEqual([
      "how-we-met",
      "proposal",
      "wedding",
    ]);
  });

  it("keeps placeholder copy clearly marked", () => {
    const open = storyMilestones.filter((m) =>
      m.passages.some((p) => p.isPlaceholder),
    );
    expect(open.length).toBe(0);
  });
});
