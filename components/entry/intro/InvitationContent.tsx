"use client";

import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";

interface InvitationContentProps {
  hidden?: boolean;
}

export function InvitationContent({ hidden }: InvitationContentProps) {
  return (
    <div
      className={cn(
        "intro-invite-copy pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 text-center",
        "transition-opacity duration-700",
        hidden && "opacity-0",
      )}
    >
      <p className="intro-invite-preamble font-display italic text-[#e8c872]">
        {wedding.entry.invitePreamble}
      </p>
      <p className="intro-invite-names font-display italic text-[#f0d98a]">
        {wedding.entry.inviteNames}
      </p>
      <p className="intro-invite-subline font-sans uppercase tracking-[0.22em] text-[#d4b65c]">
        {wedding.entry.inviteSubline}
      </p>
    </div>
  );
}
