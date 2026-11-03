import { inviteHomeSectionOrder } from "@/data/navigation";
import type { NavItem } from "@/data/types";
import type { ResolvedSiteSections } from "@/lib/content/types";

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
      label: section.title,
      href: `#${id}`,
    });
  }

  return items;
}
