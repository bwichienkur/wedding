import { NextResponse } from "next/server";
import { setHouseholdSessionCookie } from "@/lib/rsvp/household-session";
import { rateLimit } from "@/lib/rsvp/rate-limit";
import {
  getHouseholdWorkspace,
  lookupHouseholds,
  resolveHouseholdFromToken,
} from "@/lib/rsvp/service";
import { lookupRequestSchema } from "@/lib/rsvp/types";
import { appendAudit } from "@/lib/rsvp/store";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const limited = rateLimit({
    key: `rsvp-lookup:${ip}`,
    limit: 12,
    windowMs: 10 * 60 * 1000,
  });
  if (!limited.ok) {
    void appendAudit({
      actor: "system",
      action: "rsvp.lookup.rate_limited",
      entityType: "rsvp",
      entityId: null,
      metadataJson: JSON.stringify({ ip }),
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: "Unable to find an invitation. Please try again later." },
      { status: 429 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = lookupRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a full name or invitation code." },
      { status: 400 },
    );
  }

  const result = await lookupHouseholds(parsed.data.query);

  if (result.candidates.length === 0) {
    return NextResponse.json({
      candidates: [],
      message: "We couldn’t find a matching invitation. Check the spelling or code.",
    });
  }

  void appendAudit({
    actor: "guest",
    action: "rsvp.lookup",
    entityType: "rsvp",
    entityId: null,
    metadataJson: JSON.stringify({
      matches: result.candidates.length,
      ambiguous: result.ambiguous,
    }),
    createdAt: new Date().toISOString(),
  });

  if (result.candidates.length === 1) {
    const token = result.candidates[0]!.confirmationToken;
    const householdId = await resolveHouseholdFromToken(token);
    if (householdId) {
      const workspace = await getHouseholdWorkspace(householdId);
      if (workspace) {
        await setHouseholdSessionCookie(householdId);
        return NextResponse.json({
          candidates: result.candidates,
          ambiguous: result.ambiguous,
          workspace,
        });
      }
    }
  }

  return NextResponse.json({
    candidates: result.candidates,
    ambiguous: result.ambiguous,
  });
}
