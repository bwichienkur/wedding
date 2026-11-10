import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { buildLodgingBoard } from "@/lib/lodging/board";
import { lodgingPatchSchema } from "@/lib/lodging/schema";
import {
  assignGuestToRoom,
  LodgingAssignmentError,
  readLodgingAssignmentsDocument,
  replaceAssignments,
  unassignGuest,
} from "@/lib/lodging/store";
import {
  flattenAcceptedGuestRows,
} from "@/lib/rsvp/admin-attendance";
import { listAdminGuestHouseholds } from "@/lib/rsvp/guest-admin";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [doc, households] = await Promise.all([
    readLodgingAssignmentsDocument(),
    listAdminGuestHouseholds(),
  ]);

  const acceptedGuests = flattenAcceptedGuestRows(households);
  const board = buildLodgingBoard({
    acceptedGuests,
    assignments: doc.assignments,
    updatedAt: doc.updatedAt,
  });

  return NextResponse.json(board);
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

  const parsed = lodgingPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid lodging update", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const payload = parsed.data;
    let doc;
    if (payload.action === "assign") {
      doc = await assignGuestToRoom(payload.guestId, payload.roomId);
    } else if (payload.action === "unassign") {
      doc = await unassignGuest(payload.guestId);
    } else {
      doc = await replaceAssignments(payload.assignments);
    }

    const households = await listAdminGuestHouseholds();
    const acceptedGuests = flattenAcceptedGuestRows(households);
    const board = buildLodgingBoard({
      acceptedGuests,
      assignments: doc.assignments,
      updatedAt: doc.updatedAt,
    });

    return NextResponse.json(board);
  } catch (error) {
    if (error instanceof LodgingAssignmentError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.code === "CAPACITY" ? 409 : 400 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Lodging update failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
