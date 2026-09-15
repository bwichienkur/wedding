import { Section } from "@/components/ui/Section";
import type { WeddingPartyMember } from "@/data/logistics-types";
import { cn } from "@/lib/cn";

function PartyPerson({ member }: { member: WeddingPartyMember }) {
  return (
    <article className="flex flex-col items-center px-4 py-7 text-center sm:px-6 sm:py-8">
      <div className="invite-party-photo mx-auto size-24 overflow-hidden rounded-full border border-[rgb(201_162_77/0.45)] bg-[#e8dcc8] shadow-[0_8px_24px_rgb(74_48_32/0.12)] sm:size-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={member.photoSrc ?? "/images/placeholders/party-portrait.svg"}
          alt={member.photoAlt ?? `${member.name} portrait`}
          className={cn(
            "h-full w-full",
            member.id === "zach-bragg" ? "object-cover object-[center_22%]" : "object-cover",
          )}
        />
      </div>
      <h4 className="mt-4 font-display text-sm uppercase tracking-[0.12em] text-invite-navy sm:text-base">
        {member.name}
      </h4>
      <p className="mt-1.5 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-invite-body/70">
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
    <div className="min-w-0">
      <h3 className="mb-2 pb-4 text-center font-display text-lg text-invite-navy sm:text-xl">
        {label}
      </h3>
      <ul>
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
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-10 md:gap-14">
          <PartyColumn label="Groomsmen" people={groomsmen} />
          <PartyColumn label="Bridesmaids" people={bridesmaids} />
        </div>

        {shared.length > 0 ? (
          <div className="mt-12 border-t border-transparent pt-4 sm:mt-14">
            <h3 className="mb-2 pb-4 text-center font-display text-lg text-invite-navy sm:text-xl">
              Ceremony
            </h3>
            <ul className="mx-auto grid max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3">
              {shared.map((member) => (
                <li key={member.id}>
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
