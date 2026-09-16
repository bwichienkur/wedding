import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { adminAddGuest } from "@/lib/rsvp/guest-admin";
import { z } from "zod";

const bodySchema = z.object({
  fullName: z.string().trim().min(1).max(120),
});

export async function POST(
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

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a guest name." }, { status: 400 });
  }

  try {
    await adminAddGuest(householdId, parsed.data.fullName);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to add guest." }, { status: 400 });
  }
}
