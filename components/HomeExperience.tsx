"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { CinematicEntry } from "@/components/sections/CinematicEntry";
import { ClosingSection } from "@/components/sections/Closing";
import { FaqSection } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { OurStory } from "@/components/sections/OurStory";
import { PartySection } from "@/components/sections/Party";
import { ProposalConvergenceSection } from "@/components/sections/ProposalConvergence";
import { RegistrySection } from "@/components/sections/Registry";
import { RsvpSection } from "@/components/sections/RsvpTeaser";
import { TravelSection } from "@/components/sections/Travel";
import { VenueSection } from "@/components/sections/Venue";
import { WeddingDaySection } from "@/components/sections/WeddingDay";
import { WeddingMarquee } from "@/components/sections/WeddingMarquee";
import { MemoryGallerySection } from "@/components/three/MemoryGallery";
import { SectionErrorBoundary } from "@/components/ui/SectionErrorBoundary";
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
import { useCallback, useMemo, useState } from "react";

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

export function HomeExperience({
  media,
  sections,
}: {
  media: HomeMediaBundle;
  sections: ResolvedSiteSections;
}) {
  const [introDone, setIntroDone] = useState(false);
  const [siteRevealed, setSiteRevealed] = useState(false);

  const completeIntro = useCallback(() => {
    setSiteRevealed(true);
    setIntroDone(true);
  }, []);

  const beginReveal = useCallback(() => {
    setSiteRevealed(true);
  }, []);

  const visibleIds = useMemo(() => {
    const ids = new Set<string>();
    for (const section of Object.values(sections)) {
      if (section.visible) ids.add(section.id);
    }
    return ids;
  }, [sections]);

  const show = (id: keyof ResolvedSiteSections) => sections[id]?.visible;

  return (
    <>
      <CinematicEntry
        onComplete={completeIntro}
        onRevealStart={beginReveal}
      />
      <div
        className={cn(
          "transition-opacity duration-500 ease-out",
          siteRevealed ? "opacity-100" : "opacity-0",
        )}
      >
        <SiteHeader visibleSectionIds={visibleIds} />
        <main id={mainContentId} tabIndex={-1} className="outline-none">
          <Hero slides={media.heroSlides} />
          {show("marquee") ? <WeddingMarquee /> : null}
          {show("story") ? (
            <OurStory
              milestones={media.storyMilestones}
              eyebrow={sections.story.eyebrow}
              title={sections.story.title}
              description={sections.story.description}
            />
          ) : null}
          {show("gallery") ? (
            <SectionErrorBoundary title="Memories couldn’t load">
              <MemoryGallerySection
                cards={media.memoryCards}
                eyebrow={sections.gallery.eyebrow}
                title={sections.gallery.title}
                description={sections.gallery.description}
              />
            </SectionErrorBoundary>
          ) : null}
          {show("proposal") ? (
            <SectionErrorBoundary title="Proposal chapter couldn’t load">
              <ProposalConvergenceSection
                still={media.proposalStill}
                eyebrow={sections.proposal.eyebrow}
                title={sections.proposal.title}
                description={sections.proposal.description}
              />
            </SectionErrorBoundary>
          ) : null}
          {show("wedding-day") ? (
            <WeddingDaySection
              eyebrow={sections["wedding-day"].eyebrow}
              title={sections["wedding-day"].title}
              description={sections["wedding-day"].description}
            />
          ) : null}
          {show("venue") ? (
            <VenueSection
              venue={media.venue}
              eyebrow={sections.venue.eyebrow}
              title={sections.venue.title}
              description={sections.venue.description}
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
          {show("party") ? (
            <PartySection
              members={media.partyMembers}
              eyebrow={sections.party.eyebrow}
              title={sections.party.title}
              description={sections.party.description}
            />
          ) : null}
          {show("rsvp") ? (
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
          {show("closing") ? (
            <ClosingSection image={media.closingImage} />
          ) : null}
        </main>
      </div>
      {introDone ? null : (
        <span className="sr-only" aria-live="polite">
          Welcome experience loading
        </span>
      )}
    </>
  );
}
