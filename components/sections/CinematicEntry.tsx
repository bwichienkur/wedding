"use client";

import { InvitationEnvelope } from "@/components/entry/InvitationEnvelope";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { rsvpNav, weddingDetailsHref } from "@/data/navigation";
import { wedding } from "@/data/wedding";
import { hasSeenIntro, markIntroSeen } from "@/lib/intro-storage";
import { useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  useState,
} from "react";

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

const OPEN_MS = 1100;

export function CinematicEntry({ onComplete }: CinematicEntryProps) {
  const reduceMotion = useReducedMotion();
  const isClient = useIsClient();
  const [dismissed, setDismissed] = useState(false);
  const [opening, setOpening] = useState(false);
  const [glowing, setGlowing] = useState(false);
  const [exiting, setExiting] = useState(false);
  const finishTimer = useRef<number | null>(null);
  const openedRef = useRef(false);

  const introAlreadySeen = isClient && hasSeenIntro();
  const shouldShow =
    wedding.featureFlags.cinematicEntry &&
    !dismissed &&
    (!isClient || !introAlreadySeen);

  const finish = useCallback(() => {
    if (finishTimer.current != null) {
      window.clearTimeout(finishTimer.current);
      finishTimer.current = null;
    }
    markIntroSeen();
    setDismissed(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (!wedding.featureFlags.cinematicEntry || introAlreadySeen || dismissed) {
      onComplete();
    }
  }, [isClient, introAlreadySeen, dismissed, onComplete]);

  useEffect(() => {
    return () => {
      if (finishTimer.current != null) {
        window.clearTimeout(finishTimer.current);
      }
    };
  }, []);

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
      }, 400);
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

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className={cnEntry(exiting, Boolean(reduceMotion))}
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
    </div>
  );
}

function cnEntry(exiting: boolean, reduceMotion: boolean) {
  return [
    "fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#f3ebe2]",
    "transition-opacity duration-500 ease-out",
    exiting && !reduceMotion ? "pointer-events-none opacity-0" : "opacity-100",
    exiting && reduceMotion ? "opacity-0" : null,
  ]
    .filter(Boolean)
    .join(" ");
}
