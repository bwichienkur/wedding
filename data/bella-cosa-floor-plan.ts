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

/** Wide viewBox — proportions follow the venue guide map (lakeside top). */
const VIEWBOX = { width: 200, height: 132 };

export const BELLA_COSA_FLOOR_VIEWBOX = VIEWBOX;

/** Building shell (visual only). */
export const FLOOR_PLAN_OUTLINE = {
  x: 6,
  y: 14,
  w: 188,
  h: 108,
  rx: 3,
};

/** Interior courtyard / hallway from the guide schematic. */
export const FLOOR_PLAN_COURTYARD = {
  x: 78,
  y: 74,
  w: 68,
  h: 34,
};

/**
 * Room positions aligned to the PDF floor plan:
 * lakeside row (9, 8), honeymoon corner, middle band (7–2), front row (1, 10).
 */
export const BELLA_COSA_FLOOR_RECTS: FloorPlanRect[] = [
  { id: "sauna", label: "Sauna", x: 10, y: 20, w: 22, h: 16, assignable: false },
  { id: "room-9", label: "Rm 9", x: 36, y: 18, w: 28, h: 20 },
  { id: "room-8", label: "Rm 8", x: 66, y: 18, w: 28, h: 20 },

  { id: "honeymoon", label: "Honeymoon", x: 148, y: 16, w: 42, h: 24 },

  { id: "room-7", label: "Rm 7", x: 10, y: 44, w: 24, h: 22 },
  { id: "room-6", label: "Rm 6", x: 36, y: 44, w: 24, h: 22 },
  { id: "room-5", label: "Rm 5", x: 62, y: 44, w: 26, h: 22 },
  { id: "room-4", label: "Rm 4", x: 90, y: 44, w: 26, h: 22 },
  { id: "room-3", label: "Rm 3", x: 118, y: 44, w: 24, h: 22 },
  { id: "room-2", label: "Rm 2", x: 144, y: 44, w: 46, h: 22 },

  { id: "room-1", label: "Rm 1", x: 10, y: 74, w: 62, h: 40 },
  { id: "room-10", label: "Rm 10", x: 76, y: 74, w: 42, h: 40 },

  {
    id: "getting-ready",
    label: "Getting ready",
    x: 148,
    y: 48,
    w: 42,
    h: 34,
    assignable: false,
  },
  {
    id: "housekeeping",
    label: "Housekeeping",
    x: 148,
    y: 86,
    w: 42,
    h: 18,
    assignable: false,
  },
  {
    id: "stairs",
    label: "Stairs",
    x: 124,
    y: 74,
    w: 20,
    h: 18,
    assignable: false,
  },
  {
    id: "exit-west",
    label: "W exit",
    x: 2,
    y: 52,
    w: 6,
    h: 28,
    assignable: false,
  },
  {
    id: "exit-east",
    label: "E exit",
    x: 192,
    y: 52,
    w: 6,
    h: 28,
    assignable: false,
  },
];

export const FLOOR_PLAN_LABELS = {
  lakeside: { x: 100, y: 10, text: "Lakeside" },
  front: { x: 100, y: 128, text: "Front of building" },
} as const;
