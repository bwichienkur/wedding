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
      className=""
    >
      <div className="space-y-12">
        {travel.hotels.length > 0 ? (
          <div>
            <h3 className="font-display text-2xl text-invite-navy">Accommodations</h3>
            <ul className="mt-6 space-y-8">
              {travel.hotels.map((hotel) => (
                <li
                  key={hotel.id}
                  className="rounded-sm border border-[rgb(201_162_77/0.28)] bg-[#faf6ef] p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h4 className="font-display text-xl text-invite-navy sm:text-2xl">
                      {hotel.name}
                    </h4>
                    {hotel.status === "confirmed" ? (
                      <span className="font-sans text-xs uppercase tracking-[0.16em] text-invite-gold">
                        Confirmed
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-invite-body/85">{hotel.address}</p>
                  {hotel.bookingCode ? (
                    <p className="mt-3 font-sans text-sm text-invite-body">
                      Discount code{" "}
                      <span className="font-semibold tracking-[0.08em] text-invite-gold">
                        {hotel.bookingCode}
                      </span>
                    </p>
                  ) : null}
                  {hotel.notes ? (
                    <p className="mt-2 text-sm text-invite-body/80">{hotel.notes}</p>
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
                      <ButtonLink
                        href={`tel:${hotel.phone}`}
                        variant="secondary"
                        className="invite-outline-button"
                      >
                        Call
                      </ButtonLink>
                    ) : null}
                    <ButtonLink
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.address)}`}
                      variant="secondary"
                      className="invite-outline-button"
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
      </div>
    </Section>
  );
}
