import { InviteCanvas } from "@/components/invite/InviteCanvas";
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
    <InviteCanvas className="invite-rsvp-page">
      <main className="invite-section border-t-0 pt-6 sm:pt-8">
        <RsvpExperience />
      </main>
    </InviteCanvas>
  );
}
