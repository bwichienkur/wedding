"use client";

import { MonogramSvg } from "@/components/monogram/MonogramSvg";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { rsvpNav, weddingDetailsHref } from "@/data/navigation";
import { wedding, weddingLocationLine } from "@/data/wedding";
import { hasSeenIntro, markIntroSeen } from "@/lib/intro-storage";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useSyncExternalStore, useState } from "react";

interface CinematicEntryProps {
  onComplete: () => void;
}

function subscribeIdentity() {
  return () => {};
}

/** True only after client hydration — used to read localStorage safely. */
function useIsClient() {
  return useSyncExternalStore(
    subscribeIdentity,
    () => true,
    () => false,
  );
}

export function CinematicEntry({ onComplete }: CinematicEntryProps) {
  const reduceMotion = useReducedMotion();
  const isClient = useIsClient();
  const [dismissed, setDismissed] = useState(false);

  const introAlreadySeen = isClient && hasSeenIntro();
  const shouldShow =
    wedding.featureFlags.cinematicEntry &&
    !dismissed &&
    (!isClient || !introAlreadySeen);

  useEffect(() => {
    if (!isClient) return;
    if (!wedding.featureFlags.cinematicEntry || introAlreadySeen || dismissed) {
      onComplete();
    }
  }, [isClient, introAlreadySeen, dismissed, onComplete]);

  function dismiss() {
    markIntroSeen();
    setDismissed(true);
  }

  function beginStory() {
    dismiss();
    window.requestAnimationFrame(() => {
      document.querySelector("#story")?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  function skipToDetails() {
    dismiss();
    window.requestAnimationFrame(() => {
      document.querySelector(weddingDetailsHref)?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  return (
    <AnimatePresence>
      {shouldShow ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ivory"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="entry-title"
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
            <div className="grain absolute inset-0" />
          </div>

          <svg
            className="pointer-events-none absolute inset-x-0 top-1/3 h-40 w-full text-gold"
            viewBox="0 0 800 160"
            aria-hidden
          >
            <motion.path
              d="M40 90 C160 40, 280 130, 400 80 S640 30, 760 90"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              initial={
                reduceMotion
                  ? { pathLength: 1, opacity: 0.7 }
                  : { pathLength: 0, opacity: 0.4 }
              }
              animate={{ pathLength: 1, opacity: 0.85 }}
              transition={{
                duration: reduceMotion ? 0 : 2.2,
                ease: "easeInOut",
              }}
            />
          </svg>

          <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col items-center px-6 text-center">
            <MonogramSvg className="mb-8 h-24 w-24" />
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.28em] text-gold">
              {wedding.wedding.dateDisplay}
            </p>
            <h1
              id="entry-title"
              className="font-display text-4xl text-forest sm:text-5xl"
            >
              {wedding.couple.displayName}
            </h1>
            <p className="mt-4 font-sans text-sm tracking-wide text-ink-muted">
              {weddingLocationLine()}
            </p>

            <div className="mt-10 flex w-full flex-col gap-3 sm:max-w-xs">
              <Button variant="gold" size="lg" onClick={beginStory}>
                {wedding.entry.beginLabel}
              </Button>
              <Button variant="secondary" size="lg" onClick={skipToDetails}>
                {wedding.entry.skipDetailsLabel}
              </Button>
              <ButtonLink
                href={rsvpNav.href}
                variant="ghost"
                size="lg"
                onClick={dismiss}
              >
                {wedding.entry.rsvpLabel}
              </ButtonLink>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
