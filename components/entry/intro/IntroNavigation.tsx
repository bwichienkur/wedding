"use client";

import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { rsvpNav, weddingDetailsHref } from "@/data/navigation";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";
import type { IntroPhase } from "./types";

interface IntroNavigationProps {
  phase: IntroPhase;
  onSkip: () => void;
  onRsvp: () => void;
}

export function IntroNavigation({ phase, onSkip, onRsvp }: IntroNavigationProps) {
  const hidden =
    phase !== "closed";

  return (
    <nav
      className={cn(
        "intro-bottom-nav absolute inset-x-0 bottom-0 z-40",
        "transition-opacity duration-500",
        hidden ? "pointer-events-none opacity-0" : "opacity-100",
      )}
      aria-label="Invitation shortcuts"
    >
      <div className="intro-bottom-nav-inner">
        <Button
          type="button"
          variant="ghost"
          onClick={onSkip}
          className="intro-nav-link"
        >
          {wedding.entry.skipDetailsLabel}
        </Button>
        <span className="intro-nav-divider" aria-hidden />
        <ButtonLink
          href={rsvpNav.href}
          variant="ghost"
          onClick={onRsvp}
          className="intro-nav-link"
        >
          {wedding.entry.rsvpLabel}
        </ButtonLink>
      </div>
    </nav>
  );
}

export { weddingDetailsHref };
