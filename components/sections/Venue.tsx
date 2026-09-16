"use client";

import {
  InviteGoldIconLink,
  MapPinIcon,
} from "@/components/invite/InviteGoldIconLink";
import { Section } from "@/components/ui/Section";
import type { VenueInfo } from "@/data/logistics-types";

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
        <InviteGoldIconLink
          href={venue.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          ariaLabel={`Get directions to ${venue.name}`}
        >
          <MapPinIcon className="h-6 w-6" />
        </InviteGoldIconLink>
      </div>
    </Section>
  );
}
