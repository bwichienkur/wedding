import { HomeExperience } from "@/components/HomeExperience";
import { wedding } from "@/data/wedding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: wedding.site.title,
  description: wedding.site.description,
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <HomeExperience />;
}
