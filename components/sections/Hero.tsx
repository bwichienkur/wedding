"use client";

import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { MonogramSvg } from "@/components/monogram/MonogramSvg";
import { rsvpNav } from "@/data/navigation";
import { wedding, weddingLocationLine } from "@/data/wedding";
import { cn } from "@/lib/cn";
import { useWeddingCountdown } from "@/lib/useWeddingCountdown";

/**
 * Zola-inspired homepage: full-bleed rotating photos + clear brand and CTAs.
 */
export function Hero() {
  const countdown = useWeddingCountdown();

  return (
    <section
      id="home"
      className="relative flex min-h-[88svh] items-end overflow-hidden bg-parchment sm:min-h-[92svh]"
      aria-labelledby="hero-title"
    >
      <HeroCarousel />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:flex-row lg:items-end lg:justify-between lg:px-10 lg:pb-24">
        <div className="max-w-xl">
          <MonogramSvg
            className="mb-5 h-14 w-14 text-gold sm:mb-6 sm:h-16 sm:w-16"
            decorative
          />
          <p className="mb-3 font-sans text-xs uppercase tracking-[0.28em] text-gold">
            {wedding.wedding.dateDisplay}
          </p>
          <h1
            id="hero-title"
            className="font-display text-balance text-5xl leading-[1.05] text-forest sm:text-6xl md:text-7xl"
          >
            {wedding.couple.displayName}
          </h1>
          <p className="mt-3 font-sans text-base tracking-wide text-charcoal sm:text-lg">
            {weddingLocationLine()}
          </p>
          <p
            className={cn(
              "mt-5 max-w-md text-base leading-relaxed text-ink-muted",
              wedding.hero.statementIsPlaceholder && "placeholder-copy",
            )}
          >
            {wedding.hero.statement}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href={rsvpNav.href} variant="gold" size="lg">
              {wedding.entry.rsvpLabel}
            </ButtonLink>
            <ButtonLink href="#wedding-day" variant="secondary" size="lg">
              Wedding details
            </ButtonLink>
            <ButtonLink href="#story" variant="ghost" size="lg">
              Our story
            </ButtonLink>
          </div>

          {wedding.featureFlags.countdown && countdown ? (
            <p
              className="mt-7 font-sans text-xs uppercase tracking-[0.18em] text-ink-muted"
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
      </div>
    </section>
  );
}
