"use client";

import {
  BELLA_COSA_FLOOR_RECTS,
  BELLA_COSA_FLOOR_VIEWBOX,
  FLOOR_PLAN_COURTYARD,
  FLOOR_PLAN_LABELS,
  FLOOR_PLAN_OUTLINE,
  type FloorPlanRect,
} from "@/data/bella-cosa-floor-plan";
import type { LodgingBoardRoom } from "@/lib/lodging/board";
import { cn } from "@/lib/cn";

const LABEL_FILL = "#f5e6a8";
const BODY_FILL = "#d4dce8";
const MUTED_FILL = "#9aa8bc";

function handleRoomKeyDown(
  event: React.KeyboardEvent,
  roomId: string,
  onSelectRoom: (id: string) => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelectRoom(roomId);
  }
}

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
        className="h-auto min-h-[14rem] w-full rounded-sm border border-white/12 bg-[rgb(4_12_24/0.85)] touch-manipulation"
      >
        <text
          x={FLOOR_PLAN_LABELS.lakeside.x}
          y={FLOOR_PLAN_LABELS.lakeside.y}
          textAnchor="middle"
          fill={MUTED_FILL}
          fontSize={7}
          letterSpacing="0.12em"
        >
          {FLOOR_PLAN_LABELS.lakeside.text.toUpperCase()}
        </text>

        <rect
          x={FLOOR_PLAN_OUTLINE.x}
          y={FLOOR_PLAN_OUTLINE.y}
          width={FLOOR_PLAN_OUTLINE.w}
          height={FLOOR_PLAN_OUTLINE.h}
          rx={FLOOR_PLAN_OUTLINE.rx}
          fill="rgb(8 18 32 / 0.6)"
          stroke="rgb(232 200 114 / 0.25)"
          strokeWidth={0.75}
        />

        <rect
          x={FLOOR_PLAN_COURTYARD.x}
          y={FLOOR_PLAN_COURTYARD.y}
          width={FLOOR_PLAN_COURTYARD.w}
          height={FLOOR_PLAN_COURTYARD.h}
          fill="rgb(4 12 24 / 0.35)"
          stroke="rgb(255 255 255 / 0.08)"
          strokeWidth={0.5}
          strokeDasharray="2 1.5"
        />

        {BELLA_COSA_FLOOR_RECTS.map((rect: FloorPlanRect) => {
          const room = roomById.get(rect.id);
          const assignable = rect.assignable !== false && Boolean(room);
          const isSelected = selectedRoomId === rect.id;
          const over = room?.isOverCapacity;

          const fill = !assignable
            ? "rgb(42 52 68 / 0.85)"
            : over
              ? "rgb(120 48 56 / 0.75)"
              : isSelected
                ? "rgb(212 175 55 / 0.45)"
                : "rgb(212 175 55 / 0.22)";

          const stroke = !assignable
            ? "rgb(255 255 255 / 0.18)"
            : over
              ? "rgb(251 160 160 / 0.75)"
              : isSelected
                ? "rgb(245 230 168 / 0.95)"
                : "rgb(232 200 114 / 0.65)";

          const titleFill = assignable ? LABEL_FILL : MUTED_FILL;
          const fontSize =
            rect.w < 18 ? 5.5 : rect.label.length > 8 ? 5 : 6.5;

          const shapes = (
            <>
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.w}
                height={rect.h}
                rx={1.5}
                ry={1.5}
                fill={fill}
                stroke={stroke}
                strokeWidth={isSelected ? 1 : 0.6}
              />
              <text
                x={rect.x + rect.w / 2}
                y={rect.y + rect.h * (room ? 0.4 : 0.55)}
                textAnchor="middle"
                fill={titleFill}
                fontSize={fontSize}
                fontWeight={600}
              >
                {rect.label}
              </text>
              {room ? (
                <text
                  x={rect.x + rect.w / 2}
                  y={rect.y + rect.h * 0.68}
                  textAnchor="middle"
                  fill={BODY_FILL}
                  fontSize={6}
                >
                  {room.assignedCount}/{room.capacity} beds
                </text>
              ) : null}
            </>
          );

          if (!assignable || !room) {
            return <g key={rect.id}>{shapes}</g>;
          }

          return (
            <g
              key={rect.id}
              role="button"
              tabIndex={0}
              aria-label={`${room.label}, ${room.assignedCount} of ${room.capacity} beds filled`}
              aria-pressed={isSelected}
              style={{ cursor: "pointer" }}
              onClick={() => onSelectRoom(room.id)}
              onKeyDown={(event) =>
                handleRoomKeyDown(event, room.id, onSelectRoom)
              }
            >
              {shapes}
            </g>
          );
        })}

        <text
          x={FLOOR_PLAN_LABELS.front.x}
          y={FLOOR_PLAN_LABELS.front.y}
          textAnchor="middle"
          fill={MUTED_FILL}
          fontSize={7}
          letterSpacing="0.12em"
        >
          {FLOOR_PLAN_LABELS.front.text.toUpperCase()}
        </text>
      </svg>
      <figcaption
        className={cn(
          "mt-2 text-center text-xs text-[var(--admin-muted,#9aa8bc)]",
        )}
      >
        Gold boxes are guest rooms (tap to assign). Gray areas match the venue
        guide — sauna, getting ready, exits, and stairs.
      </figcaption>
    </figure>
  );
}
