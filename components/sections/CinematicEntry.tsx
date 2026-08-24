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

const OPEN_MS = 1100;

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
 * Sealed invitation cover. Stays closed until the guest explicitly opens the
 * wax seal (or uses Skip / RSVP). Does not auto-dismiss from prior visits —
 * each full page load shows the sealed envelope again.
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

    setGlowing(true);
    setOpening(true);
    finishTimer.current = window.setTimeout(() => {
      setExiting(true);
      finishTimer.current = window.setTimeout(() => {
        finish();
      }, 450);
    }, OPEN_MS);
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

  // Opaque cover before client hydration so the hero never flashes underneath.
  if (!isClient) {
    return <div className="fixed inset-0 z-50 bg-[#f3ebe2]" aria-hidden />;
  }

  return (
    <div
      className={[
        "fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#f3ebe2]",
        "transition-opacity duration-500 ease-out",
        exiting ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-title"
      data-intro="sealed"
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
    </div>
  );
}
