import "server-only";

import {
  createHouseholdSessionValue,
  HOUSEHOLD_COOKIE,
  HOUSEHOLD_SESSION_MAX_AGE,
} from "@/lib/rsvp/crypto";
import { cookies } from "next/headers";

export async function setHouseholdSessionCookie(householdId: string): Promise<void> {
  const jar = await cookies();
  jar.set(HOUSEHOLD_COOKIE, createHouseholdSessionValue(householdId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: HOUSEHOLD_SESSION_MAX_AGE,
  });
}
