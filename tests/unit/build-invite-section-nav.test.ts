import { buildInviteSectionNavItems } from "@/components/invite/build-invite-section-nav";
import type { ResolvedSiteSections } from "@/lib/content/types";
import { describe, expect, it } from "vitest";

describe("buildInviteSectionNavItems", () => {
  it("includes home, countdown, and visible sections in page order", () => {
    const sections = {
      venue: { visible: true, title: "Venue title" },
      "wedding-day": { visible: true, title: "Schedule" },
      travel: { visible: false, title: "Travel" },
      story: { visible: true, title: "Story" },
      gallery: { visible: true, title: "Gallery" },
      party: { visible: true, title: "Party" },
      rsvp: { visible: true, title: "RSVP" },
      faq: { visible: true, title: "FAQ" },
      registry: { visible: false, title: "Registry" },
    } as ResolvedSiteSections;

    const items = buildInviteSectionNavItems(sections);
    expect(items.map((item) => item.id)).toEqual([
      "home",
      "countdown",
      "venue",
      "wedding-day",
      "story",
      "gallery",
      "party",
      "rsvp",
      "faq",
    ]);
    expect(items.find((item) => item.id === "party")?.label).toBe(
      "Wedding Party",
    );
    expect(items.find((item) => item.id === "rsvp")?.label).toBe("RSVP");
    expect(items.find((item) => item.id === "faq")?.label).toBe("FAQ");
    expect(items.find((item) => item.id === "wedding-day")?.label).toBe(
      "Schedule",
    );
    expect(items.find((item) => item.id === "gallery")?.label).toBe("Gallery");
    expect(items.find((item) => item.id === "venue")?.label).toBe("Venue");
  });
});
