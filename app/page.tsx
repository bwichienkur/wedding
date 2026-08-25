import { HomeExperience, type HomeMediaBundle } from "@/components/HomeExperience";
import { WeddingEventJsonLd } from "@/components/seo/WeddingEventJsonLd";
import { wedding } from "@/data/wedding";
import { getResolvedSiteSections } from "@/lib/content/store";
import { getResolvedLogistics } from "@/lib/logistics/store";
import {
  resolveClosingImage,
  resolveHeroSlides,
  resolveMemoryCards,
  resolvePartyMembers,
  resolveProposalStill,
  resolveStoryMilestones,
  resolveVenueLayers,
} from "@/lib/media/resolve";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: wedding.site.title,
  description: wedding.site.description,
  alternates: {
    canonical: "/",
  },
};

/** Uploaded media must be resolved at request time, not at build time. */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    heroSlides,
    storyMilestones,
    memoryCards,
    venue,
    partyMembers,
    closingImage,
    proposalStill,
    sections,
    logistics,
  ] = await Promise.all([
    resolveHeroSlides(),
    resolveStoryMilestones(),
    resolveMemoryCards(),
    resolveVenueLayers(),
    resolvePartyMembers(),
    resolveClosingImage(),
    resolveProposalStill(),
    getResolvedSiteSections(),
    getResolvedLogistics(),
  ]);

  const media: HomeMediaBundle = {
    heroSlides,
    storyMilestones,
    memoryCards,
    venue,
    partyMembers,
    closingImage,
    proposalStill,
    travel: logistics.travel,
    faqItems: logistics.faq,
  };

  return (
    <>
      <WeddingEventJsonLd />
      <HomeExperience media={media} sections={sections} />
    </>
  );
}
