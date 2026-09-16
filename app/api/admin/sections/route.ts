import { NextResponse } from "next/server";
import { z } from "zod";
import { siteSectionDefinitions, type SiteSectionId } from "@/data/sections";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminSectionGuide } from "@/lib/admin/section-guide";
import {
  getResolvedSiteSections,
  updateSiteSection,
} from "@/lib/content/store";
import type { AdminSectionRow } from "@/lib/content/types";

const sectionIds = siteSectionDefinitions.map((s) => s.id) as [
  SiteSectionId,
  ...SiteSectionId[],
];

const patchSchema = z.object({
  id: z.enum(sectionIds),
  visible: z.boolean().optional(),
  eyebrow: z.string().max(80).optional(),
  title: z.string().max(160).optional(),
  description: z.string().max(600).optional(),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sections = await getResolvedSiteSections();
  const rows: AdminSectionRow[] = siteSectionDefinitions.map((def) => {
    const guide = getAdminSectionGuide(def.id);
    return {
      ...sections[def.id],
      mountedOnInvite: guide.mountedOnInvite,
      inviteOrder: guide.inviteOrder,
      adminHint: guide.hint,
      contentTab: guide.contentTab,
    };
  });
  rows.sort((a, b) => {
    if (a.mountedOnInvite !== b.mountedOnInvite) {
      return a.mountedOnInvite ? -1 : 1;
    }
    const ao = a.inviteOrder ?? 999;
    const bo = b.inviteOrder ?? 999;
    if (ao !== bo) return ao - bo;
    return a.label.localeCompare(b.label);
  });
  return NextResponse.json({ sections: rows });
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid section update", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const { id, ...patch } = parsed.data;
    const sections = await updateSiteSection(id, patch);
    const rows: AdminSectionRow[] = siteSectionDefinitions.map((def) => {
      const guide = getAdminSectionGuide(def.id);
      return {
        ...sections[def.id],
        mountedOnInvite: guide.mountedOnInvite,
        inviteOrder: guide.inviteOrder,
        adminHint: guide.hint,
        contentTab: guide.contentTab,
      };
    });
    rows.sort((a, b) => {
      if (a.mountedOnInvite !== b.mountedOnInvite) {
        return a.mountedOnInvite ? -1 : 1;
      }
      const ao = a.inviteOrder ?? 999;
      const bo = b.inviteOrder ?? 999;
      if (ao !== bo) return ao - bo;
      return a.label.localeCompare(b.label);
    });
    return NextResponse.json({
      section: sections[id],
      sections: rows,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update section";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
