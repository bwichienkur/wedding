"use client";

import { heroSlides } from "@/data/hero-slides";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const INTERVAL_MS = 5500;

/**
 * Full-bleed homepage photo rotation — Zola-style multi-photo header.
 * Pauses under reduced motion; supports dots + swipe.
 */
export function HeroCarousel({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const labelId = useId();
  const slides = heroSlides;
  const count = slides.length;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (reduceMotion || paused || count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, paused, count]);

  function onPointerDown(event: ReactPointerEvent) {
    touchStartX.current = event.clientX;
  }

  function onPointerUp(event: ReactPointerEvent) {
    if (touchStartX.current === null) return;
    const delta = event.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 48) return;
    goTo(index + (delta < 0 ? 1 : -1));
  }

  if (count === 0) return null;

  const active = slides[index]!;

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden bg-parchment", className)}
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <p id={labelId} className="sr-only">
        Homepage photographs
      </p>

      {slides.map((slide, slideIndex) => {
        const isActive = slideIndex === index;
        return (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-out",
              isActive ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={!isActive}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image.src}
              alt={isActive ? slide.image.alt : ""}
              width={slide.image.width}
              height={slide.image.height}
              className="h-full w-full object-cover"
              style={
                slide.image.focalPoint
                  ? {
                      objectPosition: `${slide.image.focalPoint.x}% ${slide.image.focalPoint.y}%`,
                    }
                  : undefined
              }
              draggable={false}
            />
          </div>
        );
      })}

      {/* Readability veil — keeps brand typography legible over photos */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/55 to-ivory/15 sm:via-ivory/45"
        aria-hidden
      />
      <div
        className="grain absolute inset-0 opacity-25 mix-blend-multiply"
        aria-hidden
      />

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-2 sm:bottom-8">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              className={cn(
                "h-2.5 min-h-11 min-w-11 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                "flex items-center justify-center",
              )}
              aria-label={`Show photo ${slideIndex + 1} of ${count}${
                slide.label ? `: ${slide.label}` : ""
              }`}
              aria-current={slideIndex === index ? "true" : undefined}
              onClick={() => goTo(slideIndex)}
            >
              <span
                className={cn(
                  "block h-1.5 w-1.5 rounded-full transition-all",
                  slideIndex === index
                    ? "w-5 bg-forest"
                    : "bg-forest/35 hover:bg-forest/55",
                )}
              />
            </button>
          ))}
        </div>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {active.label ?? active.image.alt}
      </p>
    </div>
  );
}
