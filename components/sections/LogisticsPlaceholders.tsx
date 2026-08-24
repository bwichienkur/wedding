import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import { MonogramSvg } from "@/components/monogram/MonogramSvg";
import { GoldenThread } from "@/components/story/GoldenThread";
import { rsvpNav } from "@/data/navigation";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";

/** Phase 2 logistics scaffolds — content filled in Phase 5. */
export function WeddingDaySection() {
  return (
    <Section
      id="wedding-day"
      eyebrow="Wedding day"
      title={wedding.wedding.dateDisplay}
      description="The golden thread becomes a route toward Bella Cosa. Full schedule details arrive next."
      className="bg-parchment/60"
    >
      <div className="relative mb-10">
        <GoldenThread chapter="wedding" className="h-24 w-full opacity-80" />
      </div>
      <ol className="space-y-6 border-l border-gold/50 pl-6">
        <li>
          <p className="font-sans text-xs uppercase tracking-[0.18em] text-gold">
            {wedding.wedding.ceremonyBegins}
          </p>
          <p className="mt-1 font-display text-2xl text-forest">Ceremony</p>
        </li>
        <li>
          <p className="font-sans text-xs uppercase tracking-[0.18em] text-gold">
            Time coming soon
          </p>
          <p className="mt-1 font-display text-2xl text-forest">
            {wedding.wedding.dinnerStyle}
          </p>
          <p className="placeholder-copy mt-2 text-sm text-ink-muted">
            Details coming soon
          </p>
        </li>
        {wedding.wedding.receptionNotes.map((note) => (
          <li key={note}>
            <p className="font-sans text-xs uppercase tracking-[0.18em] text-gold">
              Time coming soon
            </p>
            <p className="mt-1 font-display text-2xl text-forest">{note}</p>
            <p className="placeholder-copy mt-2 text-sm text-ink-muted">
              Details coming soon
            </p>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-sm text-ink-muted">
        Venue access begins {wedding.wedding.accessBegins}. Photography and
        videography begin {wedding.wedding.photographyBegins}.
      </p>
    </Section>
  );
}

export function VenueSection() {
  return (
    <Section
      id="venue"
      eyebrow="Venue"
      title={wedding.wedding.venueName}
      description={`${wedding.wedding.city}, ${wedding.wedding.region}`}
    >
      <p className="placeholder-copy max-w-prose text-base text-ink-muted">
        Add the street address, parking instructions, accessibility details,
        and approved venue photography.
      </p>
    </Section>
  );
}

export function TravelSection() {
  return (
    <Section
      id="travel"
      eyebrow="Travel"
      title="Travel & accommodations"
      description="Airports, hotels, and local notes — confirmed details only."
      className="bg-parchment/50"
    >
      <p className="placeholder-copy max-w-prose text-base text-ink-muted">
        Add hotel information, booking links, group codes, and recommended
        airports.
      </p>
    </Section>
  );
}

export function PartySection() {
  return (
    <Section
      id="party"
      eyebrow="Wedding party"
      title="Standing beside us"
      description="An editorial introduction to the people celebrating with Bright and Lexi."
    >
      <p className="placeholder-copy max-w-prose text-base text-ink-muted">
        Add wedding party names, roles, and photographs.
      </p>
    </Section>
  );
}

export function RsvpSection() {
  return (
    <Section
      id="rsvp"
      eyebrow="RSVP"
      title="We hope you’ll be there"
      description="A secure, multi-step RSVP arrives in a later phase. For now, this anchor keeps the invitation action visible."
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

export function FaqSection() {
  return (
    <Section
      id="faq"
      eyebrow="FAQ"
      title="A few helpful answers"
      description="Dress code, arrival, parking, and more — with clearly labeled placeholders until confirmed."
    >
      <p className="placeholder-copy max-w-prose text-base text-ink-muted">
        Add dress-code guidance and other guest questions.
      </p>
    </Section>
  );
}

export function RegistrySection() {
  return (
    <Section
      id="registry"
      eyebrow="Registry"
      title="Gifts"
      description="Your presence is the greatest gift — registry links remain understated."
      className="bg-parchment/40"
    >
      <p className="placeholder-copy max-w-prose text-base text-ink-muted">
        Add registry destination links and an optional note from Bright and
        Lexi.
      </p>
    </Section>
  );
}

export function ClosingSection() {
  return (
    <section
      id="closing"
      className="relative overflow-hidden bg-forest px-5 py-24 text-ivory sm:px-8"
      aria-labelledby="closing-title"
    >
      <div className="grain absolute inset-0 opacity-20" aria-hidden />
      <GoldenThread
        chapter="closing"
        className="pointer-events-none absolute inset-x-0 top-10 h-32 w-full text-gold-soft opacity-50"
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <MonogramSvg className="mx-auto mb-8 h-20 w-20 text-gold-soft" />
        <p
          id="closing-title"
          className={cn(
            "font-display text-2xl sm:text-3xl",
            wedding.closing.messageIsPlaceholder && "opacity-80",
          )}
        >
          {wedding.closing.message}
        </p>
        <p className="mt-8 font-display text-4xl">{wedding.couple.displayName}</p>
        <p className="mt-3 font-sans text-sm uppercase tracking-[0.22em] text-gold-soft">
          {wedding.wedding.dateDisplay}
        </p>
        <p className="mt-2 text-sm text-ivory/80">
          {wedding.wedding.venueName} · {wedding.wedding.city},{" "}
          {wedding.wedding.region}
        </p>
        <div className="mt-10 flex justify-center">
          <ButtonLink href={rsvpNav.href} variant="gold" size="lg">
            {wedding.entry.rsvpLabel}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
