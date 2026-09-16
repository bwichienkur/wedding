"use client";

import { InviteCanvas } from "@/components/invite/InviteCanvas";
import { AmbientBackground } from "@/components/ambient/AmbientBackground";
import { InviteGallerySection } from "@/components/invite/InviteGallerySection";
import { InviteCountdownSection } from "@/components/invite/InviteCountdownSection";
import { ScrollToRsvpFab } from "@/components/invite/ScrollToRsvpFab";
import { InviteVideoHero } from "@/components/invite/InviteVideoHero";
import { CinematicEntry } from "@/components/sections/CinematicEntry";
import { FaqSection } from "@/components/sections/Faq";
import { OurStory } from "@/components/sections/OurStory";
import { PartySection } from "@/components/sections/Party";
import { RegistrySection } from "@/components/sections/Registry";
import { RsvpSection } from "@/components/sections/RsvpTeaser";
import { TravelSection } from "@/components/sections/Travel";
import { VenueSection } from "@/components/sections/Venue";
import { WeddingDaySection } from "@/components/sections/WeddingDay";
import type { HeroSlide } from "@/data/hero-slides";
import type {
  FaqItem,
  TravelInfo,
  VenueInfo,
  WeddingPartyMember,
} from "@/data/logistics-types";
import type { MemoryCard } from "@/data/memories";
import type { StoryImage, StoryMilestone } from "@/data/types";
import { mainContentId } from "@/data/navigation";
import type { ResolvedSiteSections } from "@/lib/content/types";
import { cn } from "@/lib/cn";
import { useCallback, useState } from "react";

export interface HomeMediaBundle {
  heroSlides: HeroSlide[];
  storyMilestones: StoryMilestone[];
  memoryCards: MemoryCard[];
  venue: VenueInfo;
  partyMembers: WeddingPartyMember[];
  closingImage: StoryImage | null;
  proposalStill: StoryImage | null;
  travel: TravelInfo;
  faqItems: FaqItem[];
}

/** Wooowinvites-style single-card scroll — video hero, then wedding details */
export function HomeExperience({
  media,
  sections,
}: {
  media: HomeMediaBundle;
  sections: ResolvedSiteSections;
}) {
  const [introDone, setIntroDone] = useState(false);
  const [siteRevealed, setSiteRevealed] = useState(false);

  const beginReveal = useCallback(() => {
    setSiteRevealed(true);
    document.body.classList.add("invite-revealed");
  }, []);

  const completeIntro = useCallback(() => {
    setSiteRevealed(true);
    setIntroDone(true);
    document.body.classList.add("invite-revealed");
  }, []);

  const show = (id: keyof ResolvedSiteSections) => sections[id]?.visible;

  const showRsvp = show("rsvp");

  return (
    <>
      <CinematicEntry
        onComplete={completeIntro}
        onRevealStart={beginReveal}
      />
      <AmbientBackground active={introDone} />
      <div
        className={cn(
          "invite-experience relative z-[1] transition-opacity duration-700 ease-out",
          siteRevealed
            ? "opacity-100"
            : "pointer-events-none invisible opacity-0",
        )}
        aria-hidden={!siteRevealed}
      >
        <InviteVideoHero />
        <InviteCanvas>
          <main id={mainContentId} tabIndex={-1} className="outline-none">
            <InviteCountdownSection />

            {show("venue") ? (
              <VenueSection
                venue={media.venue}
                eyebrow={sections.venue.eyebrow}
                title={sections.venue.title}
                description={sections.venue.description}
              />
            ) : null}

            {show("wedding-day") ? (
              <WeddingDaySection
                eyebrow={sections["wedding-day"].eyebrow}
                title={sections["wedding-day"].title}
                description={sections["wedding-day"].description}
              />
            ) : null}

            {show("travel") ? (
              <TravelSection
                travel={media.travel}
                eyebrow={sections.travel.eyebrow}
                title={sections.travel.title}
                description={sections.travel.description}
              />
            ) : null}

            {show("story") ? (
              <OurStory
                milestones={media.storyMilestones}
                eyebrow={sections.story.eyebrow}
                title={sections.story.title}
                description={sections.story.description}
              />
            ) : null}

            {show("gallery") ? (
              <InviteGallerySection
                cards={media.memoryCards}
                eyebrow={sections.gallery.eyebrow}
                title={sections.gallery.title}
                description={sections.gallery.description}
              />
            ) : null}

            {show("party") ? (
              <PartySection
                members={media.partyMembers}
                eyebrow={sections.party.eyebrow}
                title={sections.party.title}
                description={sections.party.description}
              />
            ) : null}

            {showRsvp ? (
              <RsvpSection
                eyebrow={sections.rsvp.eyebrow}
                title={sections.rsvp.title}
                description={sections.rsvp.description}
              />
            ) : null}

            {show("faq") ? (
              <FaqSection
                items={media.faqItems}
                eyebrow={sections.faq.eyebrow}
                title={sections.faq.title}
                description={sections.faq.description}
              />
            ) : null}

            {show("registry") ? (
              <RegistrySection
                eyebrow={sections.registry.eyebrow}
                title={sections.registry.title}
                description={sections.registry.description}
              />
            ) : null}
          </main>
        </InviteCanvas>

        <ScrollToRsvpFab visible={siteRevealed && showRsvp} />
      </div>
      {introDone ? null : (
        <span className="sr-only" aria-live="polite">
          Welcome experience loading
        </span>
      )}
    </>
  );
}
