import { siteSectionDefinitions } from "@/data/sections";
import { filterNavGroups, filterNavItems, primaryNav, mobileNavGroups } from "@/data/navigation";
import { resolveSiteSections } from "@/lib/content/resolve";
import type { SiteSectionsDocument } from "@/lib/content/types";
import { describe, expect, it } from "vitest";

describe("site section registry", () => {
  it("includes guest logistics sections and marks RSVP required", () => {
    const ids = siteSectionDefinitions.map((s) => s.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "story",
        "gallery",
        "proposal",
        "wedding-day",
        "venue",
        "travel",
        "party",
        "rsvp",
        "faq",
        "registry",
      ]),
    );
    expect(siteSectionDefinitions.find((s) => s.id === "rsvp")?.required).toBe(
      true,
    );
  });
});

describe("resolveSiteSections", () => {
  it("applies visibility and description overrides", () => {
    const doc: SiteSectionsDocument = {
      version: 1,
      updatedAt: new Date().toISOString(),
      sections: {
        party: { visible: false },
        story: {
          description: "Our story, in a few quiet chapters.",
          title: "Bright & Lexi",
        },
        rsvp: { visible: false },
      },
    };

    const resolved = resolveSiteSections(doc);
    expect(resolved.party.visible).toBe(false);
    expect(resolved.story.description).toBe(
      "Our story, in a few quiet chapters.",
    );
    expect(resolved.story.title).toBe("Bright & Lexi");
    // Required sections stay visible even if override says otherwise
    expect(resolved.rsvp.visible).toBe(true);
  });
});

describe("navigation filters", () => {
  it("drops hidden sections from nav lists", () => {
    const visible = new Set(["story", "venue", "rsvp"]);
    expect(filterNavItems(primaryNav, visible).map((i) => i.id)).toEqual([
      "story",
      "venue",
    ]);
    const groups = filterNavGroups(mobileNavGroups, visible);
    expect(groups.every((g) => g.items.length > 0)).toBe(true);
    expect(groups.flatMap((g) => g.items.map((i) => i.id)).sort()).toEqual([
      "rsvp",
      "story",
      "venue",
    ]);
  });
});
