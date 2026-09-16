import { describe, expect, it } from "vitest";
import { scoreGuestNameMatch } from "@/lib/rsvp/matching";
import { normalizeGuestName } from "@/lib/rsvp/normalize";

describe("flexible RSVP name lookup", () => {
  it("matches first or last name alone", () => {
    const candidate = normalizeGuestName("Pungnga Wichienkur");
    expect(scoreGuestNameMatch("Pungnga", candidate)).toBeGreaterThan(0);
    expect(scoreGuestNameMatch("Wichienkur", candidate)).toBeGreaterThan(0);
    expect(scoreGuestNameMatch("Lexi", normalizeGuestName("Lexi Wichienkur"))).toBeGreaterThan(
      0,
    );
  });

  it("matches titles stripped from stored names", () => {
    const candidate = normalizeGuestName("Dr. Lisa Fultz");
    expect(scoreGuestNameMatch("Lisa Fultz", candidate)).toBeGreaterThan(0);
    expect(scoreGuestNameMatch("Lisa", candidate)).toBeGreaterThan(0);
  });
});
