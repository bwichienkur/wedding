"use client";

import { Section } from "@/components/ui/Section";
import { ProposalFilmExperience } from "@/components/video/ProposalFilmExperience";
import type { StoryImage } from "@/data/types";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "motion/react";
import { useId } from "react";

/**
 * Two hairline paths weaving into one — ink/embroidery, not CGI tubing.
 */
function ProposalThreadConvergence({ still }: { still?: StoryImage | null }) {
  const reduceMotion = useReducedMotion();
  const gradientId = useId().replace(/:/g, "");

  return (
    <div className="relative mx-auto w-full max-w-3xl px-2">
      {still?.src ? (
        <div className="mb-6 overflow-hidden border border-gold/35 bg-parchment">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={still.src}
            alt={still.alt || "Proposal photograph"}
            width={still.width}
            height={still.height}
            className="aspect-[16/10] w-full object-cover"
            style={
              still.focalPoint
                ? {
                    objectPosition: `${still.focalPoint.x}% ${still.focalPoint.y}%`,
                  }
                : undefined
            }
          />
        </div>
      ) : null}
      <svg
        viewBox="0 0 720 220"
        preserveAspectRatio="xMidYMid meet"
        className="h-48 w-full text-gold sm:h-56"
        role="img"
        aria-label="Two golden threads weaving into one"
      >
        <title>Two golden threads weaving into one</title>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
            <stop offset="45%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Bright’s path */}
        <path
          d="M28 48 C150 58, 240 40, 330 92 C390 124, 450 112, 510 104"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.2"
          strokeLinecap="round"
          vectorEffect="nonScalingStroke"
          pathLength={1}
          style={
            reduceMotion
              ? undefined
              : { strokeDasharray: 1, strokeDashoffset: 0 }
          }
        >
          {reduceMotion ? null : (
            <animate
              attributeName="stroke-dashoffset"
              from="1"
              to="0"
              dur="1.6s"
              fill="freeze"
              calcMode="spline"
              keySplines="0.4 0 0.2 1"
            />
          )}
        </path>

        {/* Lexi’s path */}
        <path
          d="M28 172 C150 162, 240 178, 330 118 C390 84, 450 96, 510 104"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.2"
          strokeLinecap="round"
          vectorEffect="nonScalingStroke"
          pathLength={1}
          style={
            reduceMotion
              ? undefined
              : { strokeDasharray: 1, strokeDashoffset: 0 }
          }
        >
          {reduceMotion ? null : (
            <animate
              attributeName="stroke-dashoffset"
              from="1"
              to="0"
              dur="1.6s"
              begin="0.15s"
              fill="freeze"
              calcMode="spline"
              keySplines="0.4 0 0.2 1"
            />
          )}
        </path>

        {/* United filament */}
        <path
          d="M510 104 C560 98, 600 108, 648 104"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.35"
          strokeLinecap="round"
          vectorEffect="nonScalingStroke"
          pathLength={1}
        />

        {/* Soft meeting node — embroidery knot, not a metal ball */}
        <circle
          cx="510"
          cy="104"
          r="2.25"
          fill="currentColor"
          opacity="0.85"
        />

        {/* Quiet photo frame — line, not a floating 3D slab */}
        <rect
          x="560"
          y="58"
          width="120"
          height="92"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.9"
          opacity="0.55"
          vectorEffect="nonScalingStroke"
        />
        <rect
          x="568"
          y="66"
          width="104"
          height="76"
          fill="currentColor"
          opacity="0.06"
        />
      </svg>
      <p className="mt-3 text-center font-sans text-xs text-ink-muted">
        {still?.src
          ? "Two paths become one"
          : "Proposal photograph coming soon"}
      </p>
    </div>
  );
}

export function ProposalConvergenceSection({
  still,
}: {
  still?: StoryImage | null;
}) {
  const headingId = useId();

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

      <ProposalThreadConvergence still={still} />
      <ProposalFilmExperience />
    </Section>
  );
}
