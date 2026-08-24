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

  it("marks unknown content as placeholders", () => {
    expect(wedding.hero.statementIsPlaceholder).toBe(true);
    expect(wedding.proposal.dateIsPlaceholder).toBe(true);
    expect(weddingLocationLine()).toContain("Lake Wales");
  });
});

describe("story milestones", () => {
  it("includes the dating anniversary as a confirmed milestone", () => {
    const anniversary = storyMilestones.find(
      (m) => m.id === "dating-anniversary",
    );
    expect(anniversary?.dateISO).toBe("2025-03-20");
    expect(anniversary?.perspectivesEnabled).toBe(true);
  });

  it("keeps open chapters clearly incomplete", () => {
    const open = storyMilestones.filter((m) =>
      m.passages.some((p) => p.isPlaceholder),
    );
    expect(open.length).toBeGreaterThan(0);
  });
});
