import { getCountdownParts } from "@/lib/dates";
import { describe, expect, it } from "vitest";

describe("getCountdownParts", () => {
  it("never returns negative values after the wedding", () => {
    const parts = getCountdownParts(new Date("2030-01-01T12:00:00"));
    expect(parts.isPast).toBe(true);
    expect(parts.days).toBe(0);
    expect(parts.hours).toBe(0);
    expect(parts.minutes).toBe(0);
  });

  it("returns remaining time before the wedding", () => {
    const parts = getCountdownParts(new Date("2027-05-14T12:00:00"));
    expect(parts.isPast).toBe(false);
    expect(parts.days).toBeGreaterThanOrEqual(0);
  });
});
