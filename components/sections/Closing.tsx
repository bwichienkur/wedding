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
      className="relative overflow-hidden bg-forest px-5 py-24 text-ivory sm:px-8"
      aria-labelledby="closing-title"
    >
      {image?.src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-35"
            style={
              image.focalPoint
                ? {
                    objectPosition: `${image.focalPoint.x}% ${image.focalPoint.y}%`,
                  }
                : undefined
            }
            aria-hidden
          />
          <div className="absolute inset-0 bg-forest/70" aria-hidden />
        </>
      ) : null}
      <div className="grain absolute inset-0 opacity-20" aria-hidden />
      <GoldenThread
        chapter="closing"
        className="pointer-events-none absolute inset-x-0 top-10 h-28 w-full text-gold-soft opacity-40 sm:h-32 sm:opacity-45"
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
            className="border-ivory/40 text-ivory hover:border-ivory"
          >
            Contact
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
