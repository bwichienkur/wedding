import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import {
  adminDeleteHousehold,
  adminUpdateHousehold,
} from "@/lib/rsvp/guest-admin";
import { z } from "zod";

const patchSchema = z.object({
  displayName: z.string().trim().min(1).max(200).optional(),
  email: z.string().email().nullable().optional(),
  invitationCode: z.string().trim().min(4).max(40).nullable().optional(),
  notesAdmin: z.string().max(2000).optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ householdId: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { householdId } = await context.params;
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
    await adminUpdateHousehold(householdId, parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to update household." }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ householdId: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { householdId } = await context.params;
  try {
    await adminDeleteHousehold(householdId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete household." }, { status: 400 });
  }
}
