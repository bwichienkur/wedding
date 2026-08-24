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
import type { VenueInfo, WeddingPartyMember } from "@/data/logistics-types";
import type { MemoryCard } from "@/data/memories";
import type { StoryImage, StoryMilestone } from "@/data/types";
import { mainContentId } from "@/data/navigation";
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
}

export function HomeExperience({ media }: { media: HomeMediaBundle }) {
  const [introDone, setIntroDone] = useState(false);
  const [siteRevealed, setSiteRevealed] = useState(false);

  const completeIntro = useCallback(() => {
    setSiteRevealed(true);
    setIntroDone(true);
  }, []);

  const beginReveal = useCallback(() => {
    setSiteRevealed(true);
  }, []);

  return (
    <>
      <CinematicEntry
        onComplete={completeIntro}
        onRevealStart={beginReveal}
      />
      <div
        className={cn(
          "transition-opacity duration-[2200ms] ease-out",
          siteRevealed ? "opacity-100" : "opacity-0",
        )}
      >
        <SiteHeader />
        <main id={mainContentId} tabIndex={-1} className="outline-none">
          <Hero slides={media.heroSlides} />
          <WeddingMarquee />
          <OurStory milestones={media.storyMilestones} />
          <SectionErrorBoundary title="Memories couldn’t load">
            <MemoryGallerySection cards={media.memoryCards} />
          </SectionErrorBoundary>
          <SectionErrorBoundary title="Proposal chapter couldn’t load">
            <ProposalConvergenceSection still={media.proposalStill} />
          </SectionErrorBoundary>
          <WeddingDaySection />
          <VenueSection venue={media.venue} />
          <TravelSection />
          <PartySection members={media.partyMembers} />
          <RsvpSection />
          <FaqSection />
          <RegistrySection />
          <ClosingSection image={media.closingImage} />
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
