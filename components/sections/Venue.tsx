"use client";

import { Section } from "@/components/ui/Section";
import type { VenueInfo } from "@/data/logistics-types";

function LocationPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function VenueSection({
  venue,
  eyebrow = "The Venue",
  title = venue.name,
  description,
}: {
  venue: VenueInfo;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  const primaryLayer = venue.layers[0];

  return (
    <Section
      id="venue"
      eyebrow={eyebrow}
      title={title}
      description={description ?? `${venue.city}, ${venue.region}`}
    >
      {primaryLayer ? (
        <div className="invite-photo-frame mx-auto aspect-[4/3] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primaryLayer.src}
            alt={primaryLayer.alt}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <p className="mt-6 text-center font-display text-base italic text-invite-body/80">
        {venue.addressLine1}
      </p>
      <p className="mt-1 text-center text-sm text-invite-body/65">
        {venue.city}, {venue.region}
      </p>

      <div className="mt-6 flex justify-center">
        <a
          href={venue.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="invite-venue-directions-btn"
          aria-label={`Get directions to ${venue.name}`}
        >
          <LocationPinIcon className="h-6 w-6" />
        </a>
      </div>
    </Section>
  );
}
