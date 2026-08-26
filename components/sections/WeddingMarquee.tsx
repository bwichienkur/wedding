"use client";

import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";

const PHRASES = [
  wedding.couple.displayName,
  wedding.wedding.dateDisplay,
  wedding.wedding.venueName,
  `${wedding.wedding.city}, ${wedding.wedding.region}`,
  "Together with their families",
  "The Golden Thread",
];

/** Endless horizontal editorial marquee of wedding phrases. */
export function WeddingMarquee({ className }: { className?: string }) {
  const sequence = [...PHRASES, ...PHRASES];

  return (
    <div
      className={cn(
        "relative overflow-hidden border-y border-gold/25 bg-forest py-4",
        className,
      )}
      aria-hidden
    >
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap px-6">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-10">
            {sequence.map((phrase, index) => (
              <span
                key={`${copy}-${phrase}-${index}`}
                className="font-display text-xl tracking-wide text-ivory/90 sm:text-2xl"
              >
                {phrase}
                <span className="ml-10 inline-block text-gold/80">·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
