"use client";

import { rsvpNav } from "@/data/navigation";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "motion/react";

/** Persistent wooowinvites-style scroll cue toward RSVP */
export function ScrollToRsvpFab({ visible }: { visible: boolean }) {
  const reduceMotion = useReducedMotion();

  if (!visible) return null;

  return (
    <a
      href={rsvpNav.href}
      className={cn(
        "invite-scroll-fab fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2",
        "text-invite-navy/80 transition-opacity hover:text-invite-navy",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-invite-gold",
      )}
    >
      <span className="font-sans text-[0.58rem] uppercase tracking-[0.28em]">
        Scroll to RSVP
      </span>
      <span
        className={cn("invite-scroll-arrow", !reduceMotion && "scroll-bob")}
        aria-hidden
      />
    </a>
  );
}
