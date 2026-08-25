import "server-only";

import {
  getSectionDefinition,
  siteSectionDefinitions,
  type SiteSectionId,
} from "@/data/sections";
import { readSiteSectionsRaw, writeSiteSectionsRaw } from "@/lib/content/persistence";
import { resolveSiteSections } from "@/lib/content/resolve";
import type {
  ResolvedSiteSections,
  SectionOverride,
  SiteSectionsDocument,
} from "@/lib/content/types";

function emptyDocument(): SiteSectionsDocument {
  return {
    version: 1,
    sections: {},
    updatedAt: new Date(0).toISOString(),
  };
}

export async function readSiteSectionsDocument(): Promise<SiteSectionsDocument> {
  try {
    const raw = await readSiteSectionsRaw();
    const parsed = JSON.parse(raw) as SiteSectionsDocument;
    if (!parsed || parsed.version !== 1 || typeof parsed.sections !== "object") {
      return emptyDocument();
    }
    return {
      version: 1,
      sections: parsed.sections ?? {},
      updatedAt: parsed.updatedAt ?? new Date(0).toISOString(),
    };
  } catch {
    return emptyDocument();
  }
}

export async function writeSiteSectionsDocument(
  doc: SiteSectionsDocument,
): Promise<SiteSectionsDocument> {
  const next: SiteSectionsDocument = {
    version: 1,
    sections: doc.sections,
    updatedAt: new Date().toISOString(),
  };
  await writeSiteSectionsRaw(JSON.stringify(next, null, 2));
  return next;
}

export async function getResolvedSiteSections(): Promise<ResolvedSiteSections> {
  const doc = await readSiteSectionsDocument();
  return resolveSiteSections(doc);
}

export async function updateSiteSection(
  id: SiteSectionId,
  patch: SectionOverride,
): Promise<ResolvedSiteSections> {
  const def = getSectionDefinition(id);
  if (!def) {
    throw new Error(`Unknown section: ${id}`);
  }

  const doc = await readSiteSectionsDocument();
  const current = doc.sections[id] ?? {};
  const nextOverride: SectionOverride = { ...current };

  if (typeof patch.visible === "boolean") {
    if (def.required && patch.visible === false) {
      throw new Error(`${def.label} cannot be hidden.`);
    }
    nextOverride.visible = patch.visible;
  }

  if (typeof patch.eyebrow === "string") {
    nextOverride.eyebrow = patch.eyebrow;
  }
  if (typeof patch.title === "string") {
    nextOverride.title = patch.title;
  }
  if (typeof patch.description === "string") {
    nextOverride.description = patch.description;
  }

  doc.sections[id] = nextOverride;
  await writeSiteSectionsDocument(doc);
  return resolveSiteSections(doc);
}

export { resolveSiteSections, siteSectionDefinitions };
