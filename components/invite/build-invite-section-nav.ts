import { inviteHomeSectionOrder } from "@/data/navigation";
import {
  getSectionDefinition,
  type SiteSectionId,
} from "@/data/sections";
import type { NavItem } from "@/data/types";
import type { ResolvedSiteSections } from "@/lib/content/types";

/** Short nav labels — not the editable section headings on the page. */
const inviteMenuLabelOverrides: Partial<Record<SiteSectionId, string>> = {
  "wedding-day": "Schedule",
  gallery: "Gallery",
};

function inviteSectionMenuLabel(id: SiteSectionId): string {
  const override = inviteMenuLabelOverrides[id];
  if (override) return override;
  return getSectionDefinition(id)?.label ?? id;
}

export function buildInviteSectionNavItems(
  sections: ResolvedSiteSections,
): NavItem[] {
  const items: NavItem[] = [
    { id: "home", label: "Home", href: "#home" },
    { id: "countdown", label: "Countdown", href: "#countdown" },
  ];

  for (const id of inviteHomeSectionOrder) {
    const section = sections[id];
    if (!section?.visible) continue;
    items.push({
      id,
      label: inviteSectionMenuLabel(id),
      href: `#${id}`,
    });
  }

  return items;
}
