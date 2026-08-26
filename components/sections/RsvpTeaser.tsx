import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";

export function RsvpSection({
  eyebrow = "RSVP",
  title = "We hope you’ll be there",
  description = "Find your invitation by name or code, then respond for everyone in your household.",
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
} = {}) {
  return (
    <Section
      id="rsvp"
      eyebrow={eyebrow}
      title={title}
      description={description}
      className="bg-sage/20"
    >
      <p
        className={cn(
          "mb-6 text-sm text-ivory/70",
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
