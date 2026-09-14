"use client";

import { Section } from "@/components/ui/Section";
import type { MemoryCard } from "@/data/memories";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

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

/** Horizontal carousel with scroll-linked parallax (Zola-style). */
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
  const [scrollEdges, setScrollEdges] = useState({ atStart: true, atEnd: false });
  const trackRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const reduceMotion = useReducedMotion();

  const updateScrollEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    const left = track.scrollLeft;
    setScrollEdges({
      atStart: left <= 4,
      atEnd: maxScroll <= 4 || left >= maxScroll - 4,
    });
  }, []);

  const scrollCarousel = useCallback(
    (direction: -1 | 1) => {
      const track = trackRef.current;
      const firstSlide = slideRefs.current[0];
      if (!track || !firstSlide) return;
      const styles = getComputedStyle(track);
      const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 16;
      const step = firstSlide.offsetWidth + gap;
      track.scrollBy({
        left: direction * step,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    },
    [reduceMotion],
  );

  const applyParallax = useCallback(() => {
    if (reduceMotion) return;
    const section = document.getElementById("gallery");
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const viewH = window.innerHeight || 1;
    const centerOffset = (rect.top + rect.height * 0.35 - viewH * 0.5) / viewH;
    const clamped = Math.max(-1, Math.min(1, centerOffset));

    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const depth = (index % 3) - 1;
      const y = clamped * (18 + depth * 10);
      const scale = 1 + Math.abs(clamped) * 0.015;
      slide.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
    });
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    applyParallax();
    window.addEventListener("scroll", applyParallax, { passive: true });
    window.addEventListener("resize", applyParallax);
    const track = trackRef.current;
    track?.addEventListener("scroll", applyParallax, { passive: true });
    return () => {
      window.removeEventListener("scroll", applyParallax);
      window.removeEventListener("resize", applyParallax);
      track?.removeEventListener("scroll", applyParallax);
    };
  }, [applyParallax, reduceMotion, cards.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateScrollEdges();

    const onScroll = () => {
      updateScrollEdges();
      applyParallax();
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (maxScroll <= 0) return;
      event.preventDefault();
      track.scrollLeft += event.deltaY;
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    track.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", updateScrollEdges);

    return () => {
      track.removeEventListener("scroll", onScroll);
      track.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", updateScrollEdges);
    };
  }, [applyParallax, cards.length, updateScrollEdges]);

  if (cards.length === 0) {
    return null;
  }

  return (
    <Section
      id="gallery"
      eyebrow={eyebrow}
      title={title}
      description={description}
      className="invite-gallery-section"
    >
      <div className="invite-gallery-carousel-outer">
        <button
          type="button"
          className="invite-gallery-nav invite-gallery-nav--prev"
          aria-label="Previous photos"
          disabled={scrollEdges.atStart}
          onClick={() => scrollCarousel(-1)}
        >
          <span aria-hidden>‹</span>
        </button>
        <button
          type="button"
          className="invite-gallery-nav invite-gallery-nav--next"
          aria-label="Next photos"
          disabled={scrollEdges.atEnd}
          onClick={() => scrollCarousel(1)}
        >
          <span aria-hidden>›</span>
        </button>
        <div
          ref={trackRef}
          className="invite-gallery-carousel"
          role="region"
          aria-label="Photo gallery carousel"
          tabIndex={0}
        >
          {cards.map((card, index) => (
            <article
              key={card.id}
              ref={(el) => {
                slideRefs.current[index] = el;
              }}
              className="invite-gallery-slide"
              style={{ zIndex: index % 2 === 0 ? 2 : 1 }}
            >
              <button
                type="button"
                className="invite-gallery-slide-button group"
                onClick={() => setSelected(card)}
              >
                <span className="invite-photo-frame invite-gallery-slide-frame block overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image.src}
                    alt={card.image.alt}
                    className="aspect-[4/5] h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    draggable={false}
                  />
                </span>
              </button>
            </article>
          ))}
        </div>
        <p className="invite-gallery-hint mt-4 text-center font-sans text-[0.58rem] uppercase tracking-[0.2em] text-invite-body/55">
          <span className="invite-gallery-hint-touch">Swipe to explore</span>
          <span className="invite-gallery-hint-desktop">
            Scroll or use arrows to explore
          </span>
        </p>
      </div>

      {selected ? (
        <GalleryDialog card={selected} onClose={() => setSelected(null)} />
      ) : null}
    </Section>
  );
}
