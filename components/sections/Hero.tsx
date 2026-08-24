"use client";

import { GoldenThread } from "@/components/story/GoldenThread";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { MonogramSvg } from "@/components/monogram/MonogramSvg";
import { rsvpNav } from "@/data/navigation";
import { wedding, weddingLocationLine } from "@/data/wedding";
import { cn } from "@/lib/cn";
import { useWeddingCountdown } from "@/lib/useWeddingCountdown";
import dynamic from "next/dynamic";

const MonogramExperience = dynamic(
  () =>
    import("@/components/three/MonogramExperience").then(
      (mod) => mod.MonogramExperience,
    ),
  { ssr: false },
);

export function Hero() {
  const countdown = useWeddingCountdown();
  const useDimensionalMonogram = wedding.featureFlags.threeMonogram;

  return (
    <section
      id="home"
      className="relative flex min-h-[85svh] items-end overflow-hidden bg-parchment sm:min-h-[100svh]"
      aria-labelledby="hero-title"
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,#c9d0c2_0%,transparent_55%),linear-gradient(160deg,#e8e1d4_0%,#d7cfc0_45%,#b7c0ae_100%)]"
          aria-hidden
        />
        <div className="grain absolute inset-0 opacity-40" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-t from-ivory via-ivory/55 to-transparent"
          aria-hidden
        />
        <GoldenThread
          chapter="hero"
          className="absolute inset-x-0 top-[22%] h-28 w-full opacity-50 sm:top-[18%] sm:h-36 sm:opacity-55"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 pb-14 pt-24 sm:px-8 sm:pb-20 sm:pt-28 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div className="max-w-xl">
          <p className="mb-4 font-sans text-xs uppercase tracking-[0.28em] text-gold">
            {wedding.wedding.dateDisplay}
          </p>
          <h1
            id="hero-title"
            className="font-display text-balance text-5xl leading-[1.05] text-forest sm:text-6xl md:text-7xl"
          >
            {wedding.couple.displayName}
          </h1>
          <p className="mt-4 font-sans text-base tracking-wide text-charcoal sm:text-lg">
            {weddingLocationLine()}
          </p>
          <p
            className={cn(
              "mt-6 max-w-md text-base leading-relaxed text-ink-muted",
              wedding.hero.statementIsPlaceholder && "placeholder-copy",
            )}
          >
            {wedding.hero.statement}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href={rsvpNav.href} variant="gold" size="lg">
              {wedding.entry.rsvpLabel}
            </ButtonLink>
            <ButtonLink href="#story" variant="secondary" size="lg">
              Our story
            </ButtonLink>
          </div>

          {wedding.featureFlags.countdown && countdown ? (
            <p
              className="mt-8 font-sans text-xs uppercase tracking-[0.18em] text-ink-muted"
              aria-live="polite"
            >
              {countdown.isPast ? (
                <span>With love from our wedding day</span>
              ) : (
                <span>
                  {countdown.days} days · {countdown.hours} hrs ·{" "}
                  {countdown.minutes} min
                </span>
              )}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-6 lg:items-end">
          {useDimensionalMonogram ? (
            <MonogramExperience showDate={false} />
          ) : (
            <MonogramSvg className="h-28 w-28 sm:h-32 sm:w-32" />
          )}
          <a
            href="#story"
            className="group inline-flex min-h-11 items-center gap-3 font-sans text-xs uppercase tracking-[0.2em] text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Scroll
            <span
              aria-hidden
              className="block h-8 w-px origin-top bg-gold transition-transform group-hover:scale-y-125"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
