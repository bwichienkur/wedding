"use client";

import { InvitationEnvelope } from "@/components/entry/InvitationEnvelope";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { rsvpNav, weddingDetailsHref } from "@/data/navigation";
import { wedding } from "@/data/wedding";
import { hasSeenIntro, markIntroSeen } from "@/lib/intro-storage";
import { editorialEase } from "@/lib/motion";
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
  const [opening, setOpening] = useState(false);
  const [glowing, setGlowing] = useState(false);

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

  function finish() {
    markIntroSeen();
    setDismissed(true);
  }

  function openInvitation() {
    if (opening || dismissed) return;

    if (reduceMotion) {
      finish();
      return;
    }

    setGlowing(true);
    setOpening(true);
    window.setTimeout(() => {
      finish();
    }, 1250);
  }

  function skipToDetails() {
    finish();
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
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#f3ebe2]"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: reduceMotion ? 1 : 1.04,
          }}
          transition={{
            duration: reduceMotion ? 0 : 0.55,
            ease: editorialEase,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="entry-title"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            aria-hidden
          >
            <div className="grain absolute inset-0" />
          </div>

          <h1 id="entry-title" className="sr-only">
            {wedding.couple.displayName} wedding invitation
          </h1>

          <InvitationEnvelope
            open={opening}
            glowing={glowing}
            reduceMotion={Boolean(reduceMotion)}
            onOpen={openInvitation}
          />

          <div className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-2 px-5">
            <Button
              type="button"
              variant="ghost"
              onClick={skipToDetails}
              className="text-[#6b605a]"
            >
              {wedding.entry.skipDetailsLabel}
            </Button>
            <ButtonLink
              href={rsvpNav.href}
              variant="ghost"
              onClick={finish}
              className="text-[#6b605a]"
            >
              {wedding.entry.rsvpLabel}
            </ButtonLink>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
