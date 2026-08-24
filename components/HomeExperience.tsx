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
import { MemoryGallerySection } from "@/components/three/MemoryGallery";
import { mainContentId } from "@/data/navigation";
import { useCallback, useState } from "react";

export function HomeExperience() {
  const [introDone, setIntroDone] = useState(false);
  const completeIntro = useCallback(() => setIntroDone(true), []);

  return (
    <>
      <CinematicEntry onComplete={completeIntro} />
      <SiteHeader />
      <main id={mainContentId} tabIndex={-1} className="outline-none">
        <Hero />
        <OurStory />
        <MemoryGallerySection />
        <ProposalConvergenceSection />
        <WeddingDaySection />
        <VenueSection />
        <TravelSection />
        <PartySection />
        <RsvpSection />
        <FaqSection />
        <RegistrySection />
        <ClosingSection />
      </main>
      {introDone ? null : (
        <span className="sr-only" aria-live="polite">
          Welcome experience loading
        </span>
      )}
    </>
  );
}
