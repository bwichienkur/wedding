"use client";

import { useCallback, useEffect, useRef } from "react";
import { INTRO_TIMING } from "./constants";
import type { IntroPhase } from "./types";

interface UseVideoIntroPhaseOptions {
  phase: IntroPhase;
  setPhase: (phase: IntroPhase) => void;
  reduceMotion: boolean;
  onRevealStart: () => void;
  onComplete: () => void;
  onPlayVideo: () => void;
}

/** Intro state machine for tap-to-play opening video (replaces envelope peel). */
export function useVideoIntroPhase({
  phase,
  setPhase,
  reduceMotion,
  onRevealStart,
  onComplete,
  onPlayVideo,
}: UseVideoIntroPhaseOptions) {
  const timers = useRef<number[]>([]);
  const activatedRef = useRef(false);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const scrollToSiteTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    setPhase("opened");
    scrollToSiteTop();
    schedule(() => onComplete(), INTRO_TIMING.exit);
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
      setPhase("activating");
      schedule(() => {
        setPhase("glowing");
        onPlayVideo();
      }, 200);
      return;
    }

    setPhase("activating");
    schedule(() => {
      setPhase("glowing");
      onPlayVideo();
    }, 400);
  }, [
    onComplete,
    onPlayVideo,
    onRevealStart,
    phase,
    reduceMotion,
    schedule,
    scrollToSiteTop,
    setPhase,
  ]);

  const onVideoEnded = useCallback(() => {
    const current = phaseRef.current;
    if (
      activatedRef.current &&
      current !== "opened" &&
      current !== "skipped"
    ) {
      onRevealStart();
      setPhase("opening");
      schedule(() => finish(), INTRO_TIMING.open);
    }
  }, [finish, onRevealStart, schedule, setPhase]);

  return { activate, skip, onVideoEnded };
}
