"use client";

import { IntroNavigation, weddingDetailsHref } from "@/components/entry/intro/IntroNavigation";
import { WeddingEnvelopeIntro } from "@/components/entry/intro/WeddingEnvelopeIntro";
import { INTRO_CSS_VARS } from "@/components/entry/intro/constants";
import type { IntroPhase } from "@/components/entry/intro/types";
import { useIntroPhase } from "@/components/entry/intro/useIntroPhase";
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
  type CSSProperties,
} from "react";

interface CinematicEntryProps {
  onComplete: () => void;
  /** Fired when the seal is opened and the homepage should begin fading in */
  onRevealStart?: () => void;
}

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
 * Full-bleed navy envelope + gold seal. Opens onto a slowly fading homepage.
 */
export function CinematicEntry({
  onComplete,
  onRevealStart,
}: CinematicEntryProps) {
  const reduceMotion = useReducedMotion();
  const isClient = useIsClient();
  const forceSkip = useForceSkipIntro();
  const [phase, setPhase] = useState<IntroPhase>("closed");
  const [removed, setRemoved] = useState(false);
  const completedRef = useRef(false);
  const revealedRef = useRef(false);

  const startReveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    onRevealStart?.();
  }, [onRevealStart]);

  const finish = useCallback(() => {
    markIntroSeen();
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
    setRemoved(true);
  }, [onComplete]);

  const { activate, skip } = useIntroPhase({
    phase,
    setPhase,
    reduceMotion: Boolean(reduceMotion),
    onRevealStart: startReveal,
    onComplete: finish,
  });

  useEffect(() => {
    if (!isClient) return;
    if (!wedding.featureFlags.cinematicEntry || forceSkip) {
      startReveal();
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }
  }, [isClient, forceSkip, onComplete, startReveal]);

  function skipToDetails() {
    skip();
    setRemoved(true);
    window.requestAnimationFrame(() => {
      document.querySelector(weddingDetailsHref)?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  function handleRsvp() {
    skip();
    setRemoved(true);
  }

  if (!wedding.featureFlags.cinematicEntry || forceSkip || removed) {
    return null;
  }

  if (!isClient) {
    return <div className="fixed inset-0 z-50 bg-[#0a1220]" aria-hidden />;
  }

  const exiting = phase === "opened" || phase === "skipped";
  const openingOrExit = phase === "opening" || exiting;

  return (
    <div
      className={[
        "intro-overlay fixed inset-0 z-50 overflow-hidden",
        "transition-[opacity,background-color] duration-[450ms] ease-out",
        openingOrExit ? "bg-transparent" : "bg-[#070e1a]",
        openingOrExit ? "pointer-events-none opacity-0" : "opacity-100",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="entry-title"
      data-intro="sealed"
      style={
        {
          "--intro-activating": INTRO_CSS_VARS.activating,
          "--intro-glow": INTRO_CSS_VARS.glow,
          "--intro-open": INTRO_CSS_VARS.open,
          "--intro-exit": INTRO_CSS_VARS.exit,
        } as CSSProperties
      }
    >
      <h1 id="entry-title" className="sr-only">
        {wedding.couple.displayName} wedding invitation
      </h1>

      <WeddingEnvelopeIntro
        phase={phase}
        reduceMotion={Boolean(reduceMotion)}
        onActivate={activate}
      />

      <IntroNavigation
        phase={phase}
        onSkip={skipToDetails}
        onRsvp={handleRsvp}
      />
    </div>
  );
}
