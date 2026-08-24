import { NextResponse } from "next/server";
import {
  HOUSEHOLD_COOKIE,
  parseHouseholdSession,
} from "@/lib/rsvp/crypto";
import { rateLimit } from "@/lib/rsvp/rate-limit";
import { submitHouseholdRsvp } from "@/lib/rsvp/service";
import { submitRsvpSchema } from "@/lib/rsvp/types";
import {
  sendAdminRsvpNotification,
  sendRsvpConfirmationEmail,
} from "@/lib/email/rsvp";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const limited = rateLimit({
    key: `rsvp-submit:${ip}`,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 },
    );
  }

  const jar = await cookies();
  const householdId = parseHouseholdSession(jar.get(HOUSEHOLD_COOKIE)?.value);
  if (!householdId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = submitRsvpSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please review your responses.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await submitHouseholdRsvp({
      householdId,
      payload: parsed.data,
      ip,
      actor: "guest",
    });

    if (result.email) {
      await sendRsvpConfirmationEmail({
        to: result.email,
        householdName: result.displayName,
        status: result.status,
        isUpdate: true,
      });
    }
    await sendAdminRsvpNotification({
      householdName: result.displayName,
      status: result.status,
    });

    return NextResponse.json({ ok: true, status: result.status });
  } catch (error) {
    if (error instanceof Error && error.message === "DEADLINE") {
      return NextResponse.json(
        { error: "The RSVP deadline has passed." },
        { status: 403 },
      );
    }
    return NextResponse.json({ error: "Unable to save RSVP." }, { status: 400 });
  }
}
