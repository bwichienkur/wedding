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
  it("keeps desktop primary destinations for guests", () => {
    expect(primaryNav.map((item) => item.id)).toEqual([
      "story",
      "wedding-day",
      "venue",
      "travel",
      "faq",
      "registry",
    ]);
  });

  it("groups mobile drawer destinations for clear section finding", () => {
    expect(mobileNavGroups.map((group) => group.id)).toEqual([
      "story-group",
      "wedding-group",
      "guests-group",
    ]);
    expect(mobileQuickNav.length).toBeGreaterThanOrEqual(5);
  });
});
