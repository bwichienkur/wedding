"use client";

import { Expandable } from "@/components/ui/Accordion";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import type { TravelInfo } from "@/data/logistics-types";
import { travel as defaultTravel } from "@/data/travel";
import { cn } from "@/lib/cn";

export function TravelSection({
  travel = defaultTravel,
  eyebrow = "Travel",
  title = "Travel",
  description = travel.intro,
}: {
  travel?: TravelInfo;
  eyebrow?: string;
  title?: string;
  description?: string;
} = {}) {
  return (
    <Section
      id="travel"
      eyebrow={eyebrow}
      title={title}
      description={description}
      className="bg-parchment/50"
    >
      <div className="space-y-12">
        {travel.airports.length > 0 ? (
          <div>
            <h3 className="font-display text-2xl text-forest">Airports</h3>
            <ul className="mt-6 space-y-6">
              {travel.airports.map((airport) => (
                <li key={airport.id} className="border-l border-gold/50 pl-4">
                  <p className="font-display text-xl text-forest">
                    {airport.name}{" "}
                    <span className="font-sans text-sm tracking-[0.14em] text-gold">
                      {airport.code}
                    </span>
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-sm text-ink-muted",
                      airport.driveTimeIsPlaceholder && "placeholder-copy",
                    )}
                  >
                    {airport.driveTimeLabel}
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-sm text-charcoal",
                      airport.notesIsPlaceholder && "placeholder-copy",
                    )}
                  >
                    {airport.notes}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {travel.hotels.length > 0 ? (
          <div>
            <h3 className="font-display text-2xl text-forest">Hotels</h3>
            <div className="mt-6 space-y-4">
              {travel.hotels.map((hotel) => (
                <Expandable
                  key={hotel.id}
                  title={hotel.name}
                  badge={
                    hotel.status === "placeholder" ? "Placeholder" : "Confirmed"
                  }
                >
                  <p
                    className={cn(
                      "text-sm text-charcoal",
                      hotel.status === "placeholder" && "placeholder-copy",
                    )}
                  >
                    {hotel.address}
                  </p>
                  <p className="placeholder-copy mt-3 text-sm text-ink-muted">
                    {hotel.notes}
                  </p>
                  {hotel.bookingDeadline ? (
                    <p className="placeholder-copy mt-2 text-sm text-ink-muted">
                      Deadline: {hotel.bookingDeadline}
                    </p>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {hotel.bookingUrl ? (
                      <ButtonLink
                        href={hotel.bookingUrl}
                        variant="gold"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Book
                      </ButtonLink>
                    ) : (
                      <p className="text-sm text-ink-muted">
                        Booking link coming once the hotel block is confirmed.
                      </p>
                    )}
                    {hotel.phone ? (
                      <ButtonLink href={`tel:${hotel.phone}`} variant="secondary">
                        Call
                      </ButtonLink>
                    ) : null}
                  </div>
                </Expandable>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <h3 className="font-display text-2xl text-forest">Transportation</h3>
          <p
            className={cn(
              "mt-4 max-w-prose text-base text-ink-muted",
              travel.transportationIsPlaceholder && "placeholder-copy",
            )}
          >
            {travel.transportation}
          </p>
        </div>

        {travel.recommendations.length > 0 ? (
          <div>
            <h3 className="font-display text-2xl text-forest">
              Local recommendations
            </h3>
            <ul className="mt-6 grid gap-6 md:grid-cols-2">
              {travel.recommendations.map((item) => (
                <li key={item.id}>
                  <p className="font-sans text-xs uppercase tracking-[0.16em] text-gold">
                    {item.category}
                  </p>
                  <p className="mt-2 font-display text-xl text-forest">
                    {item.name}
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-sm text-ink-muted",
                      item.isPlaceholder && "placeholder-copy",
                    )}
                  >
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <h3 className="font-display text-2xl text-forest">Day-of contact</h3>
          <p
            className={cn(
              "mt-4 text-base text-ink-muted",
              travel.emergencyIsPlaceholder && "placeholder-copy",
            )}
          >
            {travel.emergencyContact}
          </p>
        </div>
      </div>
    </Section>
  );
}
