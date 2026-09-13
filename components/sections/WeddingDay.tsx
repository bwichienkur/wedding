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
      <RevealGroup className="relative mt-2" fast>
        {scheduleItems.map((item, index) => {
          const googleUrl = buildGoogleCalendarUrl(item);
          const isLast = index === scheduleItems.length - 1;
          return (
            <RevealItem key={item.id}>
              <div className="invite-timeline-item">
                {!isLast ? <span className="invite-timeline-line" aria-hidden /> : null}
                <span className="invite-timeline-dot" aria-hidden />
                <p className="invite-timeline-time">{item.timeLabel}</p>
                <p className="invite-timeline-title">{item.title}</p>
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
                  <div className="mt-3 flex flex-wrap gap-2">
                    {googleUrl ? (
                      <ButtonLink
                        href={googleUrl}
                        variant="secondary"
                        size="md"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="invite-outline-button !text-xs"
                      >
                        Calendar
                      </ButtonLink>
                    ) : null}
                    <button
                      type="button"
                      className="invite-venue-pill"
                      onClick={() => downloadIcs(item)}
                    >
                      Download ICS
                    </button>
                  </div>
                ) : null}
              </div>
            </RevealItem>
          );
        })}
      </RevealGroup>

      <p className="mt-6 text-center text-xs leading-relaxed text-invite-body/65">
        Ceremony begins {wedding.wedding.ceremonyBegins} · {wedding.wedding.venueName}
      </p>
    </Section>
  );
}
