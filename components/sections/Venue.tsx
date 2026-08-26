"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import type { VenueInfo } from "@/data/logistics-types";
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
      className="bg-parchment/80"
    >
      <div
        ref={ref}
        className="relative mb-10 aspect-[16/10] overflow-hidden bg-parchment"
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
        <div className="absolute bottom-4 left-4 rounded-sm border border-gold/25 bg-parchment/90 px-3 py-2">
          <p className="font-sans text-xs uppercase tracking-[0.16em] text-gold">
            {venue.name}
          </p>
          <p className="font-display text-lg text-ivory">
            {venue.city}, {venue.region}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.18em] text-gold">
            Address
          </p>
          <p className="mt-2 text-base leading-relaxed text-ivory/80">
            {venue.addressLine1}
          </p>
        </div>
        <ButtonLink
          href={venue.mapUrl}
          variant="gold"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open map
        </ButtonLink>
      </div>
    </Section>
  );
}
