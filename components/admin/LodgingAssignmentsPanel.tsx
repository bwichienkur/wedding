"use client";

import { LodgingFloorPlan } from "@/components/admin/LodgingFloorPlan";
import { LodgingRoomPanel } from "@/components/admin/LodgingRoomPanel";
import { Button } from "@/components/ui/Button";
import {
  adminAlertErrorClass,
  adminCardClass,
  adminLabelClass,
  adminMutedClass,
  adminToolbarControlClass,
  adminToolbarSelectClass,
} from "@/components/admin/admin-styles";
import type { LodgingBoard, LodgingBoardRoom } from "@/lib/lodging/board";
import { cn } from "@/lib/cn";
import { useCallback, useEffect, useMemo, useState } from "react";

const VIEW_MODES = [
  { value: "floor", label: "Floor plan" },
  { value: "list", label: "Room list" },
] as const;

type ViewMode = (typeof VIEW_MODES)[number]["value"];

function wingLabel(wing: LodgingBoardRoom["wing"]): string | null {
  if (wing === "lakeside") return "Lakeside";
  if (wing === "front") return "Front of building";
  if (wing === "center") return "Center";
  return null;
}

export function LodgingAssignmentsPanel() {
  const [board, setBoard] = useState<LodgingBoard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [query, setQuery] = useState("");
  const [roomGuestQuery, setRoomGuestQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("floor");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [pickGuestForRoom, setPickGuestForRoom] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/admin/lodging", { cache: "no-store" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Could not load lodging board");
      }
      const data = (await response.json()) as LodgingBoard;
      setBoard(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load lodging board",
      );
    } finally {
      setPending(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only data fetch
    void load();
  }, [load]);

  const mutate = useCallback(
    async (body: Record<string, unknown>) => {
      setError(null);
      setPending(true);
      try {
        const response = await fetch("/api/admin/lodging", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const payload = (await response.json().catch(() => null)) as
          | (LodgingBoard & { error?: string })
          | { error?: string }
          | null;
        if (!response.ok) {
          throw new Error(payload?.error ?? "Update failed");
        }
        if (payload && "rooms" in payload) {
          setBoard(payload);
        }
        setPickGuestForRoom(null);
      } catch (patchError) {
        setError(
          patchError instanceof Error ? patchError.message : "Update failed",
        );
      } finally {
        setPending(false);
      }
    },
    [],
  );

  const filteredUnassigned = useMemo(() => {
    if (!board) return [];
    const q = query.trim().toLowerCase();
    if (!q) return board.unassigned;
    return board.unassigned.filter(
      (guest) =>
        guest.fullName.toLowerCase().includes(q) ||
        guest.householdName.toLowerCase().includes(q),
    );
  }, [board, query]);

  const selectedRoom = useMemo(
    () => board?.rooms.find((room) => room.id === selectedRoomId) ?? null,
    [board, selectedRoomId],
  );

  const totalCapacity = useMemo(
    () => board?.rooms.reduce((sum, room) => sum + room.capacity, 0) ?? 0,
    [board],
  );

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
    setRoomGuestQuery("");
    setViewMode("floor");
  };

  return (
    <div className="flex flex-col gap-6">
      <section className={adminCardClass}>
        <p className={adminLabelClass}>Bella Cosa on-site rooms</p>
        <p className={cn(adminMutedClass, "mt-2 max-w-3xl")}>
          Interactive map based on the Bella Cosa lodging guide PDF (lakeside at
          top, front at bottom, rooms 1–10 and honeymoon). Assign anyone on your
          invitation list — RSVP status is a hint only.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-[var(--admin-body,#d4dce8)]">
          <span>
            <strong className="text-[var(--admin-gold-bright,#f5e6a8)]">
              {board?.assignedCount ?? "—"}
            </strong>
            /{board?.totalGuests ?? "—"} invited guests assigned
          </span>
          <span className="text-[var(--admin-muted,#9aa8bc)]">·</span>
          <span>{totalCapacity} total beds on site</span>
          {(board?.overCapacityRoomIds.length ?? 0) > 0 ? (
            <>
              <span className="text-[var(--admin-muted,#9aa8bc)]">·</span>
              <span className="text-rose-200/90">
                {board!.overCapacityRoomIds.length} room
                {board!.overCapacityRoomIds.length === 1 ? "" : "s"} over
                capacity
              </span>
            </>
          ) : null}
        </div>
        <div
          className="mt-4 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Lodging view"
        >
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              role="tab"
              aria-selected={viewMode === mode.value}
              className={cn(
                "min-h-9 rounded-sm px-3 py-1.5 text-xs uppercase tracking-[0.12em]",
                viewMode === mode.value
                  ? "bg-[rgb(212_175_55/0.18)] text-[var(--admin-gold-bright,#f5e6a8)]"
                  : "text-[var(--admin-muted,#9aa8bc)] hover:bg-white/5",
              )}
              onClick={() => setViewMode(mode.value)}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </section>

      {error ? <div className={adminAlertErrorClass}>{error}</div> : null}

      {viewMode === "floor" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section className={adminCardClass}>
            {board ? (
              <LodgingFloorPlan
                rooms={board.rooms}
                selectedRoomId={selectedRoomId}
                onSelectRoom={handleSelectRoom}
              />
            ) : (
              <p className={adminMutedClass}>Loading floor plan…</p>
            )}
          </section>
          {selectedRoom ? (
            <LodgingRoomPanel
              room={selectedRoom}
              unassigned={board?.unassigned ?? []}
              pending={pending}
              guestQuery={roomGuestQuery}
              onGuestQueryChange={setRoomGuestQuery}
              onClose={() => setSelectedRoomId(null)}
              onAssign={(guestId) =>
                void mutate({
                  action: "assign",
                  guestId,
                  roomId: selectedRoom.id,
                })
              }
              onUnassign={(guestId) =>
                void mutate({ action: "unassign", guestId })
              }
            />
          ) : (
            <section className={cn(adminCardClass, "flex items-center justify-center !py-12")}>
              <p className={cn(adminMutedClass, "text-center text-sm")}>
                Select a room on the floor plan to add or remove guests.
              </p>
            </section>
          )}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <section className={adminCardClass}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className={adminLabelClass}>Unassigned</p>
                <p className={cn(adminMutedClass, "mt-1 text-xs")}>
                  {filteredUnassigned.length} guest
                  {filteredUnassigned.length === 1 ? "" : "s"}
                </p>
              </div>
              <input
                type="search"
                placeholder="Search name or invitation"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={cn(adminToolbarControlClass, "max-w-[14rem]")}
                aria-label="Search unassigned guests"
              />
            </div>
            <ul className="mt-4 max-h-[28rem] space-y-2 overflow-y-auto">
              {filteredUnassigned.length === 0 ? (
                <li className={adminMutedClass}>Everyone is assigned.</li>
              ) : (
                filteredUnassigned.map((guest) => (
                  <li
                    key={guest.guestId}
                    className="rounded-sm border border-white/10 bg-white/[0.03] px-3 py-2"
                  >
                    <p className="text-sm text-[var(--admin-body,#d4dce8)]">
                      {guest.fullName}
                    </p>
                    <p className="text-xs text-[var(--admin-muted,#9aa8bc)]">
                      {guest.householdName}
                    </p>
                    <label className="mt-2 flex flex-col gap-1">
                      <span className="sr-only">Assign {guest.fullName}</span>
                      <select
                        className={adminToolbarSelectClass}
                        disabled={pending}
                        defaultValue=""
                        onChange={(event) => {
                          const roomId = event.target.value;
                          if (!roomId) return;
                          void mutate({
                            action: "assign",
                            guestId: guest.guestId,
                            roomId,
                          });
                          event.target.value = "";
                        }}
                      >
                        <option value="">Add to room…</option>
                        {board?.rooms.map((room) => (
                          <option
                            key={room.id}
                            value={room.id}
                            disabled={room.bedsRemaining === 0}
                          >
                            {room.label} ({room.bedsRemaining} bed
                            {room.bedsRemaining === 1 ? "" : "s"} left)
                          </option>
                        ))}
                      </select>
                    </label>
                  </li>
                ))
              )}
            </ul>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {board?.rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                pending={pending}
                picking={pickGuestForRoom === room.id}
                unassigned={filteredUnassigned}
                onOpen={() => handleSelectRoom(room.id)}
                onPick={() =>
                  setPickGuestForRoom((current) =>
                    current === room.id ? null : room.id,
                  )
                }
                onAssign={(guestId) =>
                  void mutate({ action: "assign", guestId, roomId: room.id })
                }
                onUnassign={(guestId) =>
                  void mutate({ action: "unassign", guestId })
                }
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => void load()}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}

function RoomCard({
  room,
  pending,
  picking,
  unassigned,
  onOpen,
  onPick,
  onAssign,
  onUnassign,
}: {
  room: LodgingBoardRoom;
  pending: boolean;
  picking: boolean;
  unassigned: LodgingBoard["unassigned"];
  onOpen: () => void;
  onPick: () => void;
  onAssign: (guestId: string) => void;
  onUnassign: (guestId: string) => void;
}) {
  const wing = wingLabel(room.wing);

  return (
    <article
      className={cn(
        adminCardClass,
        "flex flex-col gap-3 !py-4",
        room.isOverCapacity && "border-rose-400/40 ring-1 ring-rose-400/25",
      )}
    >
      <header>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <button
            type="button"
            className="text-left font-display text-lg text-[var(--admin-gold-bright,#f5e6a8)] hover:underline"
            onClick={onOpen}
          >
            {room.label}
          </button>
          <span
            className={cn(
              "text-xs uppercase tracking-[0.12em]",
              room.isOverCapacity
                ? "text-rose-200/90"
                : "text-[var(--admin-muted,#9aa8bc)]",
            )}
          >
            {room.assignedCount}/{room.capacity} beds
          </span>
        </div>
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
      </header>

      <ul className="min-h-[2.5rem] space-y-1.5">
        {room.guests.length === 0 ? (
          <li className="text-xs text-[var(--admin-muted,#9aa8bc)]">Empty</li>
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
        <div className="mt-auto border-t border-white/10 pt-3">
          {picking ? (
            <select
              className={cn(adminToolbarSelectClass, "w-full")}
              disabled={pending}
              defaultValue=""
              onChange={(event) => {
                const guestId = event.target.value;
                if (!guestId) return;
                onAssign(guestId);
                event.target.value = "";
              }}
            >
              <option value="">Choose guest…</option>
              {unassigned.map((guest) => (
                <option key={guest.guestId} value={guest.guestId}>
                  {guest.fullName} ({guest.householdName})
                </option>
              ))}
            </select>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="w-full !text-xs"
              disabled={pending || unassigned.length === 0}
              onClick={onPick}
            >
              Add guest
            </Button>
          )}
        </div>
      ) : null}
    </article>
  );
}
