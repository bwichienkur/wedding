import type { ScheduleItem } from "./logistics-types";
import { wedding } from "./wedding";

/**
 * Wedding-day journey. Only confirmed times are filled.
 * Do not invent missing times — use “Details coming soon”.
 */
export const scheduleItems: ScheduleItem[] = [
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
  body: "",
};
