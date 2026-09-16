"use client";

import { Section } from "@/components/ui/Section";
import type { StoryMilestone } from "@/data/types";
import { cn } from "@/lib/cn";

function CondensedMilestone({ milestone }: { milestone: StoryMilestone }) {
  const sharedPassage =
    milestone.passages.find((p) => p.perspective === "shared") ??
    milestone.passages[0];

  return (
    <article
      id={`story-${milestone.id}`}
      className="invite-story-card invite-glass-card overflow-hidden rounded-sm"
    >
      {milestone.image?.src ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-[#e8dcc8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={milestone.image.src}
            alt={milestone.image.alt ?? ""}
            className="h-full w-full object-cover"
            style={
              milestone.image.focalPoint
                ? {
                    objectPosition: `${milestone.image.focalPoint.x}% ${milestone.image.focalPoint.y}%`,
                  }
                : undefined
            }
          />
          {milestone.image.placeholder ? (
            <p className="absolute inset-x-0 bottom-0 bg-[rgb(7_14_26/0.85)] px-4 py-2 text-center text-xs text-invite-body-soft/90">
              {milestone.image.caption ?? "Photograph coming soon."}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-invite-gold">
          {milestone.dateLabel}
        </p>
        <h3 className="mt-2 font-display text-2xl text-invite-gold-bright sm:text-[1.65rem]">
          {milestone.title}
        </h3>
        {milestone.locationLabel ? (
          <p
            className={cn(
              "mt-1 text-sm italic text-invite-body-soft/80",
              milestone.locationLabel.startsWith("Add ") && "placeholder-copy",
            )}
          >
            {milestone.locationLabel}
          </p>
        ) : null}
        {sharedPassage ? (
          <p
            className={cn(
              "mt-4 text-sm leading-relaxed text-invite-body-soft/95 sm:text-base",
              sharedPassage.isPlaceholder && "placeholder-copy italic",
            )}
          >
            {sharedPassage.body}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function OurStory({
  milestones,
  eyebrow = "Our story",
  title = "How we got here",
  description,
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
      description={description?.trim() ? description : undefined}
    >
      <ol className="mt-2 grid gap-6">
        {milestones.map((milestone) => (
          <li key={milestone.id}>
            <CondensedMilestone milestone={milestone} />
          </li>
        ))}
      </ol>
    </Section>
  );
}
