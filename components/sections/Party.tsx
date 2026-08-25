import { Section } from "@/components/ui/Section";
import type { WeddingPartyMember } from "@/data/logistics-types";
import { cn } from "@/lib/cn";

function PartyPerson({ member }: { member: WeddingPartyMember }) {
  return (
    <article className="flex flex-col items-center px-3 py-5 text-center sm:px-4 sm:py-6">
      <div className="size-20 overflow-hidden rounded-full bg-parchment sm:size-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={member.photoSrc ?? "/images/placeholders/party-portrait.svg"}
          alt={member.photoAlt ?? `${member.name} portrait`}
          className="h-full w-full object-cover"
        />
      </div>
      <h4 className="mt-3 font-display text-sm uppercase tracking-[0.12em] text-forest sm:text-base">
        {member.name}
      </h4>
      <p className="mt-1 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-ink-muted">
        {member.role}
      </p>
      {member.description && !member.descriptionIsPlaceholder ? (
        <p className="mt-2 max-w-[16rem] text-sm leading-snug text-charcoal">
          {member.description}
        </p>
      ) : null}
    </article>
  );
}

function PartyColumn({
  label,
  people,
}: {
  label: string;
  people: WeddingPartyMember[];
}) {
  return (
    <div>
      <h3 className="border-b border-stone/50 pb-3 text-center font-display text-lg text-forest sm:text-xl">
        {label}
      </h3>
      <ul>
        {people.map((member, index) => (
          <li
            key={member.id}
            className={cn(
              index < people.length - 1 && "border-b border-stone/40",
            )}
          >
            <PartyPerson member={member} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PartySection({
  members,
  eyebrow = "Wedding party",
  title = "Standing beside us",
  description = "Bright’s groomsmen, Lexi’s bridesmaids, and the people celebrating with us.",
}: {
  members: WeddingPartyMember[];
  eyebrow?: string;
  title?: string;
  description?: string;
}) {
  const groomsmen = members.filter((member) => member.side === "bright");
  const bridesmaids = members.filter((member) => member.side === "lexi");
  const shared = members.filter((member) => member.side === "shared");

  return (
    <Section
      id="party"
      eyebrow={eyebrow}
      title={title}
      description={description}
    >
      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-2 divide-x divide-stone/40 border border-stone/40">
          <PartyColumn label="Groomsmen" people={groomsmen} />
          <PartyColumn label="Bridesmaids" people={bridesmaids} />
        </div>

        {shared.length > 0 ? (
          <div className="mt-10">
            <h3 className="border-b border-stone/50 pb-3 text-center font-display text-lg text-forest sm:text-xl">
              Standing with us
            </h3>
            <ul className="mx-auto grid max-w-2xl grid-cols-1 sm:grid-cols-3">
              {shared.map((member, index) => (
                <li
                  key={member.id}
                  className={cn(
                    "border-b border-stone/40 sm:border-b-0",
                    index < shared.length - 1 &&
                      "sm:border-r sm:border-stone/40",
                  )}
                >
                  <PartyPerson member={member} />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </Section>
  );
}
