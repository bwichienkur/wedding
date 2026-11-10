"use client";

import { Button } from "@/components/ui/Button";
import {
  adminCardClass,
  adminMutedClass,
  adminToolbarControlClass,
  adminToolbarSelectClass,
} from "@/components/admin/admin-styles";
import type { LodgingBoard, LodgingBoardGuest, LodgingBoardRoom } from "@/lib/lodging/board";
import { cn } from "@/lib/cn";

function wingLabel(wing: LodgingBoardRoom["wing"]): string | null {
  if (wing === "lakeside") return "Lakeside";
  if (wing === "front") return "Front of building";
  if (wing === "center") return "Center";
  return null;
}

function rsvpHint(guest: LodgingBoardGuest): string | null {
  const ceremony =
    guest.ceremonyAttending === "yes"
      ? "Ceremony"
      : guest.ceremonyAttending === "no"
        ? null
        : "Ceremony ?";
  const welcome =
    guest.welcomeAttending === "yes"
      ? "Welcome"
      : guest.welcomeAttending === "no"
        ? null
        : "Welcome ?";
  const parts = [ceremony, welcome].filter(Boolean);
  if (parts.length === 0) return "RSVP not accepted";
  return parts.join(" · ");
}

export function LodgingRoomPanel({
  room,
  unassigned,
  pending,
  guestQuery,
  onGuestQueryChange,
  onClose,
  onAssign,
  onUnassign,
}: {
  room: LodgingBoardRoom;
  unassigned: LodgingBoard["unassigned"];
  pending: boolean;
  guestQuery: string;
  onGuestQueryChange: (value: string) => void;
  onClose: () => void;
  onAssign: (guestId: string) => void;
  onUnassign: (guestId: string) => void;
}) {
  const wing = wingLabel(room.wing);
  const q = guestQuery.trim().toLowerCase();
  const pickList = unassigned.filter(
    (guest) =>
      !q ||
      guest.fullName.toLowerCase().includes(q) ||
      guest.householdName.toLowerCase().includes(q),
  );

  return (
    <aside
      className={cn(
        adminCardClass,
        "flex max-h-[min(32rem,70vh)] flex-col gap-4 overflow-hidden !py-4 lg:sticky lg:top-4",
        room.isOverCapacity && "border-rose-400/40 ring-1 ring-rose-400/25",
      )}
      role="region"
      aria-label={`${room.label} assignments`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl text-[var(--admin-gold-bright,#f5e6a8)]">
            {room.label}
          </h3>
          <p
            className={cn(
              "mt-1 text-xs uppercase tracking-[0.12em]",
              room.isOverCapacity
                ? "text-rose-200/90"
                : "text-[var(--admin-muted,#9aa8bc)]",
            )}
          >
            {room.assignedCount}/{room.capacity} beds
          </p>
          <p className="mt-1 text-xs text-[var(--admin-body,#d4dce8)]">
            {room.bedsSummary}
          </p>
          {wing ? (
            <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.14em] text-[var(--admin-muted,#9aa8bc)]">
              {wing}
            </p>
          ) : null}
          {room.detail ? (
            <p className={cn(adminMutedClass, "mt-2 text-xs leading-relaxed")}>
              {room.detail}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-xs uppercase tracking-wide text-[var(--admin-muted,#9aa8bc)] hover:text-[var(--admin-body,#d4dce8)]"
        >
          Close
        </button>
      </header>

      <ul className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
        {room.guests.length === 0 ? (
          <li className="text-xs text-[var(--admin-muted,#9aa8bc)]">
            No guests assigned yet.
          </li>
        ) : (
          room.guests.map((guest) => (
            <li
              key={guest.guestId}
              className="flex items-center justify-between gap-2 rounded-sm border border-white/8 bg-white/[0.04] px-2 py-1.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-[var(--admin-body,#d4dce8)]">
                  {guest.fullName}
                </p>
                <p className="truncate text-[0.65rem] text-[var(--admin-muted,#9aa8bc)]">
                  {guest.householdName}
                </p>
                <p className="text-[0.6rem] text-[var(--admin-muted,#9aa8bc)]">
                  {rsvpHint(guest)}
                </p>
              </div>
              <button
                type="button"
                disabled={pending}
                className="shrink-0 text-[0.65rem] uppercase tracking-wide text-[var(--admin-muted,#9aa8bc)] hover:text-rose-200/90"
                onClick={() => onUnassign(guest.guestId)}
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>

      {room.bedsRemaining > 0 ? (
        <div className="shrink-0 border-t border-white/10 pt-3">
          <label className="flex flex-col gap-2">
            <span className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--admin-gold,#e8c872)]">
              Add guest
            </span>
            <input
              type="search"
              placeholder="Search all invited guests"
              value={guestQuery}
              onChange={(event) => onGuestQueryChange(event.target.value)}
              className={adminToolbarControlClass}
            />
            <select
              className={adminToolbarSelectClass}
              disabled={pending || pickList.length === 0}
              defaultValue=""
              onChange={(event) => {
                const guestId = event.target.value;
                if (!guestId) return;
                onAssign(guestId);
                event.target.value = "";
              }}
            >
              <option value="">
                {pickList.length === 0 ? "No matching guests" : "Choose guest…"}
              </option>
              {pickList.map((guest) => (
                <option key={guest.guestId} value={guest.guestId}>
                  {guest.fullName} ({guest.householdName})
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : (
        <p className="text-xs text-rose-200/80">Room is at capacity.</p>
      )}

      <Button type="button" variant="secondary" className="!text-xs" onClick={onClose}>
        Back to floor plan
      </Button>
    </aside>
  );
}
