import type { ScheduleItem } from "./logistics-types";
import { wedding } from "./wedding";

/**
 * Wedding-day journey. Only confirmed times are filled.
 * Do not invent missing times — use “Details coming soon”.
 */
export const scheduleItems: ScheduleItem[] = [
  {
    id: "venue-access",
    timeLabel: wedding.wedding.accessBegins,
    timeLocal: "09:00",
    title: "Venue access begins",
    description:
      "Bella Cosa opens for early arrivals connected to the day’s preparations.",
    guestGroup: "wedding-party",
    arrivalGuidance: "Add arrival guidance for vendors and wedding party.",
    setting: "tbd",
    includeInCalendar: false,
  },
  {
    id: "photography",
    timeLabel: wedding.wedding.photographyBegins,
    timeLocal: "14:00",
    title: "Photography & videography begin",
    description: "Portraits and films begin ahead of the ceremony.",
    guestGroup: "wedding-party",
    setting: "tbd",
    includeInCalendar: false,
  },
  {
    id: "ceremony",
    timeLabel: wedding.wedding.ceremonyBegins,
    timeLocal: "16:00",
    endTimeLocal: "16:45",
    title: "Ceremony",
    description: "Bright and Lexi are married at Bella Cosa.",
    locationLabel: `${wedding.wedding.venueName}, ${wedding.wedding.city}`,
    guestGroup: "all",
    arrivalGuidance: "Add guest arrival guidance for the ceremony.",
    attireNote: "Add dress-code guidance.",
    accessibilityNote: "Add accessibility information for the ceremony space.",
    setting: "tbd",
    includeInCalendar: true,
  },
  {
    id: "reception",
    timeLabel: "5:30 PM",
    timeLocal: "17:30",
    title: "Reception",
    description: "Join Bright and Lexi for the reception at Bella Cosa.",
    locationLabel: `${wedding.wedding.venueName}, ${wedding.wedding.city}`,
    guestGroup: "all",
    setting: "tbd",
    includeInCalendar: true,
  },
  {
    id: "sparkler-sendoff",
    timeLabel: "Time coming soon",
    title: "Sparkler sendoff",
    description: "Details coming soon",
    descriptionIsPlaceholder: true,
    guestGroup: "all",
    includeInCalendar: false,
  },
];

export const weddingDayTransition = {
  eyebrow: "Wedding day",
  title: wedding.wedding.dateDisplay,
  body: "Two paths become one road to Bella Cosa. Here is how the day unfolds — confirmed moments first, the rest as details arrive.",
};
