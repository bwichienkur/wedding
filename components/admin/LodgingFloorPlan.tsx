"use client";

import {
  BELLA_COSA_FLOOR_HOTSPOTS,
  BELLA_COSA_FLOOR_IMAGE,
  BELLA_COSA_FLOOR_IMAGE_SIZE,
  type FloorPlanHotspot,
} from "@/data/bella-cosa-floor-plan";
import type { LodgingBoardRoom } from "@/lib/lodging/board";
import { cn } from "@/lib/cn";
import Image from "next/image";

export function LodgingFloorPlan({
  rooms,
  selectedRoomId,
  onSelectRoom,
}: {
  rooms: LodgingBoardRoom[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
}) {
  const roomById = new Map(rooms.map((room) => [room.id, room]));
  const aspect =
    BELLA_COSA_FLOOR_IMAGE_SIZE.width / BELLA_COSA_FLOOR_IMAGE_SIZE.height;

  return (
    <figure className="w-full">
      <div
        className="relative w-full overflow-hidden rounded-sm border border-white/12 bg-white shadow-sm touch-manipulation"
        style={{ aspectRatio: aspect }}
      >
        <Image
          src={BELLA_COSA_FLOOR_IMAGE}
          alt="Bella Cosa room layout from the venue lodging guide"
          fill
          sizes="(max-width: 1024px) 100vw, 640px"
          className="object-cover object-top"
          priority
        />

        {BELLA_COSA_FLOOR_HOTSPOTS.map((hotspot: FloorPlanHotspot) => {
          const room = roomById.get(hotspot.id);
          if (!room || hotspot.assignable === false) return null;

          const isSelected = selectedRoomId === hotspot.id;
          const over = room.isOverCapacity;

          return (
            <button
              key={hotspot.id}
              type="button"
              aria-label={`${room.label}, ${room.assignedCount} of ${room.capacity} beds`}
              aria-pressed={isSelected}
              onClick={() => onSelectRoom(room.id)}
              className={cn(
                "absolute box-border border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--admin-gold,#e8c872)]",
                over
                  ? "border-rose-300/80 bg-rose-500/25 hover:bg-rose-500/35"
                  : isSelected
                    ? "border-[var(--admin-gold-bright,#f5e6a8)] bg-[rgb(212_175_55/0.38)]"
                    : "border-[rgb(212_175_55/0.55)] bg-[rgb(212_175_55/0.12)] hover:bg-[rgb(212_175_55/0.22)]",
              )}
              style={{
                left: `${hotspot.leftPct}%`,
                top: `${hotspot.topPct}%`,
                width: `${hotspot.widthPct}%`,
                height: `${hotspot.heightPct}%`,
              }}
            >
              <span
                className={cn(
                  "absolute bottom-0.5 right-0.5 rounded-sm px-1 py-px text-[0.55rem] font-semibold leading-none shadow-sm",
                  over
                    ? "bg-rose-950/80 text-rose-100"
                    : "bg-[rgb(7_14_26/0.75)] text-[var(--admin-gold-bright,#f5e6a8)]",
                )}
              >
                {room.assignedCount}/{room.capacity}
              </span>
            </button>
          );
        })}
      </div>
      <figcaption
        className={cn(
          "mt-2 text-center text-xs text-[var(--admin-muted,#9aa8bc)]",
        )}
      >
        Same ROOM LAYOUT as your Bella Cosa lodging guide — tap a room box to
        assign guests. Gold highlights show selection; the badge is beds filled.
      </figcaption>
    </figure>
  );
}
