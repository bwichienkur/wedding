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
      className="invite-rsvp-section"
    >
      <div className="invite-rsvp-card invite-glass-card mx-auto max-w-md">
        <p
          className={cn(
            "font-display text-lg text-invite-navy sm:text-xl",
            wedding.rsvp.deadlineIsPlaceholder && "placeholder-copy italic",
          )}
        >
          {wedding.rsvp.deadlineLabel}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-invite-body/85">
          {description?.trim() ||
            "Find your invitation by name or code, then respond for everyone in your household."}
        </p>
        <div className="mt-7 flex justify-center">
          <ButtonLink href="/rsvp" variant="gold" size="lg">
            Begin RSVP
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
