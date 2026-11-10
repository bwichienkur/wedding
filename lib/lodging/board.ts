import {
  BELLA_COSA_LODGING_ROOMS,
  getBellaCosaRoom,
  type BellaCosaRoom,
} from "@/data/bella-cosa-rooms";
import type { LodgingGuestPoolRow } from "@/lib/rsvp/lodging-guest-pool";

export interface LodgingBoardGuest {
  guestId: string;
  fullName: string;
  householdName: string;
  roomId: string | null;
  ceremonyAttending: string;
  welcomeAttending: string;
}

export interface LodgingBoardRoom extends BellaCosaRoom {
  guests: LodgingBoardGuest[];
  assignedCount: number;
  isOverCapacity: boolean;
  bedsRemaining: number;
}

export interface LodgingBoard {
  rooms: LodgingBoardRoom[];
  unassigned: LodgingBoardGuest[];
  totalGuests: number;
  assignedCount: number;
  overCapacityRoomIds: string[];
  updatedAt: string;
}

export function buildLodgingBoard(input: {
  poolGuests: LodgingGuestPoolRow[];
  assignments: Record<string, string>;
  updatedAt: string;
}): LodgingBoard {
  const guestRoom = new Map<string, string>();
  for (const [guestId, roomId] of Object.entries(input.assignments)) {
    if (getBellaCosaRoom(roomId)) {
      guestRoom.set(guestId, roomId);
    }
  }

  const poolById = new Map(
    input.poolGuests.map((guest) => [guest.guestId, guest]),
  );

  const boardGuests: LodgingBoardGuest[] = input.poolGuests.map((guest) => ({
    guestId: guest.guestId,
    fullName: guest.fullName,
    householdName: guest.householdName,
    roomId: guestRoom.get(guest.guestId) ?? null,
    ceremonyAttending: guest.ceremonyAttending,
    welcomeAttending: guest.welcomeAttending,
  }));

  for (const [guestId, roomId] of guestRoom) {
    if (!poolById.has(guestId)) {
      boardGuests.push({
        guestId,
        fullName: `(Unknown guest ${guestId.slice(0, 8)}…)`,
        householdName: "—",
        roomId,
        ceremonyAttending: "unknown",
        welcomeAttending: "unknown",
      });
    }
  }

  const byRoom = new Map<string, LodgingBoardGuest[]>();
  for (const room of BELLA_COSA_LODGING_ROOMS) {
    byRoom.set(room.id, []);
  }

  const unassigned: LodgingBoardGuest[] = [];
  for (const guest of boardGuests) {
    if (!guest.roomId) {
      unassigned.push(guest);
      continue;
    }
    const list = byRoom.get(guest.roomId);
    if (list) {
      list.push(guest);
    } else {
      unassigned.push({ ...guest, roomId: null });
    }
  }

  const overCapacityRoomIds: string[] = [];
  const rooms: LodgingBoardRoom[] = BELLA_COSA_LODGING_ROOMS.map((room) => {
    const roomGuests = (byRoom.get(room.id) ?? []).sort((a, b) =>
      a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" }),
    );
    const assignedCount = roomGuests.length;
    const isOverCapacity = assignedCount > room.capacity;
    if (isOverCapacity) overCapacityRoomIds.push(room.id);
    return {
      ...room,
      guests: roomGuests,
      assignedCount,
      isOverCapacity,
      bedsRemaining: Math.max(0, room.capacity - assignedCount),
    };
  });

  const assignedCount = boardGuests.filter((g) => g.roomId).length;

  return {
    rooms,
    unassigned: unassigned.sort((a, b) =>
      a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" }),
    ),
    totalGuests: input.poolGuests.length,
    assignedCount,
    overCapacityRoomIds,
    updatedAt: input.updatedAt,
  };
}

export function countGuestsInRoom(
  assignments: Record<string, string>,
  roomId: string,
): number {
  return Object.values(assignments).filter((id) => id === roomId).length;
}

export function wouldExceedCapacity(
  assignments: Record<string, string>,
  roomId: string,
  guestId: string,
): boolean {
  const room = getBellaCosaRoom(roomId);
  if (!room) return true;
  const current = countGuestsInRoom(assignments, roomId);
  const alreadyInRoom = assignments[guestId] === roomId;
  const next = alreadyInRoom ? current : current + 1;
  return next > room.capacity;
}
