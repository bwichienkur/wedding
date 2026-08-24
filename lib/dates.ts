import { wedding } from "@/data/wedding";

export function getWeddingDate(): Date {
  // Noon local-intent to avoid timezone edge flipping the calendar day in UI.
  return new Date(`${wedding.wedding.dateISO}T12:00:00`);
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
}

export function getCountdownParts(now: Date = new Date()): CountdownParts {
  const target = getWeddingDate();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, isPast: true };
  }

  const totalMinutes = Math.floor(diff / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes, isPast: false };
}
