"use client";

import { InviteSectionMenu } from "@/components/invite/InviteSectionMenu";
import { OurSongMuteButton } from "@/components/invite/OurSongMuteButton";
import type { ResolvedSiteSections } from "@/lib/content/types";

/** Fixed controls that follow the guest while scrolling the invite. */
export function InviteFloatingChrome({
  visible,
  sections,
}: {
  visible: boolean;
  sections: ResolvedSiteSections;
}) {
  if (!visible) return null;

  return (
    <div className="invite-floating-chrome" aria-label="Page controls">
      <InviteSectionMenu sections={sections} />
      <OurSongMuteButton className="invite-floating-chrome__mute" />
    </div>
  );
}
