import { Section } from "@/components/ui/Section";
import type { WeddingPartyMember } from "@/data/logistics-types";
import { cn } from "@/lib/cn";

const SIDE_ORDER: Array<WeddingPartyMember["side"]> = [
  "lexi",
  "bright",
  "shared",
];

const SIDE_LABELS: Record<WeddingPartyMember["side"], string> = {
  lexi: "Lexi’s bridesmaids",
  bright: "Bright’s groomsmen",
  shared: "Standing with us",
};

export function PartySection({
  members,
  eyebrow = "Wedding party",
  title = "Standing beside us",
  description = "Five bridesmaids, five groomsmen, our ceremony pianist, and the people celebrating with us. Edit each person from the admin.",
}: {
  members: WeddingPartyMember[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  const groups = SIDE_ORDER.map((side) => ({
    side,
    label: SIDE_LABELS[side],
    people: members.filter((member) => member.side === side),
  })).filter((group) => group.people.length > 0);

  return (
    <Section
      id="party"
      eyebrow={eyebrow}
      title={title}
      description={description}
    >
      <div className="space-y-20">
        {groups.map((group) => (
          <div key={group.side}>
            <h3 className="font-display text-2xl text-forest md:text-3xl">
              {group.label}
            </h3>
            <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {group.people.map((member) => (
                <article key={member.id} className="flex flex-col">
                  <div className="aspect-[4/5] overflow-hidden bg-parchment">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        member.photoSrc ??
                        "/images/placeholders/party-portrait.svg"
                      }
                      alt={member.photoAlt ?? `${member.name} portrait`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-4 font-sans text-xs uppercase tracking-[0.18em] text-gold">
                    {member.role}
                  </p>
                  <h4 className="mt-2 font-display text-2xl text-forest">
                    {member.name}
                  </h4>
                  <p
                    className={cn(
                      "mt-2 text-sm text-ink-muted",
                      member.relationshipIsPlaceholder && "placeholder-copy",
                    )}
                  >
                    {member.relationship}
                  </p>
                  <p
                    className={cn(
                      "mt-3 text-base leading-relaxed text-charcoal",
                      member.descriptionIsPlaceholder && "placeholder-copy",
                    )}
                  >
                    {member.description}
                  </p>
                  {member.funFact ? (
                    <p
                      className={cn(
                        "mt-3 font-annotation text-lg text-ink-muted",
                        member.funFactIsPlaceholder && "placeholder-copy",
                      )}
                    >
                      {member.funFact}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
