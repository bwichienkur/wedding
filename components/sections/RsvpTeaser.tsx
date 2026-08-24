import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";

/** Public RSVP teaser — full secure flow arrives in Phase 6. */
export function RsvpSection() {
  return (
    <Section
      id="rsvp"
      eyebrow="RSVP"
      title="We hope you’ll be there"
      description="A secure household RSVP experience is next. This keeps the invitation action visible and ready."
      className="bg-sage/20"
    >
      <p
        className={cn(
          "mb-6 text-sm text-ink-muted",
          wedding.rsvp.deadlineIsPlaceholder && "placeholder-copy",
        )}
      >
        {wedding.rsvp.deadlineLabel}
      </p>
      <ButtonLink href="/rsvp" variant="gold" size="lg">
        Begin RSVP
      </ButtonLink>
    </Section>
  );
}
