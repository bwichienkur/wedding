"use client";

import { useCallback, useEffect, useRef } from "react";
import { INTRO_TIMING } from "./constants";
import type { IntroPhase } from "./types";

interface UseIntroPhaseOptions {
  phase: IntroPhase;
  setPhase: (phase: IntroPhase) => void;
  reduceMotion: boolean;
  onRevealStart: () => void;
  onComplete: () => void;
}

/**
 * Drives the intro state machine with guarded transitions and centralized timers.
 */
export function useIntroPhase({
  phase,
  setPhase,
  reduceMotion,
  onRevealStart,
  onComplete,
}: UseIntroPhaseOptions) {
  const timers = useRef<number[]>([]);
  const activatedRef = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const scrollToSiteTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.querySelector("#home")?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    setPhase("opened");
    scrollToSiteTop();
    // Brief beat so the peel can settle, then unmount the overlay
    schedule(() => {
      onComplete();
    }, INTRO_TIMING.exit);
  }, [clearTimers, onComplete, schedule, scrollToSiteTop, setPhase]);

  const skip = useCallback(() => {
    if (phase === "opened" || phase === "skipped") return;
    clearTimers();
    activatedRef.current = true;
    onRevealStart();
    setPhase("skipped");
    onComplete();
  }, [clearTimers, onComplete, onRevealStart, phase, setPhase]);

  const activate = useCallback(() => {
    if (activatedRef.current || phase !== "closed") return;
    activatedRef.current = true;

    if (reduceMotion) {
      onRevealStart();
      setPhase("skipped");
      scrollToSiteTop();
      onComplete();
      return;
    }

    setPhase("activating");
    onRevealStart();

    schedule(() => setPhase("glowing"), INTRO_TIMING.activating);

    schedule(() => {
      setPhase("opening");
    }, INTRO_TIMING.activating + INTRO_TIMING.glow);

    schedule(() => {
      finish();
    }, INTRO_TIMING.activating + INTRO_TIMING.glow + INTRO_TIMING.open);
  }, [
    finish,
    onComplete,
    onRevealStart,
    phase,
    reduceMotion,
    schedule,
    scrollToSiteTop,
    setPhase,
  ]);

  return { activate, skip };
}
