"use client";

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
            <h3 className="font-display text-2xl text-gold">Airport</h3>
            <ul className="mt-6 space-y-6">
              {travel.airports.map((airport) => (
                <li key={airport.id} className="border-l border-gold/50 pl-4">
                  <p className="font-display text-xl text-gold">
                    {airport.name}{" "}
                    <span className="font-sans text-sm tracking-[0.14em] text-gold-soft">
                      {airport.code}
                    </span>
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-sm text-ivory/70",
                      airport.driveTimeIsPlaceholder && "placeholder-copy",
                    )}
                  >
                    {airport.driveTimeLabel}
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-sm text-ivory/80",
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
            <h3 className="font-display text-2xl text-gold">Accommodations</h3>
            <ul className="mt-6 space-y-8">
              {travel.hotels.map((hotel) => (
                <li
                  key={hotel.id}
                  className="border border-gold/25 bg-parchment p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h4 className="font-display text-xl text-gold sm:text-2xl">
                      {hotel.name}
                    </h4>
                    {hotel.status === "confirmed" ? (
                      <span className="font-sans text-xs uppercase tracking-[0.16em] text-gold">
                        Confirmed
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-ivory/80">{hotel.address}</p>
                  {hotel.bookingCode ? (
                    <p className="mt-3 font-sans text-sm text-ivory">
                      Discount code{" "}
                      <span className="font-semibold tracking-[0.08em] text-gold">
                        {hotel.bookingCode}
                      </span>
                    </p>
                  ) : null}
                  {hotel.notes ? (
                    <p className="mt-2 text-sm text-ivory/70">{hotel.notes}</p>
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
                    ) : null}
                    {hotel.phone ? (
                      <ButtonLink href={`tel:${hotel.phone}`} variant="secondary">
                        Call
                      </ButtonLink>
                    ) : null}
                    <ButtonLink
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.address)}`}
                      variant="secondary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Map
                    </ButtonLink>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <h3 className="font-display text-2xl text-gold">Transportation</h3>
          <p
            className={cn(
              "mt-4 max-w-prose text-base text-ivory/70",
              travel.transportationIsPlaceholder && "placeholder-copy",
            )}
          >
            {travel.transportation}
          </p>
        </div>

        {travel.recommendations.length > 0 ? (
          <div>
            <h3 className="font-display text-2xl text-gold">
              Something nearby
            </h3>
            <ul className="mt-6 grid gap-8 md:grid-cols-2">
              {travel.recommendations.map((item) => (
                <li key={item.id} className="flex flex-col">
                  {item.imageSrc ? (
                    <div className="mb-4 aspect-[4/3] overflow-hidden bg-parchment">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageSrc}
                        alt={item.imageAlt ?? item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <p className="font-sans text-xs uppercase tracking-[0.16em] text-gold">
                    {item.category}
                  </p>
                  <p className="mt-2 font-display text-xl text-gold">
                    {item.name}
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-sm text-ivory/70",
                      item.isPlaceholder && "placeholder-copy",
                    )}
                  >
                    {item.description}
                  </p>
                  {item.url ? (
                    <div className="mt-4">
                      <ButtonLink
                        href={item.url}
                        variant="secondary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit site
                      </ButtonLink>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <h3 className="font-display text-2xl text-gold">Day-of contact</h3>
          <p
            className={cn(
              "mt-4 text-base text-ivory/70",
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
