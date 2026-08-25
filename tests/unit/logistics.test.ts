import {
  buildGoogleCalendarUrl,
  buildIcsEvent,
  buildLocalDateTime,
} from "@/lib/calendar/schedule";
import { scheduleItems } from "@/data/schedule";
import { venue } from "@/data/venue";
import { travel } from "@/data/travel";
import { weddingParty } from "@/data/party";
import { faqItems } from "@/data/faq";
import { resolveLogistics } from "@/lib/logistics/resolve";
import type { LogisticsDocument } from "@/lib/logistics/types";
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

describe("logistics defaults", () => {
  it("has the confirmed Bella Cosa street address without removed venue blocks", () => {
    expect(venue.addressIsPlaceholder).toBe(false);
    expect(venue.addressLine1).toContain("3111 Masterpiece");
    expect("parking" in venue).toBe(false);
    expect("directions" in venue).toBe(false);
    expect("weather" in venue).toBe(false);
  });

  it("lists Orlando airport, Holiday Inn Express, and Bok Tower Gardens", () => {
    expect(travel.airports).toHaveLength(1);
    expect(travel.airports[0]?.code).toBe("MCO");
    expect(travel.airports[0]?.name).toMatch(/Orlando International/i);
    expect(travel.hotels[0]?.bookingCode).toBe("BLW");
    expect(travel.hotels[0]?.address).toContain("2953 Ridge Way");
    expect(travel.recommendations[0]?.id).toBe("bok-tower-gardens");
    expect(travel.recommendations[0]?.imageSrc).toMatch(/bok-tower/);
  });

  it("seeds thirteen wedding-party people including a ceremony pianist", () => {
    expect(weddingParty).toHaveLength(13);
    expect(weddingParty.filter((m) => m.side === "bright")).toHaveLength(5);
    expect(weddingParty.filter((m) => m.side === "lexi")).toHaveLength(5);
    expect(weddingParty.some((m) => m.id === "ceremony-pianist")).toBe(true);
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

describe("resolveLogistics", () => {
  it("applies FAQ and party overrides from the document", () => {
    const doc: LogisticsDocument = {
      version: 1,
      updatedAt: new Date().toISOString(),
      faq: [
        {
          id: "custom",
          category: "Guests",
          question: "Can I bring my dog?",
          answer: "Please leave pets at home.",
        },
      ],
      party: [
        {
          id: "ceremony-pianist",
          name: "Alex Keys",
          role: "Ceremony pianist",
          side: "shared",
          relationship: "Friend",
          description: "Playing during the ceremony.",
        },
      ],
    };

    const resolved = resolveLogistics(doc);
    expect(resolved.faq).toHaveLength(1);
    expect(resolved.faq[0]?.question).toBe("Can I bring my dog?");
    expect(resolved.party).toHaveLength(1);
    expect(resolved.party[0]?.name).toBe("Alex Keys");
    expect(resolved.venue.addressLine1).toContain("3111 Masterpiece");
  });
});
