import { ButtonLink } from "@/components/ui/ButtonLink";
import { wedding } from "@/data/wedding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RSVP",
  description: `RSVP for ${wedding.couple.displayName}’s wedding on ${wedding.wedding.dateDisplay}.`,
  robots: { index: false, follow: false },
};

export default function RsvpPage() {
  return (
    <main className="mx-auto flex min-h-[100svh] max-w-lg flex-col justify-center px-5 py-16">
      <p className="font-sans text-xs uppercase tracking-[0.22em] text-gold">
        RSVP
      </p>
      <h1 className="mt-3 font-display text-4xl text-forest">
        {wedding.couple.displayName}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-ink-muted">
        The secure multi-step RSVP experience arrives in Phase 6. This page
        reserves the route and keeps guests oriented.
      </p>
      <p
        className={
          wedding.rsvp.deadlineIsPlaceholder
            ? "placeholder-copy mt-6 text-sm text-ink-muted"
            : "mt-6 text-sm text-ink-muted"
        }
      >
        {wedding.rsvp.deadlineLabel}
      </p>
      <div className="mt-10">
        <ButtonLink href="/#rsvp" variant="secondary">
          Return to the invitation
        </ButtonLink>
      </div>
    </main>
  );
}
