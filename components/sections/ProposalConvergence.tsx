"use client";

import { GoldenThread } from "@/components/story/GoldenThread";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";
import { useExperienceCapabilities } from "@/lib/three/useExperienceCapabilities";
import dynamic from "next/dynamic";
import { useId, useState } from "react";

const ConvergenceCanvas = dynamic(
  () =>
    import("@/components/three/ConvergenceCanvas").then(
      (mod) => mod.ConvergenceCanvas,
    ),
  {
    ssr: false,
    loading: () => <ConvergenceSvgFallback progress={1} />,
  },
);

function ConvergenceSvgFallback({ progress }: { progress: number }) {
  return (
    <div className="relative mx-auto flex h-64 max-w-3xl items-center justify-center sm:h-80">
      <GoldenThread
        chapter="proposal"
        split={progress < 0.7}
        progress={progress}
        className="h-full w-full"
      />
      <div
        className="absolute right-[12%] top-1/2 h-28 w-44 -translate-y-1/2 border border-gold/70 bg-parchment/90 sm:h-36 sm:w-56"
        aria-hidden
      />
    </div>
  );
}

export function ProposalConvergenceSection() {
  const capabilities = useExperienceCapabilities();
  const [forceSimple, setForceSimple] = useState(false);
  const headingId = useId();

  const use3d =
    capabilities.webgl && !capabilities.simplified && !forceSimple;

  return (
    <Section
      id="proposal"
      contained
      className="bg-ivory"
      aria-labelledby={headingId}
    >
      <header className="mb-10 max-w-2xl md:mb-14">
        <p className="mb-3 font-sans text-xs uppercase tracking-[0.22em] text-gold">
          Proposal
        </p>
        <h2
          id={headingId}
          className="font-display text-balance text-3xl text-forest sm:text-4xl md:text-5xl"
        >
          {wedding.proposal.transitionCopy}
        </h2>
        <p
          className={cn(
            "mt-4 text-base text-ink-muted",
            wedding.proposal.dateIsPlaceholder && "placeholder-copy",
          )}
        >
          {wedding.proposal.dateLabel}
        </p>
        <p
          className={cn(
            "mt-2 text-base text-ink-muted",
            wedding.proposal.locationIsPlaceholder && "placeholder-copy",
          )}
        >
          {wedding.proposal.locationLabel}
        </p>
      </header>

      <div className="mb-4">
        <button
          type="button"
          className="min-h-11 rounded-sm border border-stone px-3 font-sans text-xs uppercase tracking-[0.14em] text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          onClick={() => setForceSimple((value) => !value)}
          aria-pressed={!use3d}
        >
          {use3d ? "Use simplified transition" : "Simplified transition on"}
        </button>
      </div>

      {use3d ? <ConvergenceCanvas /> : <ConvergenceSvgFallback progress={1} />}

      <div className="mx-auto mt-10 max-w-md text-center">
        <div className="mx-auto aspect-video w-full max-w-sm border border-gold/40 bg-parchment">
          <p className="flex h-full items-center justify-center px-6 font-sans text-sm text-ink-muted">
            Proposal poster coming soon
          </p>
        </div>
        <p className="placeholder-copy mx-auto mt-6 max-w-prose text-left text-base text-ink-muted">
          Add a short introduction to the proposal chapter.
        </p>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:items-center">
          <Button type="button" variant="gold" size="lg" disabled>
            Watch our proposal
          </Button>
          <p className="text-xs text-ink-muted">
            Film playback arrives in Phase 4 · never autoplays with sound
          </p>
          <ButtonLink href="#wedding-day" variant="secondary" size="md">
            Continue our story
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
