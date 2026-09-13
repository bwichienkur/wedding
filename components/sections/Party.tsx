import { Section } from "@/components/ui/Section";
import type { WeddingPartyMember } from "@/data/logistics-types";

function PartyPerson({ member }: { member: WeddingPartyMember }) {
  return (
    <article className="flex flex-col items-center px-3 py-5 text-center sm:px-4 sm:py-6">
      <div className="size-20 overflow-hidden rounded-full bg-[#e8dcc8] sm:size-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={member.photoSrc ?? "/images/placeholders/party-portrait.svg"}
          alt={member.photoAlt ?? `${member.name} portrait`}
          className="h-full w-full object-cover"
        />
      </div>
      <h4 className="mt-3 font-display text-sm uppercase tracking-[0.12em] text-invite-navy sm:text-base">
        {member.name}
      </h4>
      <p className="mt-1 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-invite-body/70">
        {member.role}
      </p>
      {member.description && !member.descriptionIsPlaceholder ? (
        <p className="mt-2 max-w-[16rem] text-sm leading-snug text-invite-body/85">
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
      <h3 className="pb-3 text-center font-display text-lg text-invite-navy sm:text-xl">
        {label}
      </h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {people.map((member) => (
          <li key={member.id}>
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
      <div className="mx-auto max-w-3xl space-y-10">
        <div className="grid gap-10 md:grid-cols-2">
          <PartyColumn label="Groomsmen" people={groomsmen} />
          <PartyColumn label="Bridesmaids" people={bridesmaids} />
        </div>

        {shared.length > 0 ? (
          <div>
            <h3 className="pb-3 text-center font-display text-lg text-invite-navy sm:text-xl">
              Ceremony
            </h3>
            <ul className="mx-auto flex max-w-md flex-wrap justify-center gap-2">
              {shared.map((member) => (
                <li key={member.id} className="min-w-[10rem] flex-1">
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
