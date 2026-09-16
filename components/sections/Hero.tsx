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

/** Invitation-card hero — wooowinvites-style script names on cream scroll. */
export function Hero({ slides }: { slides: HeroSlide[] }) {
  const countdown = useWeddingCountdown();
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="home"
      className="relative overflow-hidden px-6 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32"
      aria-labelledby="hero-title"
    >
      <motion.div
        className="mx-auto max-w-lg text-center"
        variants={heroStaggerVariants}
        initial={reduceMotion ? "visible" : "hidden"}
        animate="visible"
      >
        <motion.div
          variants={fadeUpSmallVariants}
          transition={heroItemTransition}
          className="invite-ornament mb-6"
          aria-hidden
        />

        <motion.p
          variants={fadeUpSmallVariants}
          transition={heroItemTransition}
          className="font-sans text-[0.65rem] uppercase tracking-[0.34em] text-gold"
        >
          Our love story continues
        </motion.p>

        <motion.h1
          id="hero-title"
          variants={fadeUpSmallVariants}
          transition={heroItemTransition}
          className="invite-script-heading mt-4 text-balance"
        >
          {wedding.couple.partnerOne}
          <span className="invite-script-amp">&</span>
          {wedding.couple.partnerTwo}
        </motion.h1>

        <motion.p
          variants={fadeUpSmallVariants}
          transition={heroItemTransition}
          className="mt-5 font-display text-sm uppercase tracking-[0.22em] text-invite-navy/80 sm:text-base"
        >
          {wedding.wedding.dateDisplay}
        </motion.p>

        <motion.p
          variants={fadeUpSmallVariants}
          transition={heroItemTransition}
          className="mt-2 font-sans text-sm italic text-invite-body/80"
        >
          {weddingLocationLine()}
        </motion.p>

        <motion.div
          variants={fadeUpSmallVariants}
          transition={heroItemTransition}
          className="invite-photo-frame mx-auto mt-10 aspect-[3/4] w-full max-w-md"
        >
          <HeroCarousel
            framed
            slides={slides}
            indicatorsClassName="bottom-3"
          />
        </motion.div>

        <motion.p
          variants={fadeUpSmallVariants}
          transition={heroItemTransition}
          className={cn(
            "mx-auto mt-8 max-w-sm text-base leading-relaxed text-invite-body/85",
            wedding.hero.statementIsPlaceholder && "italic opacity-80",
          )}
        >
          {wedding.hero.statement}
        </motion.p>

        {wedding.featureFlags.countdown && countdown ? (
          <motion.div
            variants={fadeUpSmallVariants}
            transition={heroItemTransition}
            className="mt-10"
            aria-live="polite"
          >
            <p className="invite-script-subheading mb-4">Countdown</p>
            {countdown.isPast ? (
              <p className="font-sans text-sm italic text-invite-body/75">
                With love from our wedding day
              </p>
            ) : (
              <div className="flex flex-wrap justify-center gap-8">
                <CountdownCell value={countdown.days} label="Days" />
                <CountdownCell value={countdown.hours} label="Hours" />
                <CountdownCell value={countdown.minutes} label="Minutes" />
                <CountdownCell
                  value={countdown.seconds}
                  label="Seconds"
                  pad
                />
              </div>
            )}
          </motion.div>
        ) : null}

        <motion.div
          variants={fadeUpSmallVariants}
          transition={heroItemTransition}
          className="mt-10 flex flex-wrap justify-center gap-3"
        >
          <ButtonLink href={rsvpNav.href} variant="gold" size="lg">
            {wedding.entry.rsvpLabel}
          </ButtonLink>
          <ButtonLink
            href="#wedding-day"
            variant="secondary"
            size="lg"
            className="invite-outline-button"
          >
            Wedding details
          </ButtonLink>
        </motion.div>
      </motion.div>

      <a
        href="#story"
        className="invite-scroll-cue mx-auto mt-14 flex flex-col items-center gap-2 text-invite-body/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      >
        <span className="font-sans text-[0.62rem] uppercase tracking-[0.28em]">
          Scroll
        </span>
        <span
          className={cn(
            "invite-scroll-arrow",
            !reduceMotion && "scroll-bob",
          )}
          aria-hidden
        />
      </a>
    </section>
  );
}

function CountdownCell({
  value,
  label,
  pad = false,
}: {
  value: number;
  label: string;
  pad?: boolean;
}) {
  const display = pad ? String(value).padStart(2, "0") : String(value);
  return (
    <div className="min-w-[4rem] text-center">
      <p className="font-display text-4xl tabular-nums text-invite-navy sm:text-5xl">
        {display}
      </p>
      <p className="mt-1 font-sans text-[0.62rem] uppercase tracking-[0.24em] text-invite-body/60">
        {label}
      </p>
    </div>
  );
}
