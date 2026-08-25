"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import type { VenueInfo } from "@/data/logistics-types";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function VenueSection({
  venue,
  eyebrow = "Venue",
  title = venue.name,
  description = `${venue.city}, ${venue.region}`,
}: {
  venue: VenueInfo;
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    const onScroll = () => {
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const view = window.innerHeight || 1;
      const progress = Math.min(1, Math.max(0, 1 - rect.top / view));
      setOffset(progress);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduceMotion]);

  return (
    <Section
      id="venue"
      eyebrow={eyebrow}
      title={title}
      description={description}
      className="bg-ivory"
    >
      <div
        ref={ref}
        className="relative mb-12 aspect-[16/10] overflow-hidden bg-parchment"
      >
        {venue.layers.map((layer, index) => (
          <div
            key={layer.id}
            className="absolute inset-0"
            style={{
              transform: reduceMotion
                ? undefined
                : `translateY(${(index - 1) * offset * 12}px)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={layer.src}
              alt={layer.alt}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
        <div className="absolute bottom-4 left-4 rounded-sm bg-ivory/90 px-3 py-2">
          <p className="font-sans text-xs uppercase tracking-[0.16em] text-gold">
            Bella Cosa
          </p>
          <p className="font-display text-lg text-forest">Lake Wales, Florida</p>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <InfoBlock
            label="Address"
            value={venue.addressLine1}
            placeholder={venue.addressIsPlaceholder}
          />
          <InfoBlock
            label="Directions"
            value={venue.directions}
            placeholder={venue.directionsIsPlaceholder}
          />
          <InfoBlock
            label="Parking"
            value={venue.parking}
            placeholder={venue.parkingIsPlaceholder}
          />
          <InfoBlock
            label="Accessibility"
            value={venue.accessibility}
            placeholder={venue.accessibilityIsPlaceholder}
          />
        </div>
        <div className="space-y-5">
          <InfoBlock
            label="Ceremony"
            value={venue.ceremonyLocation}
            placeholder={venue.ceremonyIsPlaceholder}
          />
          <InfoBlock
            label="Reception"
            value={venue.receptionLocation}
            placeholder={venue.receptionIsPlaceholder}
          />
          <InfoBlock
            label="Weather"
            value={venue.weather}
            placeholder={venue.weatherIsPlaceholder}
          />
          <InfoBlock
            label="Arrival"
            value={venue.arrivalGuidance}
            placeholder={venue.arrivalIsPlaceholder}
          />
          <InfoBlock
            label="Transportation"
            value={venue.transportationNotes}
            placeholder={venue.transportationIsPlaceholder}
          />
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <ButtonLink
          href={venue.mapUrl}
          variant="gold"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open map
        </ButtonLink>
        <p className="flex min-h-11 items-center text-sm text-ink-muted">
          Opens Google Maps for {venue.addressLine1}.
        </p>
      </div>
    </Section>
  );
}

function InfoBlock({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string;
  placeholder?: boolean;
}) {
  return (
    <div>
      <p className="font-sans text-xs uppercase tracking-[0.18em] text-gold">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-base leading-relaxed text-charcoal",
          placeholder && "placeholder-copy text-ink-muted",
        )}
      >
        {value}
      </p>
    </div>
  );
}
