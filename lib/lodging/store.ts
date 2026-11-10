import "server-only";

import { lodgingAssignmentsDocumentSchema } from "@/lib/lodging/schema";
import type { LodgingAssignmentsDocument } from "@/lib/lodging/schema";
import { wouldExceedCapacity } from "@/lib/lodging/board";
import {
  readLodgingAssignmentsRaw,
  writeLodgingAssignmentsRaw,
} from "@/lib/lodging/persistence";
import { getBellaCosaRoom } from "@/data/bella-cosa-rooms";

function defaultDocument(): LodgingAssignmentsDocument {
  return {
    version: 1,
    assignments: {},
    updatedAt: new Date(0).toISOString(),
  };
}

export async function readLodgingAssignmentsDocument(): Promise<LodgingAssignmentsDocument> {
  try {
    const raw = await readLodgingAssignmentsRaw();
    const parsed = lodgingAssignmentsDocumentSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return defaultDocument();
    return parsed.data;
  } catch {
    return defaultDocument();
  }
}

async function writeDocument(
  doc: LodgingAssignmentsDocument,
): Promise<LodgingAssignmentsDocument> {
  const next: LodgingAssignmentsDocument = {
    ...doc,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
  await writeLodgingAssignmentsRaw(JSON.stringify(next, null, 2));
  return next;
}

export class LodgingAssignmentError extends Error {
  constructor(
    message: string,
    readonly code: "UNKNOWN_ROOM" | "CAPACITY" | "UNKNOWN_GUEST",
  ) {
    super(message);
    this.name = "LodgingAssignmentError";
  }
}

export async function assignGuestToRoom(
  guestId: string,
  roomId: string,
): Promise<LodgingAssignmentsDocument> {
  if (!getBellaCosaRoom(roomId)) {
    throw new LodgingAssignmentError("Unknown room", "UNKNOWN_ROOM");
  }

  const doc = await readLodgingAssignmentsDocument();
  if (wouldExceedCapacity(doc.assignments, roomId, guestId)) {
    const room = getBellaCosaRoom(roomId)!;
    throw new LodgingAssignmentError(
      `${room.label} is already at capacity (${room.capacity}).`,
      "CAPACITY",
    );
  }

  doc.assignments[guestId] = roomId;
  return writeDocument(doc);
}

export async function unassignGuest(
  guestId: string,
): Promise<LodgingAssignmentsDocument> {
  const doc = await readLodgingAssignmentsDocument();
  delete doc.assignments[guestId];
  return writeDocument(doc);
}

export async function replaceAssignments(
  assignments: Record<string, string>,
): Promise<LodgingAssignmentsDocument> {
  const doc = await readLodgingAssignmentsDocument();
  const counts = new Map<string, number>();

  for (const roomId of Object.values(assignments)) {
    if (!getBellaCosaRoom(roomId)) {
      throw new LodgingAssignmentError(`Unknown room: ${roomId}`, "UNKNOWN_ROOM");
    }
    counts.set(roomId, (counts.get(roomId) ?? 0) + 1);
  }

  for (const room of counts.keys()) {
    const definition = getBellaCosaRoom(room)!;
    const count = counts.get(room) ?? 0;
    if (count > definition.capacity) {
      throw new LodgingAssignmentError(
        `${definition.label} would exceed capacity (${definition.capacity}).`,
        "CAPACITY",
      );
    }
  }

  doc.assignments = { ...assignments };
  return writeDocument(doc);
}
