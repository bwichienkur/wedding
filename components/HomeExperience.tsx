"use client";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { CinematicEntry } from "@/components/sections/CinematicEntry";
import { Hero } from "@/components/sections/Hero";
import {
  ClosingSection,
  FaqSection,
  PartySection,
  RegistrySection,
  RsvpSection,
  TravelSection,
  VenueSection,
  WeddingDaySection,
} from "@/components/sections/LogisticsPlaceholders";
import { OurStory } from "@/components/sections/OurStory";
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
