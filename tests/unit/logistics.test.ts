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
  it("includes confirmed ceremony and reception times", () => {
    const ceremony = scheduleItems.find((item) => item.id === "ceremony");
    const reception = scheduleItems.find((item) => item.id === "reception");
    expect(ceremony?.timeLocal).toBe("16:00");
    expect(ceremony?.includeInCalendar).toBe(true);
    expect(reception?.timeLocal).toBe("17:30");
    expect(reception?.includeInCalendar).toBe(true);
    expect(scheduleItems.some((item) => item.id === "dinner")).toBe(false);
    expect(scheduleItems.some((item) => item.id === "toasts")).toBe(false);
    expect(scheduleItems.some((item) => item.id === "dancing")).toBe(false);
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

  it("builds ICS for timed events and skips untimed ones", () => {
    const ceremony = scheduleItems.find((item) => item.id === "ceremony")!;
    const sendoff = scheduleItems.find((item) => item.id === "sparkler-sendoff")!;
    expect(buildIcsEvent(ceremony)).toContain("BEGIN:VEVENT");
    expect(buildIcsEvent(sendoff)).toBeNull();
  });
});

describe("logistics placeholders", () => {
  it("has the confirmed Bella Cosa street address", () => {
    expect(venue.addressIsPlaceholder).toBe(false);
    expect(venue.addressLine1).toContain("3111 Masterpiece");
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
