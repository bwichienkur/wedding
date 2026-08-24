"use client";

import { cn } from "@/lib/cn";
import { EnvelopeFlap } from "./EnvelopeFlap";
import { InvitationCard } from "./InvitationCard";
import { InvitationContent } from "./InvitationContent";
import { WaxSealButton } from "./WaxSealButton";
import type { IntroPhase } from "./types";
import { isIlluminatedPhase, isOpeningPhase, isSealVisiblePhase } from "./types";

interface EnvelopeProps {
  phase: IntroPhase;
  reduceMotion: boolean;
  onActivate: () => void;
}

export function Envelope({ phase, reduceMotion, onActivate }: EnvelopeProps) {
  const opening = isOpeningPhase(phase);
  const illuminated = isIlluminatedPhase(phase);
  const sealVisible = isSealVisiblePhase(phase);

  return (
    <div
      className={cn(
        "intro-envelope-stage",
        illuminated && "is-illuminated",
        opening && !reduceMotion && "intro-envelope-opening",
      )}
    >
      <div
        className={cn(
          "envelope-shell intro-envelope relative h-full w-full overflow-hidden",
          opening && !reduceMotion && "envelope-shell-open",
        )}
        style={
          reduceMotion
            ? undefined
            : { perspective: 1800, transformStyle: "preserve-3d" }
        }
      >
        <div className="envelope-interior absolute inset-0" aria-hidden />
        <div className="envelope-liner absolute inset-0" aria-hidden />

        <EnvelopeFlap side="bottom" phase={phase} reduceMotion={reduceMotion} />
        <EnvelopeFlap side="left" phase={phase} reduceMotion={reduceMotion} />
        <EnvelopeFlap side="right" phase={phase} reduceMotion={reduceMotion} />
        <EnvelopeFlap side="top" phase={phase} reduceMotion={reduceMotion} />

        <InvitationContent
          hidden={illuminated || opening}
        />

        <InvitationCard visible={opening && !reduceMotion} />

        <WaxSealButton
          phase={phase}
          reduceMotion={reduceMotion}
          onActivate={onActivate}
          visible={sealVisible || phase === "opening"}
        />
      </div>
    </div>
  );
}
