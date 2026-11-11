/**
 * Click targets on the venue’s ROOM LAYOUT image (percent of image box).
 * Image: `public/images/admin/bella-cosa-room-layout.jpg` (cropped from the guide).
 */

export interface FloorPlanHotspot {
  id: string;
  leftPct: number;
  topPct: number;
  widthPct: number;
  heightPct: number;
  assignable?: boolean;
}

export const BELLA_COSA_FLOOR_IMAGE = "/images/admin/bella-cosa-room-layout.jpg";

/** Pixel size of the cropped guide asset (for aspect ratio). */
export const BELLA_COSA_FLOOR_IMAGE_SIZE = { width: 1120, height: 1180 };

/**
 * Hotspots hand-aligned to the printed #1–#10 boxes on the guide scan.
 * Non-guest areas (stairs, sauna, etc.) are omitted — they appear on the art only.
 */
export const BELLA_COSA_FLOOR_HOTSPOTS: FloorPlanHotspot[] = [
  { id: "room-2", leftPct: 4.5, topPct: 19, widthPct: 23, heightPct: 31 },
  { id: "room-1", leftPct: 3.5, topPct: 55, widthPct: 27.5, heightPct: 27 },
  { id: "room-3", leftPct: 28.5, topPct: 17.5, widthPct: 11.5, heightPct: 26 },
  { id: "room-4", leftPct: 40.5, topPct: 16.5, widthPct: 12.5, heightPct: 27.5 },
  { id: "room-5", leftPct: 53.5, topPct: 16, widthPct: 14.5, heightPct: 28.5 },
  { id: "honeymoon", leftPct: 63.5, topPct: 13.5, widthPct: 24.5, heightPct: 12.5 },
  { id: "room-6", leftPct: 57.5, topPct: 28.5, widthPct: 13.5, heightPct: 18.5 },
  { id: "room-7", leftPct: 71.5, topPct: 27.5, widthPct: 12.5, heightPct: 17 },
  { id: "room-8", leftPct: 71.5, topPct: 44.5, widthPct: 12.5, heightPct: 14 },
  { id: "room-10", leftPct: 30.5, topPct: 54.5, widthPct: 15.5, heightPct: 25 },
  { id: "room-9", leftPct: 46.5, topPct: 56, widthPct: 13.5, heightPct: 23.5 },
];
