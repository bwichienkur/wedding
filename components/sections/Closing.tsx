import { MonogramSvg } from "@/components/monogram/MonogramSvg";
import { GoldenThread } from "@/components/story/GoldenThread";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { rsvpNav } from "@/data/navigation";
import type { StoryImage } from "@/data/types";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";

export function ClosingSection({ image }: { image?: StoryImage | null }) {
  return (
    <section
      id="closing"
      className="relative overflow-hidden border-t border-invite-gold/15 px-6 py-20 sm:px-8 sm:py-24"
      aria-labelledby="closing-title"
    >
      {image?.src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20"
            style={
              image.focalPoint
                ? {
                    objectPosition: `${image.focalPoint.x}% ${image.focalPoint.y}%`,
                  }
                : undefined
            }
            aria-hidden
          />
          <div className="absolute inset-0 bg-invite-cream/75" aria-hidden />
        </>
      ) : null}
      <GoldenThread
        chapter="closing"
        className="pointer-events-none absolute inset-x-0 top-10 h-28 w-full text-invite-gold opacity-35 sm:h-32"
      />
      <div className="relative mx-auto max-w-lg text-center">
        <MonogramSvg className="mx-auto mb-8 h-20 w-20 text-invite-gold" />
        <p
          id="closing-title"
          className={cn(
            "invite-script-subheading text-balance",
            wedding.closing.messageIsPlaceholder && "opacity-80",
          )}
        >
          {wedding.closing.message}
        </p>
        <p className="invite-script-heading mt-8 text-3xl sm:text-4xl">
          {wedding.couple.displayName}
        </p>
        <p className="mt-3 font-sans text-sm uppercase tracking-[0.22em] text-invite-gold">
          {wedding.wedding.dateDisplay}
        </p>
        <p className="mt-2 text-sm text-invite-body/80">
          {wedding.wedding.venueName} · {wedding.wedding.city},{" "}
          {wedding.wedding.region}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href={rsvpNav.href} variant="gold" size="lg">
            {wedding.entry.rsvpLabel}
          </ButtonLink>
          <ButtonLink
            href={
              wedding.contact.emailIsPlaceholder
                ? "#faq-contact"
                : `mailto:${wedding.contact.email}`
            }
            variant="secondary"
            size="lg"
            className="invite-outline-button"
          >
            Contact
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
