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

/** Clears the guest session so they can look up a different invitation. */
export async function DELETE() {
  const jar = await cookies();
  jar.set(HOUSEHOLD_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
