import { NextResponse } from "next/server";
import {
  createHouseholdSessionValue,
  HOUSEHOLD_COOKIE,
  HOUSEHOLD_SESSION_MAX_AGE,
} from "@/lib/rsvp/crypto";
import {
  getHouseholdWorkspace,
  resolveHouseholdFromToken,
} from "@/lib/rsvp/service";
import { z } from "zod";
import { cookies } from "next/headers";

const selectSchema = z.object({
  confirmationToken: z.string().min(1),
});

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = selectSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid selection" }, { status: 400 });
  }

  const householdId = await resolveHouseholdFromToken(
    parsed.data.confirmationToken,
  );
  if (!householdId) {
    return NextResponse.json({ error: "Invalid selection" }, { status: 400 });
  }

  const workspace = await getHouseholdWorkspace(householdId);
  if (!workspace) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const jar = await cookies();
  jar.set(HOUSEHOLD_COOKIE, createHouseholdSessionValue(householdId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: HOUSEHOLD_SESSION_MAX_AGE,
  });

  return NextResponse.json({ workspace });
}
