import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { listAdminGuestHouseholds } from "@/lib/rsvp/guest-admin";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const households = await listAdminGuestHouseholds();
  return NextResponse.json({ households });
}
