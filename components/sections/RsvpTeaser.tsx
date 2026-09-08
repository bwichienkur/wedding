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
    >
      <div className="invite-rsvp-card mx-auto max-w-md rounded-md bg-white px-6 py-8 shadow-[0_12px_40px_rgba(26,48,80,0.12)] sm:px-8 sm:py-10">
        <p
          className={cn(
            "mb-6 text-center text-sm text-invite-body/80",
            wedding.rsvp.deadlineIsPlaceholder && "placeholder-copy italic",
          )}
        >
          {wedding.rsvp.deadlineLabel}
        </p>
        <div className="flex justify-center">
          <ButtonLink href="/rsvp" variant="gold" size="lg">
            Begin RSVP
          </ButtonLink>
        </div>
      </div>
    </Section>
  );
}
