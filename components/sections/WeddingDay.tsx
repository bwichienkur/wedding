"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { scheduleItems, weddingDayTransition } from "@/data/schedule";
import { wedding } from "@/data/wedding";
import {
  buildGoogleCalendarUrl,
  downloadIcs,
} from "@/lib/calendar/schedule";
import { cn } from "@/lib/cn";

const calendarActionClass =
  "invite-outline-button inline-flex min-h-11 items-center justify-center rounded-sm border px-5 text-xs font-medium uppercase tracking-[0.12em]";

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
      <RevealGroup className="invite-schedule relative mt-4" fast>
        <span className="invite-schedule-spine" aria-hidden />
        {scheduleItems.map((item, index) => {
          const googleUrl = buildGoogleCalendarUrl(item);
          const alignRight = index % 2 === 1;
          return (
            <RevealItem key={item.id}>
              <article
                className={cn(
                  "invite-schedule-item",
                  alignRight ? "is-right" : "is-left",
                )}
              >
                <span className="invite-schedule-dot" aria-hidden />
                <p className="invite-schedule-time">{item.timeLabel}</p>
                <p className="invite-schedule-title">{item.title}</p>
                <p
                  className={cn(
                    "mt-2 text-sm leading-relaxed text-invite-body/80",
                    item.descriptionIsPlaceholder && "placeholder-copy italic",
                  )}
                >
                  {item.description}
                </p>
                {item.locationLabel ? (
                  <p className="mt-1 text-sm italic text-invite-body/70">
                    {item.locationLabel}
                  </p>
                ) : null}
                {item.includeInCalendar && item.timeLocal ? (
                  <div
                    className={cn(
                      "mt-3 flex flex-wrap gap-2",
                      alignRight && "justify-end",
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
              </article>
            </RevealItem>
          );
        })}
      </RevealGroup>

      <p className="mt-8 text-center text-xs leading-relaxed text-invite-body/65">
        Ceremony begins {wedding.wedding.ceremonyBegins} ·{" "}
        {wedding.wedding.venueName}
      </p>
    </Section>
  );
}
