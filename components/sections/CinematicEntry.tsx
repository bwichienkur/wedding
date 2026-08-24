"use client";

import { InvitationEnvelope } from "@/components/entry/InvitationEnvelope";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { rsvpNav, weddingDetailsHref } from "@/data/navigation";
import { wedding } from "@/data/wedding";
import {
  isIntroForceSkipped,
  markIntroSeen,
} from "@/lib/intro-storage";
import { useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

interface CinematicEntryProps {
  onComplete: () => void;
}

/** Embossed florals slowly light to gold before flaps open. */
const GLOW_MS = 950;
const OPEN_MS = 1100;
const EXIT_MS = 500;

function subscribeNoop() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribeNoop, () => true, () => false);
}

function useForceSkipIntro() {
  return useSyncExternalStore(
    subscribeNoop,
    () => isIntroForceSkipped(),
    () => false,
  );
}

/**
 * Full-bleed sealed invitation. Stays closed until the wax seal is clicked.
 * Sequence: illuminate patterns → open flaps → fade into the site.
 */
export function CinematicEntry({ onComplete }: CinematicEntryProps) {
  const reduceMotion = useReducedMotion();
  const isClient = useIsClient();
  const forceSkip = useForceSkipIntro();
  const [dismissed, setDismissed] = useState(false);
  const [opening, setOpening] = useState(false);
  const [glowing, setGlowing] = useState(false);
  const [exiting, setExiting] = useState(false);
  const finishTimer = useRef<number | null>(null);
  const openedRef = useRef(false);
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishTimer.current != null) {
      window.clearTimeout(finishTimer.current);
      finishTimer.current = null;
    }
    markIntroSeen();
    setDismissed(true);
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [onComplete]);

  useEffect(() => {
    return () => {
      if (finishTimer.current != null) {
        window.clearTimeout(finishTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (!wedding.featureFlags.cinematicEntry || forceSkip) {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }
  }, [isClient, forceSkip, onComplete]);

  function openInvitation() {
    if (openedRef.current || opening || dismissed || exiting) return;
    openedRef.current = true;

    if (reduceMotion) {
      finish();
      return;
    }

    // 1) Patterns illuminate
    setGlowing(true);
    finishTimer.current = window.setTimeout(() => {
      // 2) Flaps open
      setOpening(true);
      finishTimer.current = window.setTimeout(() => {
        // 3) Cover fades away
        setExiting(true);
        finishTimer.current = window.setTimeout(() => {
          finish();
        }, EXIT_MS);
      }, OPEN_MS);
    }, GLOW_MS);
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

  if (!wedding.featureFlags.cinematicEntry || forceSkip || dismissed) {
    return null;
  }

  if (!isClient) {
    return <div className="fixed inset-0 z-50 bg-[#3a1e22]" aria-hidden />;
  }

  return (
    <div
      className={[
        "fixed inset-0 z-50 overflow-hidden bg-[#3a1e22]",
        "transition-opacity duration-500 ease-out",
        exiting ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-title"
      data-intro="sealed"
    >
      <h1 id="entry-title" className="sr-only">
        {wedding.couple.displayName} wedding invitation
      </h1>

      <InvitationEnvelope
        open={opening}
        glowing={glowing}
        reduceMotion={Boolean(reduceMotion)}
        onOpen={openInvitation}
      />

      <div
        className={[
          "absolute inset-x-0 bottom-4 z-40 flex flex-wrap items-center justify-center gap-2 px-5",
          "transition-opacity duration-300",
          glowing || opening || exiting ? "pointer-events-none opacity-0" : "opacity-100",
        ].join(" ")}
      >
        <Button
          type="button"
          variant="ghost"
          onClick={skipToDetails}
          className="text-[#e8d5c4]/80 hover:text-[#f3ebe2]"
        >
          {wedding.entry.skipDetailsLabel}
        </Button>
        <ButtonLink
          href={rsvpNav.href}
          variant="ghost"
          onClick={finish}
          className="text-[#e8d5c4]/80 hover:text-[#f3ebe2]"
        >
          {wedding.entry.rsvpLabel}
        </ButtonLink>
      </div>
    </div>
  );
}
