"use client";

import { IntroNavigation, weddingDetailsHref } from "@/components/entry/intro/IntroNavigation";
import { INTRO_CSS_VARS, INTRO_TIMING } from "@/components/entry/intro/constants";
import type { IntroPhase } from "@/components/entry/intro/types";
import { useVideoIntroPhase } from "@/components/entry/intro/useVideoIntroPhase";
import { VideoOpeningIntro } from "@/components/entry/intro/VideoOpeningIntro";
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
  /** Fired when the opening video ends and the homepage should begin fading in */
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
 * Wooowinvites-style opening card + tap-to-play opening video, then fade to site.
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
  const videoRef = useRef<HTMLVideoElement>(null);

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

  const playOpeningVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => {
      startReveal();
      setPhase("opening");
      window.setTimeout(() => finish(), INTRO_TIMING.exit);
    });
  }, [finish, startReveal]);

  const { activate, skip, onVideoEnded } = useVideoIntroPhase({
    phase,
    setPhase,
    reduceMotion: Boolean(reduceMotion),
    onRevealStart: startReveal,
    onComplete: finish,
    onPlayVideo: playOpeningVideo,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleEnded = () => onVideoEnded();
    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [onVideoEnded, isClient]);

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
    return (
      <div
        className="fixed inset-0 z-50 bg-[#ebe0d0]"
        aria-hidden
      />
    );
  }

  const exiting = phase === "opened" || phase === "skipped";
  const opening = phase === "opening";
  const showThrough = opening || exiting;

  return (
    <div
      className={[
        "intro-overlay video-opening-overlay fixed inset-0 z-50 overflow-hidden",
        "transition-[opacity,background-color] duration-[480ms] ease-out",
        showThrough ? "bg-transparent" : "",
        exiting ? "pointer-events-none opacity-0" : "opacity-100",
        opening ? "pointer-events-none" : "",
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
          "--intro-monogram-delay": INTRO_CSS_VARS.monogramDelay,
        } as CSSProperties
      }
    >
      <h1 id="entry-title" className="sr-only">
        {wedding.couple.displayName} wedding invitation
      </h1>

      <VideoOpeningIntro
        phase={phase}
        reduceMotion={Boolean(reduceMotion)}
        onActivate={activate}
        videoRef={videoRef}
      />

      <IntroNavigation
        phase={phase}
        onSkip={skipToDetails}
        onRsvp={handleRsvp}
      />
    </div>
  );
}
