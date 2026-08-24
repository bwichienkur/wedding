"use client";

import { Envelope } from "./Envelope";
import type { IntroPhase } from "./types";

interface WeddingEnvelopeIntroProps {
  phase: IntroPhase;
  reduceMotion: boolean;
  onActivate: () => void;
}

/** Full-viewport luxury navy envelope with layered flaps, emboss, and seal */
export function WeddingEnvelopeIntro({
  phase,
  reduceMotion,
  onActivate,
}: WeddingEnvelopeIntroProps) {
  return (
    <div className="intro-envelope-viewport">
      <Envelope
        phase={phase}
        reduceMotion={reduceMotion}
        onActivate={onActivate}
      />
    </div>
  );
}
