"use client";

import { HeroCarousel } from "@/components/sections/HeroCarousel";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { HeroSlide } from "@/data/hero-slides";
import { rsvpNav } from "@/data/navigation";
import { wedding, weddingLocationLine } from "@/data/wedding";
import { cn } from "@/lib/cn";
import {
  fadeUpSmallVariants,
  heroItemTransition,
  heroStaggerVariants,
} from "@/lib/motion";
import { useWeddingCountdown } from "@/lib/useWeddingCountdown";
import { motion, useReducedMotion } from "motion/react";

/**
 * Editorial hero — parallax photo, staggered typography, scroll cue.
 */
export function Hero({ slides }: { slides: HeroSlide[] }) {
  const countdown = useWeddingCountdown();
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] items-end overflow-hidden bg-forest"
      aria-labelledby="hero-title"
    >
      <HeroCarousel
        editorial
        slides={slides}
        indicatorsClassName={
          wedding.featureFlags.countdown
            ? "bottom-44 sm:bottom-28"
            : undefined
        }
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-5 pb-36 pt-32 sm:px-8 sm:pb-28 sm:pt-36 lg:px-10">
        <motion.div
          className="max-w-3xl text-center sm:text-left"
          variants={heroStaggerVariants}
          initial={reduceMotion ? "visible" : "hidden"}
          animate="visible"
        >
          <motion.p
            variants={fadeUpSmallVariants}
            transition={heroItemTransition}
            className="mb-5 font-sans text-xs uppercase tracking-[0.32em] text-blush"
          >
            Together with their families
          </motion.p>

          <motion.h1
            id="hero-title"
            variants={fadeUpSmallVariants}
            transition={heroItemTransition}
            className="font-display text-balance text-5xl font-medium leading-[1.05] text-ivory sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            <span className="block">{wedding.couple.partnerOne}</span>
            <span className="my-1 block font-display text-4xl font-normal text-blush sm:text-5xl">
              &
            </span>
            <span className="block">{wedding.couple.partnerTwo}</span>
          </motion.h1>

          <motion.div
            variants={fadeUpSmallVariants}
            transition={heroItemTransition}
            className="mx-auto mt-7 h-px w-16 bg-blush/80 sm:mx-0"
            aria-hidden
          />

          <motion.p
            variants={fadeUpSmallVariants}
            transition={heroItemTransition}
            className="mt-7 font-sans text-xs uppercase tracking-[0.28em] text-ivory/85"
          >
            {wedding.wedding.dateDisplay}
          </motion.p>

          <motion.p
            variants={fadeUpSmallVariants}
            transition={heroItemTransition}
            className="mt-3 font-sans text-sm tracking-wide text-ivory/75 sm:text-base"
          >
            {weddingLocationLine()}
          </motion.p>

          <motion.p
            variants={fadeUpSmallVariants}
            transition={heroItemTransition}
            className={cn(
              "mx-auto mt-6 max-w-md text-base leading-relaxed text-ivory/70 sm:mx-0",
              wedding.hero.statementIsPlaceholder &&
                "border-l border-blush/50 pl-4 italic",
            )}
          >
            {wedding.hero.statement}
          </motion.p>

          <motion.div
            variants={fadeUpSmallVariants}
            transition={heroItemTransition}
            className="mt-9 flex flex-wrap items-center justify-center gap-3 sm:justify-start"
          >
            <ButtonLink href={rsvpNav.href} variant="gold" size="lg">
              {wedding.entry.rsvpLabel}
            </ButtonLink>
            <ButtonLink
              href="#wedding-day"
              variant="secondary"
              size="lg"
              className="border-ivory/35 text-ivory hover:border-blush"
            >
              Wedding details
            </ButtonLink>
          </motion.div>

          {wedding.featureFlags.countdown && countdown ? (
            <motion.div
              variants={fadeUpSmallVariants}
              transition={heroItemTransition}
              className="mt-10 flex flex-wrap justify-center gap-6 sm:justify-start"
              aria-live="polite"
            >
              {countdown.isPast ? (
                <p className="font-sans text-xs uppercase tracking-[0.2em] text-ivory/65">
                  With love from our wedding day
                </p>
              ) : (
                <>
                  <CountdownCell value={countdown.days} label="Days" />
                  <CountdownCell value={countdown.hours} label="Hours" />
                  <CountdownCell value={countdown.minutes} label="Minutes" />
                </>
              )}
            </motion.div>
          ) : null}
        </motion.div>
      </div>

      <a
        href="#story"
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-ivory/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blush"
      >
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.28em]">
          Scroll
        </span>
        <span
          className={cn(
            "block h-10 w-px bg-gradient-to-b from-blush to-transparent",
            !reduceMotion && "scroll-bob",
          )}
          aria-hidden
        />
      </a>
    </section>
  );
}

function CountdownCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[4.5rem] text-center sm:text-left">
      <p className="font-display text-3xl text-ivory sm:text-4xl">{value}</p>
      <p className="mt-1 font-sans text-[0.65rem] uppercase tracking-[0.22em] text-ivory/55">
        {label}
      </p>
    </div>
  );
}
