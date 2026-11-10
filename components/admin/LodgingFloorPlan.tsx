"use client";

import {
  BELLA_COSA_FLOOR_RECTS,
  BELLA_COSA_FLOOR_VIEWBOX,
  FLOOR_PLAN_LABELS,
  type FloorPlanRect,
} from "@/data/bella-cosa-floor-plan";
import type { LodgingBoardRoom } from "@/lib/lodging/board";
import { cn } from "@/lib/cn";

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

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${BELLA_COSA_FLOOR_VIEWBOX.width} ${BELLA_COSA_FLOOR_VIEWBOX.height}`}
        role="img"
        aria-label="Bella Cosa lodging floor plan"
        className="h-auto w-full rounded-sm border border-white/12 bg-[rgb(4_12_24/0.85)]"
      >
        <text
          x={FLOOR_PLAN_LABELS.lakeside.x}
          y={FLOOR_PLAN_LABELS.lakeside.y}
          textAnchor="middle"
          className="fill-[var(--admin-muted,#9aa8bc)] text-[3px] uppercase tracking-[0.2em]"
        >
          {FLOOR_PLAN_LABELS.lakeside.text}
        </text>

        {BELLA_COSA_FLOOR_RECTS.map((rect: FloorPlanRect) => {
          const room = roomById.get(rect.id);
          const assignable = rect.assignable !== false && Boolean(room);
          const isSelected = selectedRoomId === rect.id;
          const over = room?.isOverCapacity;

          const fill = !assignable
            ? "rgb(30 40 55 / 0.55)"
            : over
              ? "rgb(120 40 50 / 0.45)"
              : isSelected
                ? "rgb(212 175 55 / 0.28)"
                : "rgb(212 175 55 / 0.12)";

          const stroke = !assignable
            ? "rgb(255 255 255 / 0.15)"
            : over
              ? "rgb(251 180 180 / 0.55)"
              : isSelected
                ? "rgb(245 230 168 / 0.9)"
                : "rgb(232 200 114 / 0.45)";

          const body = (
            <>
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.w}
                height={rect.h}
                rx={1.2}
                ry={1.2}
                fill={fill}
                stroke={stroke}
                strokeWidth={isSelected ? 0.6 : 0.35}
              />
              <text
                x={rect.x + rect.w / 2}
                y={rect.y + rect.h * 0.38}
                textAnchor="middle"
                className="fill-[var(--admin-gold-bright,#f5e6a8)] text-[4px] font-medium"
              >
                {rect.label}
              </text>
              {room ? (
                <text
                  x={rect.x + rect.w / 2}
                  y={rect.y + rect.h * 0.62}
                  textAnchor="middle"
                  className="fill-[var(--admin-body,#d4dce8)] text-[3px]"
                >
                  {room.assignedCount}/{room.capacity}
                </text>
              ) : null}
            </>
          );

          if (!assignable || !room) {
            return <g key={rect.id}>{body}</g>;
          }

          return (
            <g key={rect.id}>
              <button
                type="button"
                aria-label={`${room.label}, ${room.assignedCount} of ${room.capacity} beds filled`}
                aria-pressed={isSelected}
                className="cursor-pointer border-0 bg-transparent p-0"
                onClick={() => onSelectRoom(room.id)}
              >
                {body}
              </button>
            </g>
          );
        })}

        <text
          x={FLOOR_PLAN_LABELS.front.x}
          y={FLOOR_PLAN_LABELS.front.y}
          textAnchor="middle"
          className="fill-[var(--admin-muted,#9aa8bc)] text-[3px] uppercase tracking-[0.2em]"
        >
          {FLOOR_PLAN_LABELS.front.text}
        </text>
      </svg>
      <figcaption className={cn("mt-2 text-center text-xs text-[var(--admin-muted,#9aa8bc)]")}>
        Tap a room to assign guests. Gold cells are guest rooms; gray areas match
        the venue map (sauna, getting ready, etc.).
      </figcaption>
    </figure>
  );
}
