"use client";

import { GoldenThread } from "@/components/story/GoldenThread";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import type { MemoryCard } from "@/data/memories";
import { wedding } from "@/data/wedding";
import { useExperienceCapabilities } from "@/lib/three/useExperienceCapabilities";
import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState } from "react";

const MemoryGalleryCanvas = dynamic(
  () =>
    import("@/components/three/MemoryGalleryCanvas").then(
      (mod) => mod.MemoryGalleryCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[50vh] min-h-[20rem] items-center justify-center bg-parchment/50">
        <p className="font-sans text-sm text-ink-muted">Loading gallery…</p>
      </div>
    ),
  },
);

function MemoryTimelineFallback({
  cards,
  onOpen,
}: {
  cards: MemoryCard[];
  onOpen?: (card: MemoryCard) => void;
}) {
  return (
    <ol className="space-y-8">
      {cards.map((card) => (
        <li
          key={card.id}
          className="grid gap-4 md:grid-cols-[160px_1fr] md:items-center"
        >
          <button
            type="button"
            className="relative aspect-[3/2] overflow-hidden bg-parchment text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold md:aspect-[4/5]"
            onClick={() => onOpen?.(card)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.image.src}
              alt={card.image.alt}
              className="h-full w-full object-cover"
            />
          </button>
          <div>
            <p className="font-sans text-xs uppercase tracking-[0.18em] text-gold">
              {card.dateLabel}
            </p>
            <h3 className="mt-2 font-display text-2xl text-forest">
              {card.title}
            </h3>
            {card.annotation ? (
              <p className="mt-2 font-annotation text-lg text-ink-muted">
                {card.annotation}
              </p>
            ) : null}
            <a
              href={card.storyHref}
              className="mt-3 inline-flex min-h-11 items-center font-sans text-sm text-forest underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              View in our story
            </a>
          </div>
        </li>
      ))}
    </ol>
  );
}

function MemoryDialog({
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-forest/45 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90svh] w-full max-w-lg overflow-auto bg-ivory p-5 sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={card.image.src}
          alt={card.image.alt}
          className="aspect-[4/5] w-full bg-parchment object-cover"
        />
        <p className="mt-5 font-sans text-xs uppercase tracking-[0.18em] text-gold">
          {card.dateLabel}
        </p>
        <h3 id={titleId} className="mt-2 font-display text-3xl text-forest">
          {card.title}
        </h3>
        {card.annotation ? (
          <p className="mt-3 font-annotation text-xl text-ink-muted">
            {card.annotation}
          </p>
        ) : (
          <p className="placeholder-copy mt-3 text-sm text-ink-muted">
            Add a short note or caption for this memory.
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            ref={closeRef}
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-sm border border-stone px-5 font-sans text-sm uppercase tracking-[0.08em] text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            onClick={onClose}
          >
            Close
          </button>
          <a
            href={card.storyHref}
            className="inline-flex min-h-11 items-center px-2 font-sans text-sm uppercase tracking-[0.12em] text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            onClick={onClose}
          >
            Continue in story
          </a>
        </div>
      </div>
    </div>
  );
}

export function MemoryGallerySection({
  cards,
  eyebrow = "Memories",
  title = "Moments along the thread",
  description = "Selected photographs from Bright and Lexi’s story — a calm timeline you can browse at your own pace.",
}: {
  cards: MemoryCard[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  const capabilities = useExperienceCapabilities();
  const [selected, setSelected] = useState<MemoryCard | null>(null);
  const [forceSimple, setForceSimple] = useState(false);
  const use3d =
    wedding.featureFlags.floatingGallery &&
    capabilities.webgl &&
    !capabilities.simplified &&
    !forceSimple;

  function openById(id: string) {
    const card = cards.find((item) => item.id === id) ?? null;
    setSelected(card);
  }

  return (
    <Section
      id="gallery"
      eyebrow={eyebrow}
      title={title}
      description={description}
      className="bg-parchment/40"
    >
      {wedding.featureFlags.floatingGallery ? (
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            aria-pressed={forceSimple || !use3d}
            onClick={() => setForceSimple((value) => !value)}
          >
            {use3d ? "Use simplified gallery" : "Simplified gallery on"}
          </Button>
        </div>
      ) : null}

      {use3d ? (
        <div className="relative">
          <GoldenThread
            chapter="gallery"
            className="pointer-events-none absolute inset-x-0 top-6 h-20 w-full opacity-55"
          />
          <MemoryGalleryCanvas cards={cards} onSelect={openById} />
        </div>
      ) : (
        <MemoryTimelineFallback
          cards={cards}
          onOpen={(card) => setSelected(card)}
        />
      )}

      {selected ? (
        <MemoryDialog card={selected} onClose={() => setSelected(null)} />
      ) : null}
    </Section>
  );
}
