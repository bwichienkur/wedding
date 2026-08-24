import { NextResponse } from "next/server";
import {
  HOUSEHOLD_COOKIE,
  parseHouseholdSession,
} from "@/lib/rsvp/crypto";
import { getHouseholdWorkspace } from "@/lib/rsvp/service";
import { cookies } from "next/headers";

export async function GET() {
  const jar = await cookies();
  const householdId = parseHouseholdSession(jar.get(HOUSEHOLD_COOKIE)?.value);
  if (!householdId) {
    return NextResponse.json({ workspace: null });
  }
  const workspace = await getHouseholdWorkspace(householdId);
  return NextResponse.json({ workspace });
}
