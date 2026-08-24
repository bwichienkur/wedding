import {
  buildGoogleCalendarUrl,
  buildIcsEvent,
  buildLocalDateTime,
} from "@/lib/calendar/schedule";
import { scheduleItems } from "@/data/schedule";
import { venue } from "@/data/venue";
import { faqItems } from "@/data/faq";
import { describe, expect, it } from "vitest";

describe("schedule data", () => {
  it("includes the confirmed ceremony time and does not invent dinner time", () => {
    const ceremony = scheduleItems.find((item) => item.id === "ceremony");
    const dinner = scheduleItems.find((item) => item.id === "dinner");
    expect(ceremony?.timeLocal).toBe("16:00");
    expect(ceremony?.includeInCalendar).toBe(true);
    expect(dinner?.timeLabel).toBe("Time coming soon");
    expect(dinner?.includeInCalendar).toBe(false);
  });
});

describe("calendar helpers", () => {
  it("builds timezone-aware Google Calendar links for calendar-enabled items", () => {
    const ceremony = scheduleItems.find((item) => item.id === "ceremony");
    expect(ceremony).toBeTruthy();
    const url = buildGoogleCalendarUrl(ceremony!);
    expect(url).toContain("calendar.google.com");
    expect(url).toContain("ctz=America%2FNew_York");
    expect(buildLocalDateTime("2027-05-15", "16:00")).toBe("20270515T160000");
  });

  it("builds ICS only when a start time is known", () => {
    const ceremony = scheduleItems.find((item) => item.id === "ceremony")!;
    const dinner = scheduleItems.find((item) => item.id === "dinner")!;
    expect(buildIcsEvent(ceremony)).toContain("BEGIN:VEVENT");
    expect(buildIcsEvent(dinner)).toBeNull();
  });
});

describe("logistics placeholders", () => {
  it("keeps venue address clearly incomplete", () => {
    expect(venue.addressIsPlaceholder).toBe(true);
  });

  it("covers required FAQ topics", () => {
    const ids = faqItems.map((item) => item.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "dress-code",
        "parking",
        "accessibility",
        "registry",
        "rsvp-deadline",
      ]),
    );
  });
});
