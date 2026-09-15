import type { Attending } from "@/lib/rsvp/types";

export function attendingLabel(attending: Attending): string {
  if (attending === "yes") return "Attending";
  if (attending === "no") return "Can't make it";
  return "Not answered yet";
}

export function guestDisplayName(
  guest: {
    fullName: string;
    isPlusOne: boolean;
    plusOneNamed: boolean;
  },
  plusOneName?: string,
): string {
  if (guest.isPlusOne && !guest.plusOneNamed) {
    return plusOneName?.trim() ? plusOneName.trim() : "Plus-one";
  }
  return guest.fullName;
}
