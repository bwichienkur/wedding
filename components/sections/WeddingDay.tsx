"use client";

import { GoldenThread } from "@/components/story/GoldenThread";
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

export function WeddingDaySection() {
  return (
    <Section
      id="wedding-day"
      eyebrow={weddingDayTransition.eyebrow}
      title={weddingDayTransition.title}
      description={weddingDayTransition.body}
      className="bg-parchment/60"
    >
      <div className="relative mb-12">
        <GoldenThread chapter="wedding" className="h-20 w-full text-rose opacity-55 sm:h-24" />
        <p className="mt-4 font-sans text-xs uppercase tracking-[0.22em] text-ink-muted">
          The golden thread becomes the day’s route
        </p>
      </div>

      <RevealGroup className="relative space-y-0" fast>
        {scheduleItems.map((item, index) => {
          const googleUrl = buildGoogleCalendarUrl(item);
          return (
            <RevealItem key={item.id}>
              <div className="relative grid gap-4 py-8 md:grid-cols-[7rem_1fr]">
                {index < scheduleItems.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute left-[0.35rem] top-14 hidden h-[calc(100%-1.5rem)] w-px bg-rose/40 md:left-[6.4rem] md:block"
                  />
                ) : null}
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.2em] text-rose">
                    {item.timeLabel}
                  </p>
                </div>
                <div className="border-l border-rose/35 pl-5 md:border-l-0 md:pl-0">
                  <h3 className="font-display text-2xl text-forest sm:text-3xl">
                    {item.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-3 max-w-prose text-base leading-relaxed text-ink-muted",
                      item.descriptionIsPlaceholder && "placeholder-copy",
                    )}
                  >
                    {item.description}
                  </p>
                  {item.locationLabel ? (
                    <p className="mt-2 text-sm text-charcoal">
                      {item.locationLabel}
                    </p>
                  ) : null}
                  {item.arrivalGuidance ? (
                    <p className="placeholder-copy mt-3 text-sm text-ink-muted">
                      {item.arrivalGuidance}
                    </p>
                  ) : null}
                  {item.attireNote ? (
                    <p className="placeholder-copy mt-2 text-sm text-ink-muted">
                      {item.attireNote}
                    </p>
                  ) : null}
                  {item.accessibilityNote ? (
                    <p className="placeholder-copy mt-2 text-sm text-ink-muted">
                      {item.accessibilityNote}
                    </p>
                  ) : null}
                  {item.includeInCalendar && item.timeLocal ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      {googleUrl ? (
                        <ButtonLink
                          href={googleUrl}
                          variant="secondary"
                          size="md"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Google Calendar
                        </ButtonLink>
                      ) : null}
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center justify-center border border-stone px-5 font-sans text-sm uppercase tracking-[0.12em] text-forest transition-transform hover:scale-[1.01] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
                        onClick={() => downloadIcs(item)}
                      >
                        Download ICS
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </RevealItem>
          );
        })}
      </RevealGroup>

      <p className="mt-4 text-sm text-ink-muted">
        Venue access begins {wedding.wedding.accessBegins}. Photography and
        videography begin {wedding.wedding.photographyBegins}. Ceremony begins{" "}
        {wedding.wedding.ceremonyBegins}. Times marked “coming soon” will be
        updated when confirmed — nothing here is invented.
      </p>
    </Section>
  );
}
