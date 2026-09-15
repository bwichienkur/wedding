"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import type { TravelInfo } from "@/data/logistics-types";
import { travel as defaultTravel } from "@/data/travel";

export function TravelSection({
  travel = defaultTravel,
  eyebrow = "Travel",
  title = "Travel",
  description = "",
}: {
  travel?: TravelInfo;
  eyebrow?: string;
  title?: string;
  description?: string;
} = {}) {
  const subline = description?.trim() || undefined;

  return (
    <Section
      id="travel"
      eyebrow={eyebrow}
      title={title}
      description={subline}
      className="invite-travel-section"
    >
      {travel.intro?.trim() ? (
        <p className="invite-section-subline mx-auto mb-8 max-w-md text-center text-balance">
          {travel.intro}
        </p>
      ) : null}

      {travel.hotels.length > 0 ? (
        <div>
          <h3 className="text-center font-display text-xl text-invite-navy sm:text-2xl">
            Accommodations
          </h3>
          <ul className="mt-6 space-y-6">
            {travel.hotels.map((hotel) => (
              <li key={hotel.id} className="invite-travel-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h4 className="font-display text-xl sm:text-2xl">{hotel.name}</h4>
                  {hotel.status === "confirmed" ? (
                    <span className="invite-travel-badge">Room block</span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-invite-body/90">
                  {hotel.address}
                </p>
                {hotel.bookingCode ? (
                  <p className="mt-4 font-sans text-xs uppercase tracking-[0.16em] text-invite-body/75">
                    Discount code
                    <span className="invite-travel-code ml-2">
                      {hotel.bookingCode}
                    </span>
                  </p>
                ) : null}
                {hotel.notes ? (
                  <p className="mt-3 text-sm leading-relaxed text-invite-body/85">
                    {hotel.notes}
                  </p>
                ) : null}
                <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
                  {hotel.bookingUrl ? (
                    <ButtonLink
                      href={hotel.bookingUrl}
                      variant="gold"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Book stay
                    </ButtonLink>
                  ) : null}
                  {hotel.phone ? (
                    <ButtonLink
                      href={`tel:${hotel.phone}`}
                      variant="secondary"
                      className="invite-outline-button"
                    >
                      Call hotel
                    </ButtonLink>
                  ) : null}
                  <ButtonLink
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.address)}`}
                    variant="secondary"
                    className="invite-outline-button"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open map
                  </ButtonLink>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}
