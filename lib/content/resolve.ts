import {
  getSectionDefinition,
  siteSectionDefinitions,
  type SiteSectionId,
} from "@/data/sections";
import { wedding } from "@/data/wedding";
import type {
  ResolvedSiteSections,
  SiteSectionsDocument,
} from "@/lib/content/types";

function defaultCopy(id: SiteSectionId): {
  eyebrow: string;
  title: string;
  description: string;
} {
  const def = getSectionDefinition(id)!;
  if (id === "wedding-day") {
    return {
      eyebrow: def.defaultEyebrow ?? "",
      title: wedding.wedding.dateDisplay,
      description: def.defaultDescription ?? "",
    };
  }
  if (id === "proposal") {
    return {
      eyebrow: def.defaultEyebrow ?? "",
      title: wedding.proposal.transitionCopy,
      description: [wedding.proposal.dateLabel, wedding.proposal.locationLabel]
        .filter(Boolean)
        .join(" · "),
    };
  }
  if (id === "venue") {
    return {
      eyebrow: def.defaultEyebrow ?? "",
      title: wedding.wedding.venueName,
      description: `${wedding.wedding.city}, ${wedding.wedding.region}`,
    };
  }
  return {
    eyebrow: def.defaultEyebrow ?? "",
    title: def.defaultTitle ?? "",
    description: def.defaultDescription ?? "",
  };
}

export function resolveSiteSections(
  doc: SiteSectionsDocument,
): ResolvedSiteSections {
  const resolved = {} as ResolvedSiteSections;

  for (const def of siteSectionDefinitions) {
    const override = doc.sections[def.id] ?? {};
    const defaults = defaultCopy(def.id);
    const required = Boolean(def.required);
    const visible = required
      ? true
      : (override.visible ?? def.defaultVisible);

    resolved[def.id] = {
      id: def.id,
      label: def.label,
      visible,
      required,
      hasDescription: def.hasDescription,
      eyebrow: (override.eyebrow ?? defaults.eyebrow).trim() || defaults.eyebrow,
      title: (override.title ?? defaults.title).trim() || defaults.title,
      description:
        (override.description ?? defaults.description).trim() ||
        defaults.description,
    };
  }

  return resolved;
}

export function isSectionVisible(
  sections: ResolvedSiteSections,
  id: SiteSectionId,
): boolean {
  return sections[id]?.visible ?? true;
}
