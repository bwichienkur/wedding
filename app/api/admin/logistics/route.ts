import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { logisticsPatchSchema } from "@/lib/logistics/schema";
import {
  deleteFaqItem,
  deletePartyMember,
  getResolvedLogistics,
  updateTravel,
  updateVenue,
  upsertFaqItem,
  upsertPartyMember,
} from "@/lib/logistics/store";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logistics = await getResolvedLogistics();
  return NextResponse.json(logistics);
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = logisticsPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid logistics update", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const data = parsed.data;
    let logistics;
    if (data.kind === "venue") {
      logistics = await updateVenue({
        name: data.name,
        city: data.city,
        region: data.region,
        addressLine1: data.addressLine1,
        addressIsPlaceholder: data.addressIsPlaceholder,
      });
    } else if (data.kind === "travel") {
      logistics = await updateTravel({
        intro: data.intro,
        airports: data.airports,
        hotels: data.hotels,
        transportation: data.transportation,
        transportationIsPlaceholder: data.transportationIsPlaceholder,
        recommendations: data.recommendations,
        emergencyContact: data.emergencyContact,
        emergencyIsPlaceholder: data.emergencyIsPlaceholder,
      });
    } else if (data.kind === "faq" && data.action === "upsert") {
      logistics = await upsertFaqItem(data);
    } else if (data.kind === "faq" && data.action === "delete") {
      logistics = await deleteFaqItem(data.id);
    } else if (data.kind === "party" && data.action === "upsert") {
      logistics = await upsertPartyMember(data);
    } else {
      logistics = await deletePartyMember(data.id);
    }
    return NextResponse.json(logistics);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update logistics";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
