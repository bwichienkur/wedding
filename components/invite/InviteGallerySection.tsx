"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { MemoryCard } from "@/data/memories";
import { useEffect, useId, useRef, useState } from "react";

function GalleryDialog({
  card,
  onClose,
}: {
  card: MemoryCard;
  onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#0a1628]/70 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90svh] w-full max-w-md overflow-auto rounded-sm border border-[rgb(201_162_77/0.35)] bg-[#faf6ef] p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.image.src}
          alt={card.image.alt}
          className="invite-photo-frame aspect-[4/5] w-full object-cover"
        />
        <p className="mt-4 font-sans text-[0.58rem] uppercase tracking-[0.22em] text-invite-gold">
          {card.dateLabel}
        </p>
        <h3
          id={titleId}
          className="mt-2 font-display text-2xl text-invite-navy"
        >
          {card.title}
        </h3>
        <button
          ref={closeRef}
          type="button"
          className="invite-outline-button mt-6 inline-flex min-h-11 items-center justify-center rounded-sm border px-5 text-xs font-medium uppercase tracking-[0.12em]"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/** Photo grid gallery for the invite card — scroll-reveals each image. */
export function InviteGallerySection({
  cards,
  eyebrow = "Gallery",
  title = "Our moments",
  description = "A few favorites from Bright and Lexi’s story.",
}: {
  cards: MemoryCard[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  const [selected, setSelected] = useState<MemoryCard | null>(null);

  if (cards.length === 0) {
    return null;
  }

  return (
    <Section id="gallery" eyebrow={eyebrow} title={title} description={description}>
      <ul className="invite-gallery-grid">
        {cards.map((card) => (
          <li key={card.id}>
            <Reveal className="h-full">
              <button
                type="button"
                className="invite-gallery-tile group w-full text-left"
                onClick={() => setSelected(card)}
              >
                <span className="invite-photo-frame block overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image.src}
                    alt={card.image.alt}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </span>
                <span className="mt-3 block font-display text-base text-invite-navy">
                  {card.title}
                </span>
                <span className="mt-1 block font-sans text-[0.58rem] uppercase tracking-[0.18em] text-invite-body/65">
                  {card.dateLabel}
                </span>
              </button>
            </Reveal>
          </li>
        ))}
      </ul>

      {selected ? (
        <GalleryDialog card={selected} onClose={() => setSelected(null)} />
      ) : null}
    </Section>
  );
}
