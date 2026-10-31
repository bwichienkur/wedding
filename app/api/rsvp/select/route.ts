import { NextResponse } from "next/server";
import { setHouseholdSessionCookie } from "@/lib/rsvp/household-session";
import {
  getHouseholdWorkspace,
  resolveHouseholdFromToken,
} from "@/lib/rsvp/service";
import { z } from "zod";
import { rsvpUnavailableResponse } from "@/lib/rsvp/api-errors";

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

  try {
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

    await setHouseholdSessionCookie(householdId);

    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("rsvp.select failed", error);
    const body = rsvpUnavailableResponse(error);
    return NextResponse.json({ error: body.error }, { status: body.status });
  }
}
