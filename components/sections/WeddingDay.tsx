"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { ScheduleItem } from "@/data/logistics-types";
import { scheduleItems, weddingDayTransition } from "@/data/schedule";
import { wedding } from "@/data/wedding";
import {
  buildGoogleCalendarUrl,
  downloadIcs,
} from "@/lib/calendar/schedule";
import { cn } from "@/lib/cn";

const calendarActionClass =
  "invite-outline-button inline-flex min-h-11 items-center justify-center rounded-sm border px-5 text-xs font-medium uppercase tracking-[0.12em]";

function ScheduleCard({
  item,
  align,
}: {
  item: ScheduleItem;
  align: "left" | "right";
}) {
  const googleUrl = buildGoogleCalendarUrl(item);

  return (
    <div
      className={cn(
        "invite-schedule-card",
        align === "left" ? "is-left" : "is-right",
      )}
    >
      <p className="invite-schedule-time">{item.timeLabel}</p>
      <p className="invite-schedule-title">{item.title}</p>
      <p
        className={cn(
          "invite-schedule-desc",
          item.descriptionIsPlaceholder && "placeholder-copy italic",
        )}
      >
        {item.description}
      </p>
      {item.locationLabel ? (
        <p className="invite-schedule-location">{item.locationLabel}</p>
      ) : null}
      {item.includeInCalendar && item.timeLocal ? (
        <div
          className={cn(
            "mt-3 flex flex-wrap gap-2",
            align === "right" ? "justify-start sm:justify-end" : "",
          )}
        >
          {googleUrl ? (
            <ButtonLink
              href={googleUrl}
              variant="secondary"
              size="md"
              target="_blank"
              rel="noopener noreferrer"
              className={calendarActionClass}
            >
              Calendar
            </ButtonLink>
          ) : null}
          <button
            type="button"
            className={calendarActionClass}
            onClick={() => downloadIcs(item)}
          >
            Download ICS
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function WeddingDaySection({
  eyebrow = weddingDayTransition.eyebrow,
  title = "What we have planned for you",
  description = weddingDayTransition.body,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
} = {}) {
  return (
    <Section
      id="wedding-day"
      eyebrow={eyebrow}
      title={title}
      description={description}
    >
      <div className="invite-schedule mt-2">
        <span className="invite-schedule-spine" aria-hidden />
        {scheduleItems.map((item, index) => {
          const alignRight = index % 2 === 1;
          return (
            <Reveal key={item.id} className="invite-schedule-row">
              <div className="invite-schedule-cell invite-schedule-cell--left">
                {!alignRight ? (
                  <ScheduleCard item={item} align="left" />
                ) : null}
              </div>
              <div className="invite-schedule-axis" aria-hidden>
                <span className="invite-schedule-dot" />
              </div>
              <div className="invite-schedule-cell invite-schedule-cell--right">
                {alignRight ? (
                  <ScheduleCard item={item} align="right" />
                ) : null}
              </div>
            </Reveal>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs leading-relaxed text-invite-body/65">
        Ceremony begins {wedding.wedding.ceremonyBegins} ·{" "}
        {wedding.wedding.venueName}
      </p>
    </Section>
  );
}
