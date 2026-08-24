"use client";

import { cn } from "@/lib/cn";

interface InvitationCardProps {
  visible: boolean;
}

/** Ivory card rising from inside the envelope during open */
export function InvitationCard({ visible }: InvitationCardProps) {
  return (
    <div
      className={cn(
        "intro-invitation-card pointer-events-none absolute left-1/2 z-[5] -translate-x-1/2",
        visible && "is-rising",
      )}
      aria-hidden
    >
      <div className="intro-invitation-card-inner" />
    </div>
  );
}
