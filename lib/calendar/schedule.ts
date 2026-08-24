import { wedding } from "@/data/wedding";
import type { ScheduleItem } from "@/data/logistics-types";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Format a floating local datetime as UTC Zulu for ICS using America/New_York offset approximation via explicit offset handling is complex; we emit floating local with TZID. */
export function buildLocalDateTime(
  dateISO: string,
  timeLocal: string,
): string {
  const [hours, minutes] = timeLocal.split(":").map(Number);
  const [year, month, day] = dateISO.split("-").map(Number);
  return `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
}

export function buildGoogleCalendarUrl(item: ScheduleItem): string | null {
  if (!item.includeInCalendar || !item.timeLocal) return null;

  const start = buildLocalDateTime(wedding.wedding.dateISO, item.timeLocal);
  const end = buildLocalDateTime(
    wedding.wedding.dateISO,
    item.endTimeLocal ?? addMinutes(item.timeLocal, 60),
  );

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${item.title} · ${wedding.couple.displayName}`,
    dates: `${start}/${end}`,
    ctz: wedding.wedding.timezone,
    details: item.description,
    location:
      item.locationLabel ??
      `${wedding.wedding.venueName}, ${wedding.wedding.city}, ${wedding.wedding.region}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsEvent(item: ScheduleItem): string | null {
  if (!item.includeInCalendar || !item.timeLocal) return null;

  const start = buildLocalDateTime(wedding.wedding.dateISO, item.timeLocal);
  const end = buildLocalDateTime(
    wedding.wedding.dateISO,
    item.endTimeLocal ?? addMinutes(item.timeLocal, 60),
  );
  const uid = `${item.id}-${wedding.wedding.dateISO}@bright-lexi-wedding`;
  const location =
    item.locationLabel ??
    `${wedding.wedding.venueName}, ${wedding.wedding.city}, ${wedding.wedding.region}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bright & Lexi//Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${buildLocalDateTime(wedding.wedding.dateISO, "00:00")}Z`,
    `DTSTART;TZID=${wedding.wedding.timezone}:${start}`,
    `DTEND;TZID=${wedding.wedding.timezone}:${end}`,
    `SUMMARY:${escapeIcs(`${item.title} · ${wedding.couple.displayName}`)}`,
    `DESCRIPTION:${escapeIcs(item.description)}`,
    `LOCATION:${escapeIcs(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcs(item: ScheduleItem): void {
  const ics = buildIcsEvent(item);
  if (!ics || typeof window === "undefined") return;
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${item.id}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}

function addMinutes(timeLocal: string, minutesToAdd: number): string {
  const [hours, minutes] = timeLocal.split(":").map(Number);
  const total = hours * 60 + minutes + minutesToAdd;
  const nextHours = Math.floor(total / 60) % 24;
  const nextMinutes = total % 60;
  return `${pad(nextHours)}:${pad(nextMinutes)}`;
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
