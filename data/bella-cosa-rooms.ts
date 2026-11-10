/** Bella Cosa on-site lodging — from the venue lodging guide (capacities + layout). */

export interface BellaCosaRoom {
  id: string;
  label: string;
  capacity: number;
  bedsSummary: string;
  /** Short note for admins (bed layout, perks, floor-plan quirks). */
  detail?: string;
  /** Lakeside = top of floor plan; front = toward venue entrance. */
  wing?: "lakeside" | "front" | "center";
  sortOrder: number;
}

export const BELLA_COSA_LODGING_ROOMS: BellaCosaRoom[] = [
  {
    id: "honeymoon",
    label: "Honeymoon suite",
    capacity: 2,
    bedsSummary: "Sleeps 2",
    detail: "Reserved for Lexi & Bright (newlyweds). Lakeside end of building.",
    wing: "lakeside",
    sortOrder: 0,
  },
  {
    id: "room-1",
    label: "Room 1",
    capacity: 6,
    bedsSummary: "Sleeps 6 (incl. pull-out couch)",
    wing: "front",
    sortOrder: 1,
  },
  {
    id: "room-2",
    label: "Room 2",
    capacity: 4,
    bedsSummary: "Sleeps 4 (incl. pull-out couch)",
    wing: "center",
    sortOrder: 2,
  },
  {
    id: "room-3",
    label: "Room 3",
    capacity: 2,
    bedsSummary: "Sleeps 2",
    wing: "center",
    sortOrder: 3,
  },
  {
    id: "room-4",
    label: "Room 4",
    capacity: 4,
    bedsSummary: "Sleeps 4 (incl. pull-out couch)",
    detail: "Marked as photo room on the venue floor plan.",
    wing: "center",
    sortOrder: 4,
  },
  {
    id: "room-5",
    label: "Room 5",
    capacity: 4,
    bedsSummary: "Sleeps 4 (incl. pull-out couch)",
    wing: "center",
    sortOrder: 5,
  },
  {
    id: "room-6",
    label: "Room 6",
    capacity: 2,
    bedsSummary: "Sleeps 2",
    wing: "center",
    sortOrder: 6,
  },
  {
    id: "room-7",
    label: "Room 7",
    capacity: 2,
    bedsSummary: "Sleeps 2",
    wing: "center",
    sortOrder: 7,
  },
  {
    id: "room-8",
    label: "Room 8",
    capacity: 2,
    bedsSummary: "Sleeps 2",
    wing: "center",
    sortOrder: 8,
  },
  {
    id: "room-9",
    label: "Room 9",
    capacity: 2,
    bedsSummary: "Sleeps 2",
    wing: "lakeside",
    sortOrder: 9,
  },
  {
    id: "room-10",
    label: "Room 10",
    capacity: 4,
    bedsSummary: "Sleeps 4 (incl. pull-out couch)",
    detail:
      "King bedroom + queen pull-out in living room; kitchenette, Keurig, tub/shower; faces venue front.",
    wing: "front",
    sortOrder: 10,
  },
];

export const LODGING_ROOM_IDS = new Set(
  BELLA_COSA_LODGING_ROOMS.map((room) => room.id),
);

export function getBellaCosaRoom(id: string): BellaCosaRoom | undefined {
  return BELLA_COSA_LODGING_ROOMS.find((room) => room.id === id);
}
