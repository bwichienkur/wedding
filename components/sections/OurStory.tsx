"use client";

import { ScrollScrubbedThread } from "@/components/story/GoldenThread";
import { Section } from "@/components/ui/Section";
import { wedding } from "@/data/wedding";
import type { Perspective, StoryMilestone } from "@/data/types";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "motion/react";
import { useState } from "react";

const perspectiveLabels: Record<Perspective, string> = {
  bright: `${wedding.couple.partnerOne}’s version`,
  lexi: `${wedding.couple.partnerTwo}’s version`,
  shared: "Shared",
  actual: "What actually happened",
};

function MilestoneCard({
  milestone,
  index,
}: {
  milestone: StoryMilestone;
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  const available: Perspective[] = milestone.perspectivesEnabled
    ? (["bright", "lexi", "actual"] as const).filter((p) =>
        milestone.passages.some((passage) => passage.perspective === p),
      )
    : [];

  const defaultPerspective: Perspective = milestone.perspectivesEnabled
    ? available[0] ?? "shared"
    : "shared";

  const [perspective, setPerspective] =
    useState<Perspective>(defaultPerspective);

  const activePassages = milestone.passages.filter((passage) =>
    milestone.perspectivesEnabled
      ? passage.perspective === perspective
      : passage.perspective === "shared" || passage.perspective === perspective,
  );

  const reverse = index % 2 === 1;

  return (
    <article
      id={`story-${milestone.id}`}
      className={cn(
        "grid items-center gap-6 border-t border-stone/70 py-10 md:grid-cols-12 md:gap-10 md:py-20",
        reverse && "md:[&>*:first-child]:order-2",
      )}
    >
      <div className="md:col-span-5">
        <div className="relative aspect-[3/2] overflow-hidden bg-parchment editorial-frame md:aspect-[3/4]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={milestone.image?.src}
            alt={milestone.image?.alt ?? ""}
            width={milestone.image?.width}
            height={milestone.image?.height}
            className="h-full w-full object-cover"
            style={
              milestone.image?.focalPoint
                ? {
                    objectPosition: `${milestone.image.focalPoint.x}% ${milestone.image.focalPoint.y}%`,
                  }
                : undefined
            }
          />
          {milestone.image?.placeholder ? (
            <p className="absolute bottom-3 left-3 right-3 bg-parchment/90 px-3 py-2 font-sans text-xs text-ivory/70">
              {milestone.image.caption ?? "Photograph coming soon."}
            </p>
          ) : null}
        </div>
      </div>

      <div className="md:col-span-7 md:px-4">
        <p className="font-sans text-xs uppercase tracking-[0.22em] text-gold">
          {milestone.dateLabel}
        </p>
        {milestone.locationLabel ? (
          <p
            className={cn(
              "mt-2 font-sans text-sm text-ivory/70",
              milestone.locationLabel.startsWith("Add ") && "placeholder-copy",
            )}
          >
            {milestone.locationLabel}
          </p>
        ) : null}
        <h3 className="mt-4 font-display text-3xl text-gold sm:text-4xl">
          {milestone.title}
        </h3>

        {milestone.perspectivesEnabled && available.length > 0 ? (
          <div
            role="tablist"
            aria-label="Story perspectives"
            className="mt-6 flex flex-wrap gap-2"
          >
            {available.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={perspective === option}
                className={cn(
                  "min-h-11 rounded-sm border px-3 py-2 font-sans text-xs uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                  perspective === option
                    ? "border-gold bg-gold/10 text-gold"
                    : "border-gold/40 text-ivory/70 hover:border-gold hover:text-ivory",
                )}
                onClick={() => setPerspective(option)}
              >
                {perspectiveLabels[option]}
              </button>
            ))}
          </div>
        ) : null}

        <div
          className={cn(
            "mt-6 space-y-4",
            !reduceMotion && "transition-opacity duration-300",
          )}
        >
          {activePassages.map((passage, passageIndex) => (
            <div key={`${passage.perspective}-${passageIndex}`}>
              {passage.title ? (
                <p className="mb-2 font-display text-xl text-gold-soft">
                  {passage.title}
                </p>
              ) : null}
              <p
                className={cn(
                  "max-w-prose text-base leading-relaxed text-ivory/80 sm:text-lg",
                  passage.isPlaceholder && "placeholder-copy",
                )}
              >
                {passage.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export function OurStory({
  milestones,
  eyebrow = "Our story",
  title = "Two paths, drawn together",
  description = "A living timeline of Bright and Lexi. Confirmed moments are marked; everything else waits for your words and photographs.",
}: {
  milestones: StoryMilestone[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  return (
    <Section
      id="story"
      eyebrow={eyebrow}
      title={title}
      description={description}
      className="bg-parchment/80"
    >
      <div className="relative">
        {/* Mobile: single left-rail filament */}
        <ScrollScrubbedThread className="pointer-events-none absolute left-1 top-0 w-5 sm:left-2 sm:w-6 md:hidden" />
        {/* Desktop: split paths meeting through the story */}
        <ScrollScrubbedThread
          split
          className="pointer-events-none absolute left-1/2 top-0 hidden w-10 -translate-x-1/2 md:block"
        />

        <div className="relative pl-7 sm:pl-9 md:pl-0">
          {milestones.map((milestone, index) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              index={index}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
