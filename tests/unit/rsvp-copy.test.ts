import { attendingLabel } from "@/components/rsvp/rsvp-copy";
import { describe, expect, it } from "vitest";

describe("rsvp copy", () => {
  it("uses guest-friendly attendance labels", () => {
    expect(attendingLabel("yes")).toBe("Attending");
    expect(attendingLabel("no")).toBe("Can't make it");
    expect(attendingLabel("unknown")).toBe("Not answered yet");
  });
});
