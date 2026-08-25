import { heroSlides } from "@/data/hero-slides";
import { mobileNavGroups, mobileQuickNav, primaryNav } from "@/data/navigation";
import { describe, expect, it } from "vitest";

describe("hero slides", () => {
  it("provides multiple homepage photos for the carousel", () => {
    expect(heroSlides.length).toBeGreaterThanOrEqual(3);
    for (const slide of heroSlides) {
      expect(slide.image.src).toMatch(/^\/images\//);
      expect(slide.image.alt.length).toBeGreaterThan(0);
    }
  });
});

describe("navigation", () => {
  it("keeps compact desktop primary destinations for guests", () => {
    expect(primaryNav.map((item) => item.id)).toEqual([
      "story",
      "wedding-day",
      "venue",
      "travel",
      "party",
      "gallery",
      "faq",
      "registry",
    ]);
    expect(primaryNav.every((item) => item.label.length <= 10)).toBe(true);
  });

  it("groups mobile drawer destinations for clear section finding", () => {
    expect(mobileNavGroups.map((group) => group.id)).toEqual([
      "story-group",
      "wedding-group",
      "guests-group",
    ]);
    expect(mobileQuickNav.map((item) => item.id)).toEqual(
      primaryNav.map((item) => item.id),
    );
  });
});
