import { Section } from "@/components/ui/Section";
import { weddingParty } from "@/data/party";
import { cn } from "@/lib/cn";

export function PartySection() {
  return (
    <Section
      id="party"
      eyebrow="Wedding party"
      title="Standing beside us"
      description="An editorial introduction to the people celebrating with Bright and Lexi. Names and photographs remain placeholders until supplied."
    >
      <div className="space-y-16">
        {weddingParty.map((member, index) => {
          const reverse = index % 2 === 1;
          return (
            <article
              key={member.id}
              className={cn(
                "grid items-center gap-8 md:grid-cols-12",
                reverse && "md:[&>*:first-child]:order-2",
              )}
            >
              <div className="md:col-span-5">
                <div className="aspect-[4/5] overflow-hidden bg-parchment">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.photoSrc ?? "/images/placeholders/party-portrait.svg"}
                    alt={member.photoAlt ?? `${member.name} portrait`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="md:col-span-7 md:px-4">
                <p className="font-sans text-xs uppercase tracking-[0.18em] text-gold">
                  {member.role} · {member.side}
                </p>
                <h3 className="mt-3 font-display text-3xl text-forest">
                  {member.name}
                </h3>
                <p
                  className={cn(
                    "mt-3 text-sm text-ink-muted",
                    member.relationshipIsPlaceholder && "placeholder-copy",
                  )}
                >
                  {member.relationship}
                </p>
                <p
                  className={cn(
                    "mt-4 max-w-prose text-base leading-relaxed text-charcoal",
                    member.descriptionIsPlaceholder && "placeholder-copy",
                  )}
                >
                  {member.description}
                </p>
                {member.funFact ? (
                  <p
                    className={cn(
                      "mt-4 font-annotation text-lg text-ink-muted",
                      member.funFactIsPlaceholder && "placeholder-copy",
                    )}
                  >
                    {member.funFact}
                  </p>
                ) : null}
                {member.sharedMemory ? (
                  <p className="placeholder-copy mt-3 text-sm text-ink-muted">
                    {member.sharedMemory}
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
