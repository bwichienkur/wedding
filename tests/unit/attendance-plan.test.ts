import { describe, expect, it } from "vitest";
import {
  attendancePlanForGuest,
  attendancePlanLabel,
  attendingForPlan,
} from "@/components/rsvp/attendance-plan";

describe("attendance plan", () => {
  const ceremonyId = "event-ceremony-reception";
  const welcomeId = "event-welcome-party";
  const guestId = "guest-1";

  it("maps plan selections to per-event attending values", () => {
    expect(attendingForPlan("both", "ceremony")).toBe("yes");
    expect(attendingForPlan("both", "welcome")).toBe("yes");
    expect(attendingForPlan("ceremony", "ceremony")).toBe("yes");
    expect(attendingForPlan("ceremony", "welcome")).toBe("no");
    expect(attendingForPlan("welcome", "welcome")).toBe("yes");
    expect(attendingForPlan("neither", "ceremony")).toBe("no");
  });

  it("derives plan from drafts", () => {
    const drafts = [
      { guestId, eventId: ceremonyId, attending: "yes" as const },
      { guestId, eventId: welcomeId, attending: "no" as const },
    ];
    expect(attendancePlanForGuest(drafts, guestId, ceremonyId, welcomeId)).toBe(
      "ceremony",
    );
    expect(attendancePlanLabel("both")).toContain("Ceremony");
  });
});
