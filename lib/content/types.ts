import type { SiteSectionId } from "@/data/sections";

export interface SectionOverride {
  visible?: boolean;
  eyebrow?: string;
  title?: string;
  description?: string;
}

export interface SiteSectionsDocument {
  version: 1;
  sections: Partial<Record<SiteSectionId, SectionOverride>>;
  updatedAt: string;
}

export interface ResolvedSiteSection {
  id: SiteSectionId;
  label: string;
  visible: boolean;
  required: boolean;
  hasDescription: boolean;
  eyebrow: string;
  title: string;
  description: string;
}

export type ResolvedSiteSections = Record<SiteSectionId, ResolvedSiteSection>;
