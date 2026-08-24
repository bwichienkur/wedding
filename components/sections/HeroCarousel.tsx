"use client";

import { heroSlides } from "@/data/hero-slides";
import { cn } from "@/lib/cn";
import { editorialEase } from "@/lib/motion";
import { motion, useReducedMotion } from "motion/react";
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
 * Full-bleed homepage photo rotation with optional editorial dark veil + ken-burns entry.
 */
export function HeroCarousel({
  className,
  editorial = false,
}: {
  className?: string;
  editorial?: boolean;
}) {
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
      className={cn(
        "absolute inset-0 overflow-hidden",
        editorial ? "bg-forest" : "bg-parchment",
        className,
      )}
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
          <motion.div
            key={slide.id}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: isActive ? 1 : 0 }}
            transition={{ duration: 1.1, ease: editorialEase }}
            aria-hidden={!isActive}
          >
            <motion.div
              className="h-full w-full"
              initial={
                reduceMotion || !editorial
                  ? false
                  : slideIndex === 0
                    ? { scale: 1.1 }
                    : { scale: 1.04 }
              }
              animate={
                isActive && !reduceMotion && editorial
                  ? { scale: 1 }
                  : { scale: isActive ? 1 : 1.02 }
              }
              transition={{ duration: 1.5, ease: editorialEase }}
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
            </motion.div>
          </motion.div>
        );
      })}

      {editorial ? (
        <>
          <div
            className="absolute inset-0 bg-gradient-to-b from-forest/55 via-transparent to-forest/75"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-forest/40 via-transparent to-transparent"
            aria-hidden
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/55 to-ivory/15 sm:via-ivory/45"
            aria-hidden
          />
          <div
            className="grain absolute inset-0 opacity-25 mix-blend-multiply"
            aria-hidden
          />
        </>
      )}

      {count > 1 ? (
        <div
          className={cn(
            "absolute inset-x-0 z-10 flex items-center justify-center gap-2",
            editorial ? "bottom-20 sm:bottom-24" : "bottom-5 sm:bottom-8",
          )}
        >
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              className="flex h-2.5 min-h-11 min-w-11 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blush"
              aria-label={`Show photo ${slideIndex + 1} of ${count}${
                slide.label ? `: ${slide.label}` : ""
              }`}
              aria-current={slideIndex === index ? "true" : undefined}
              onClick={() => goTo(slideIndex)}
            >
              <span
                className={cn(
                  "block h-1.5 w-1.5 transition-all",
                  slideIndex === index
                    ? editorial
                      ? "w-5 bg-blush"
                      : "w-5 bg-forest"
                    : editorial
                      ? "bg-ivory/40 hover:bg-ivory/65"
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
