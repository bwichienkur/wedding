import { describe, expect, it } from "vitest";
import {
  buildLodgingBoard,
  wouldExceedCapacity,
} from "@/lib/lodging/board";
import type { LodgingGuestPoolRow } from "@/lib/rsvp/lodging-guest-pool";

describe("buildLodgingBoard", () => {
  it("groups guests by room and flags over-capacity", () => {
    const pool: LodgingGuestPoolRow[] = [
      {
        guestId: "g1",
        fullName: "Alex",
        householdId: "h1",
        householdName: "Alex",
        ceremonyAttending: "yes",
        welcomeAttending: "no",
      },
      {
        guestId: "g2",
        fullName: "Blair",
        householdId: "h2",
        householdName: "Blair",
        ceremonyAttending: "no",
        welcomeAttending: "no",
      },
      {
        guestId: "g3",
        fullName: "Casey",
        householdId: "h3",
        householdName: "Casey",
        ceremonyAttending: "unknown",
        welcomeAttending: "unknown",
      },
    ];

    const board = buildLodgingBoard({
      updatedAt: "2026-01-01T00:00:00.000Z",
      assignments: {
        g1: "room-3",
        g2: "room-3",
        g3: "room-3",
      },
      poolGuests: pool,
    });

    expect(board.totalGuests).toBe(3);
    expect(board.unassigned).toHaveLength(0);
    const room3 = board.rooms.find((room) => room.id === "room-3");
    expect(room3?.assignedCount).toBe(3);
    expect(room3?.isOverCapacity).toBe(true);
    expect(board.overCapacityRoomIds).toContain("room-3");
  });
});

describe("wouldExceedCapacity", () => {
  it("blocks when room is full", () => {
    const assignments = { a: "room-9", b: "room-9" };
    expect(wouldExceedCapacity(assignments, "room-9", "c")).toBe(true);
    expect(wouldExceedCapacity(assignments, "room-9", "a")).toBe(false);
  });
});
