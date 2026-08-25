import { NextResponse } from "next/server";
import { z } from "zod";
import { siteSectionDefinitions, type SiteSectionId } from "@/data/sections";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getResolvedSiteSections,
  updateSiteSection,
} from "@/lib/content/store";

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
  return NextResponse.json({
    sections: siteSectionDefinitions.map((def) => sections[def.id]),
  });
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
    return NextResponse.json({
      section: sections[id],
      sections: siteSectionDefinitions.map((def) => sections[def.id]),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update section";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
