import { logisticsPatchSchema } from "@/lib/logistics/schema";
import { describe, expect, it } from "vitest";

describe("logisticsPatchSchema", () => {
  it("accepts FAQ upsert, create without id, and delete", () => {
    expect(
      logisticsPatchSchema.safeParse({
        kind: "faq",
        action: "upsert",
        id: "dress-code",
        category: "Attire",
        question: "What is the dress code?",
        answer: "Garden formal",
      }).success,
    ).toBe(true);

    expect(
      logisticsPatchSchema.safeParse({
        kind: "faq",
        action: "upsert",
        id: "",
        category: "Guests",
        question: "May I bring a plus-one?",
        answer: "See your invitation.",
      }).success,
    ).toBe(true);

    expect(
      logisticsPatchSchema.safeParse({
        kind: "faq",
        action: "delete",
        id: "dress-code",
      }).success,
    ).toBe(true);
  });

  it("accepts party upsert and delete without clashing on kind", () => {
    expect(
      logisticsPatchSchema.safeParse({
        kind: "party",
        action: "upsert",
        id: "ceremony-pianist",
        name: "Alex Keys",
        role: "Ceremony pianist",
        side: "shared",
        description: "Playing during the ceremony.",
        funFact: "",
      }).success,
    ).toBe(true);

    expect(
      logisticsPatchSchema.safeParse({
        kind: "party",
        action: "delete",
        id: "ceremony-pianist",
      }).success,
    ).toBe(true);
  });

  it("still accepts venue and travel patches", () => {
    expect(
      logisticsPatchSchema.safeParse({
        kind: "venue",
        addressLine1: "3111 Masterpiece Rd, Lake Wales, FL 33898",
      }).success,
    ).toBe(true);

    expect(
      logisticsPatchSchema.safeParse({
        kind: "travel",
        intro: "Fly into Orlando.",
        airports: [
          {
            id: "mco",
            name: "Orlando International Airport",
            code: "MCO",
            driveTimeLabel: "About 1 hour",
            notes: "Nearest airport",
          },
        ],
      }).success,
    ).toBe(true);
  });
});
