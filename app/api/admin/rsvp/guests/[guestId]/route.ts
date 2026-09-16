import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { adminRemoveGuest, adminUpdateGuest } from "@/lib/rsvp/guest-admin";
import { z } from "zod";

const patchSchema = z.object({
  fullName: z.string().trim().min(1).max(120).optional(),
  isChild: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ guestId: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { guestId } = await context.params;
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  try {
    await adminUpdateGuest(guestId, parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update guest." }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ guestId: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { guestId } = await context.params;
  try {
    await adminRemoveGuest(guestId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to remove guest." }, { status: 400 });
  }
}
