/** SVG placement for the Bella Cosa lodging floor plan (admin). */

export interface FloorPlanRect {
  /** Room id from {@link BELLA_COSA_LODGING_ROOMS} or a non-room label id. */
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** When false, not clickable (sauna, exits, etc.). */
  assignable?: boolean;
}

const VIEWBOX = { width: 100, height: 118 };

export const BELLA_COSA_FLOOR_VIEWBOX = VIEWBOX;

/** Approximate layout from the venue guide (lakeside top, front bottom). */
export const BELLA_COSA_FLOOR_RECTS: FloorPlanRect[] = [
  { id: "sauna", label: "Sauna", x: 2, y: 2, w: 12, h: 10, assignable: false },
  { id: "room-9", label: "9", x: 16, y: 2, w: 14, h: 14 },
  { id: "room-8", label: "8", x: 32, y: 2, w: 14, h: 14 },
  {
    id: "getting-ready",
    label: "Getting ready",
    x: 48,
    y: 2,
    w: 22,
    h: 14,
    assignable: false,
  },
  { id: "honeymoon", label: "Honeymoon", x: 72, y: 2, w: 26, h: 16 },

  { id: "room-7", label: "7", x: 2, y: 20, w: 12, h: 14 },
  { id: "room-6", label: "6", x: 16, y: 20, w: 12, h: 14 },
  { id: "room-5", label: "5", x: 30, y: 20, w: 14, h: 14 },
  { id: "room-4", label: "4", x: 46, y: 20, w: 14, h: 14 },
  { id: "room-3", label: "3", x: 62, y: 20, w: 12, h: 14 },
  { id: "room-2", label: "2", x: 76, y: 20, w: 22, h: 14 },

  { id: "room-1", label: "1", x: 2, y: 40, w: 38, h: 22 },
  { id: "room-10", label: "10", x: 42, y: 40, w: 28, h: 22 },
  {
    id: "housekeeping",
    label: "Housekeeping",
    x: 72,
    y: 40,
    w: 26,
    h: 14,
    assignable: false,
  },
  {
    id: "stairs",
    label: "Stairs",
    x: 72,
    y: 56,
    w: 26,
    h: 8,
    assignable: false,
  },
];

export const FLOOR_PLAN_LABELS = {
  lakeside: { x: 50, y: 1, text: "Lakeside" },
  front: { x: 50, y: 115, text: "Front of building" },
} as const;
