import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { adminCreateHousehold } from "@/lib/rsvp/guest-admin";
import { z } from "zod";

const bodySchema = z.object({
  displayName: z.string().trim().min(1).max(200),
  email: z.union([z.string().email(), z.null()]).optional(),
  invitationCode: z.string().trim().min(4).max(40).optional().nullable(),
  guestNames: z.array(z.string().trim().min(1).max(120)).min(1).max(20),
});

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid guest list data." }, { status: 400 });
  }

  try {
    const household = await adminCreateHousehold(parsed.data);
    return NextResponse.json({ household });
  } catch {
    return NextResponse.json({ error: "Unable to create household." }, { status: 400 });
  }
}
