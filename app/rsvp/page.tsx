import { RsvpExperience } from "@/components/rsvp/RsvpExperience";
import { wedding } from "@/data/wedding";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RSVP",
  description: `RSVP for ${wedding.couple.displayName}’s wedding on ${wedding.wedding.dateDisplay}.`,
  robots: { index: false, follow: false },
};

export default function RsvpPage() {
  return (
    <main className="mx-auto min-h-[100svh] px-5 py-16 sm:px-8">
      <RsvpExperience />
    </main>
  );
}
