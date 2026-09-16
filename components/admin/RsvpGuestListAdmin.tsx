"use client";

import { Button } from "@/components/ui/Button";
import {
  adminCardClass,
  adminFieldClass,
  adminLabelClass,
  adminMutedClass,
  adminTableClass,
  adminTableFootClass,
  adminTableShellClass,
  adminTdClass,
  adminThClass,
} from "@/components/admin/admin-styles";
import { cn } from "@/lib/cn";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

interface GuestRow {
  id: string;
  fullName: string;
  isChild: boolean;
  isPlusOne: boolean;
  sortOrder: number;
}

interface HouseholdRow {
  id: string;
  displayName: string;
  email: string | null;
  rsvpStatus: string;
  invitationCodeHint: string | null;
  notesAdmin: string;
  maxPlusOnes: number;
  updatedAt: string;
  guests: GuestRow[];
}

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

function guestAllowance(household: Pick<HouseholdRow, "guests" | "maxPlusOnes">) {
  return household.guests.length + (household.maxPlusOnes ?? 0);
}

const compactFieldClass =
  "admin-input w-full rounded-sm px-2 py-1 text-xs leading-tight outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--admin-gold,#e8c872)]";

const tableBtnClass =
  "!min-h-7 !px-2 !py-0.5 !text-[0.625rem] !tracking-normal !normal-case md:!text-xs";

function rsvpStatusClass(status: string) {
  switch (status) {
    case "complete":
      return "border-emerald-400/35 bg-emerald-950/40 text-emerald-100/90";
    case "partial":
      return "border-amber-400/35 bg-amber-950/35 text-amber-100/90";
    case "declined":
      return "border-rose-400/35 bg-rose-950/40 text-rose-100/90";
    default:
      return "border-white/12 bg-white/5 text-[var(--admin-muted,#9aa8bc)]";
  }
}

export function RsvpGuestListAdmin() {
  const [households, setHouseholds] = useState<HouseholdRow[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const [newDisplayName, setNewDisplayName] = useState("");
  const [newGuestNames, setNewGuestNames] = useState("");
  const [newCode, setNewCode] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/rsvp/guest-list");
    if (!response.ok) {
      setError("Unable to load guest list.");
      return;
    }
    const data = (await response.json()) as { households: HouseholdRow[] };
    setHouseholds(data.households);
    setError(null);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only data fetch
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return households;
    return households.filter(
      (household) =>
        household.displayName.toLowerCase().includes(q) ||
        household.guests.some((guest) =>
          guest.fullName.toLowerCase().includes(q),
        ),
    );
  }, [households, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageIndex = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageIndex, pageSize]);

  const rangeStart = filtered.length === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const rangeEnd = Math.min(pageIndex * pageSize, filtered.length);

  async function createHousehold() {
    const guestNames = newGuestNames
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (!newDisplayName.trim() || guestNames.length === 0) {
      setError("Enter a household name and at least one guest (one per line).");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/rsvp/households", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: newDisplayName.trim(),
          guestNames,
          invitationCode: newCode.trim() || null,
        }),
      });
      if (!response.ok) {
        setError("Unable to create household.");
        return;
      }
      setNewDisplayName("");
      setNewGuestNames("");
      setNewCode("");
      await load();
    } finally {
      setPending(false);
    }
  }

  async function deleteHousehold(id: string, name: string) {
    if (
      !window.confirm(
        `Remove invitation “${name}” and all guests? This cannot be undone.`,
      )
    ) {
      return;
    }
    setPending(true);
    try {
      const response = await fetch(`/api/admin/rsvp/households/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) setError("Unable to delete household.");
      else {
        if (expandedId === id) setExpandedId(null);
        await load();
      }
    } finally {
      setPending(false);
    }
  }

  async function saveHousehold(
    id: string,
    patch: { displayName?: string; guestAllowance?: number },
  ) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/rsvp/households/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) {
        setError("Unable to save household.");
        return false;
      }
      await load();
      return true;
    } finally {
      setPending(false);
    }
  }

  async function updateGuestName(guestId: string, fullName: string) {
    const trimmed = fullName.trim();
    if (!trimmed) return false;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/rsvp/guests/${guestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: trimmed }),
      });
      if (!response.ok) {
        setError("Unable to update guest name.");
        return false;
      }
      await load();
      return true;
    } finally {
      setPending(false);
    }
  }

  async function addGuest(householdId: string, fullName: string) {
    if (!fullName.trim()) return;
    setPending(true);
    try {
      const response = await fetch(
        `/api/admin/rsvp/households/${householdId}/guests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName: fullName.trim() }),
        },
      );
      if (!response.ok) setError("Unable to add guest.");
      else await load();
    } finally {
      setPending(false);
    }
  }

  async function removeGuest(guestId: string, name: string) {
    if (!window.confirm(`Remove ${name} from this invitation?`)) return;
    setPending(true);
    try {
      const response = await fetch(`/api/admin/rsvp/guests/${guestId}`, {
        method: "DELETE",
      });
      if (!response.ok) setError("Unable to remove guest.");
      else await load();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <details className={`${adminCardClass} group !py-3 md:!py-5`}>
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg text-[var(--admin-gold-bright,#f5e6a8)] md:text-xl">
              Add invitation
            </h2>
            <span className={`text-xs ${adminMutedClass} group-open:hidden`}>Show</span>
            <span className={`hidden text-xs ${adminMutedClass} group-open:inline`}>Hide</span>
          </div>
        </summary>
        <p className={`mt-2 text-xs md:text-sm ${adminMutedClass}`}>
          One row per guest name. Codes are optional — leave blank to auto-generate.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 md:mt-4 md:gap-4">
          <label className="block text-sm sm:col-span-2">
            <span className={`mb-1 block md:mb-2 ${adminLabelClass}`}>Household label</span>
            <input
              className={`${adminFieldClass} !mt-1 md:!mt-2`}
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Alex & Riley Example"
            />
          </label>
          <label className="block text-sm">
            <span className={`mb-1 block md:mb-2 ${adminLabelClass}`}>Code (optional)</span>
            <input
              className={`${adminFieldClass} !mt-1 md:!mt-2`}
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="EXAMPLE27"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className={`mb-1 block md:mb-2 ${adminLabelClass}`}>Guest names</span>
            <textarea
              className={`${adminFieldClass} min-h-20 !mt-1 md:min-h-24 md:!mt-2`}
              value={newGuestNames}
              onChange={(e) => setNewGuestNames(e.target.value)}
              placeholder={"Alex Example\nRiley Example"}
            />
          </label>
        </div>
        <Button
          type="button"
          variant="gold"
          className="mt-3 !min-h-9 md:mt-4"
          disabled={pending}
          onClick={() => void createHousehold()}
        >
          Add household
        </Button>
      </details>

      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      <div className={adminTableShellClass}>
        <div className="flex flex-col gap-3 border-b border-white/10 px-3 py-3 sm:flex-row sm:items-end sm:justify-between md:px-4">
          <label className="block min-w-0 flex-1 text-sm">
            <span className={`mb-1 block ${adminLabelClass}`}>Search</span>
            <input
              className={`${adminFieldClass} !mt-0`}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Household or guest name"
            />
          </label>
          <p className={`shrink-0 text-xs ${adminMutedClass}`}>
            {filtered.length} invitation{filtered.length === 1 ? "" : "s"} ·{" "}
            {filtered.reduce((n, h) => n + h.guests.length, 0)} guests
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className={adminTableClass}>
            <thead>
              <tr>
                <th className={`${adminThClass} w-8`} scope="col">
                  <span className="sr-only">Expand</span>
                </th>
                <th className={adminThClass} scope="col">
                  Household
                </th>
                <th className={`${adminThClass} w-16 text-center`} scope="col">
                  Max
                </th>
                <th className={`${adminThClass} hidden sm:table-cell`} scope="col">
                  Guests
                </th>
                <th className={`${adminThClass} w-24`} scope="col">
                  RSVP
                </th>
                <th className={`${adminThClass} hidden md:table-cell w-16`} scope="col">
                  Code
                </th>
                <th className={`${adminThClass} w-28 text-right`} scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className={`${adminTdClass} py-10 text-center ${adminMutedClass}`}
                  >
                    No invitations match your search.
                  </td>
                </tr>
              ) : (
                pageRows.map((household) => (
                  <HouseholdTableBlockInner
                    key={`${household.id}:${household.updatedAt}:${household.guests.map((g) => `${g.id}:${g.fullName}`).join("|")}:${household.displayName}:${household.maxPlusOnes}`}
                    household={household}
                    pending={pending}
                    expanded={expandedId === household.id}
                    onToggleExpand={() =>
                      setExpandedId((id) =>
                        id === household.id ? null : household.id,
                      )
                    }
                    onSaveHousehold={saveHousehold}
                    onUpdateGuestName={updateGuestName}
                    onAddGuest={addGuest}
                    onRemoveGuest={removeGuest}
                    onDelete={() =>
                      void deleteHousehold(household.id, household.displayName)
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={adminTableFootClass}>
          <p className={`text-xs ${adminMutedClass}`}>
            Showing{" "}
            <span className="tabular-nums text-[var(--admin-body,#d4dce8)]">
              {rangeStart}–{rangeEnd}
            </span>{" "}
            of{" "}
            <span className="tabular-nums text-[var(--admin-body,#d4dce8)]">
              {filtered.length}
            </span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-[var(--admin-muted,#9aa8bc)]">
              Rows
              <select
                className="admin-input rounded-sm px-2 py-1 text-xs outline-none"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="secondary"
                disabled={pageIndex <= 1 || pending}
                className={tableBtnClass}
                onClick={() => setPage((p) => Math.max(1, Math.min(p, totalPages) - 1))}
              >
                Prev
              </Button>
              <span className="min-w-[4.5rem] px-1 text-center text-xs tabular-nums text-[var(--admin-body,#d4dce8)]">
                {pageIndex} / {totalPages}
              </span>
              <Button
                type="button"
                variant="secondary"
                disabled={pageIndex >= totalPages || pending}
                className={tableBtnClass}
                onClick={() =>
                  setPage((p) => Math.min(totalPages, Math.min(p, totalPages) + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HouseholdTableBlockInner({
  household,
  pending,
  expanded,
  onToggleExpand,
  onSaveHousehold,
  onUpdateGuestName,
  onAddGuest,
  onRemoveGuest,
  onDelete,
}: {
  household: HouseholdRow;
  pending: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onSaveHousehold: (
    id: string,
    patch: { displayName?: string; guestAllowance?: number },
  ) => Promise<boolean>;
  onUpdateGuestName: (guestId: string, fullName: string) => Promise<boolean>;
  onAddGuest: (householdId: string, fullName: string) => Promise<void>;
  onRemoveGuest: (guestId: string, name: string) => Promise<void>;
  onDelete: () => void;
}) {
  const [displayName, setDisplayName] = useState(household.displayName);
  const [allowance, setAllowance] = useState(String(guestAllowance(household)));
  const [newGuestName, setNewGuestName] = useState("");
  const [guestDrafts, setGuestDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(household.guests.map((g) => [g.id, g.fullName])),
  );

  const listed = household.guests.length;
  const allowanceNum = Math.max(
    listed,
    Number.parseInt(allowance, 10) || listed,
  );
  const dirty =
    displayName.trim() !== household.displayName ||
    allowanceNum !== guestAllowance(household) ||
    household.guests.some(
      (g) => (guestDrafts[g.id] ?? g.fullName).trim() !== g.fullName,
    );

  const guestPreview = household.guests.map((g) => g.fullName).join(", ");

  async function saveAll() {
    const name = displayName.trim();
    if (!name) return;
    if (name !== household.displayName || allowanceNum !== guestAllowance(household)) {
      const ok = await onSaveHousehold(household.id, {
        displayName: name,
        guestAllowance: allowanceNum,
      });
      if (!ok) return;
    }
    for (const guest of household.guests) {
      const draft = (guestDrafts[guest.id] ?? guest.fullName).trim();
      if (draft && draft !== guest.fullName) {
        await onUpdateGuestName(guest.id, draft);
      }
    }
  }

  return (
    <Fragment>
      <tr className="group transition-colors hover:bg-white/[0.035]">
        <td className={adminTdClass}>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-white/12 bg-white/[0.03] text-xs text-[var(--admin-gold,#e8c872)] hover:bg-white/[0.08]"
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse guests" : "Edit guests"}
            onClick={onToggleExpand}
          >
            {expanded ? "▾" : "▸"}
          </button>
        </td>
        <td className={adminTdClass}>
          <input
            aria-label="Household name"
            className={compactFieldClass}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <p
            className={`mt-1 truncate text-[0.625rem] sm:hidden ${adminMutedClass}`}
            title={guestPreview}
          >
            {guestPreview || "—"}
          </p>
        </td>
        <td className={`${adminTdClass} text-center`}>
          <input
            type="number"
            min={listed}
            aria-label="Max guests allowed"
            className={`${compactFieldClass} mx-auto max-w-[3.25rem] text-center tabular-nums`}
            value={allowance}
            onChange={(e) => setAllowance(e.target.value)}
          />
        </td>
        <td className={`${adminTdClass} hidden max-w-[14rem] sm:table-cell`}>
          <p className={`truncate text-xs ${adminMutedClass}`} title={guestPreview}>
            {listed === 0 ? "—" : `${listed} · ${guestPreview}`}
          </p>
        </td>
        <td className={adminTdClass}>
          <span
            className={cn(
              "inline-flex rounded-full border px-2 py-0.5 text-[0.625rem] capitalize leading-tight md:text-xs",
              rsvpStatusClass(household.rsvpStatus),
            )}
          >
            {household.rsvpStatus}
          </span>
        </td>
        <td className={`${adminTdClass} hidden md:table-cell`}>
          <span className="font-mono text-[0.625rem] text-[var(--admin-muted,#9aa8bc)]">
            {household.invitationCodeHint ? `${household.invitationCodeHint}…` : "—"}
          </span>
        </td>
        <td className={`${adminTdClass} text-right`}>
          <div className="inline-flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={pending || !dirty}
              className={tableBtnClass}
              onClick={() => void saveAll()}
            >
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              className={`${tableBtnClass} !text-red-200/90`}
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        </td>
      </tr>
      {expanded ? (
        <tr className="bg-[rgb(4_10_20/0.65)]">
          <td colSpan={7} className="border-b border-white/[0.07] px-3 py-3 md:px-4">
            <p className={`mb-2 text-[0.625rem] uppercase tracking-wide ${adminLabelClass}`}>
              Guest names
            </p>
            <ul className="space-y-1.5">
              {household.guests.map((guest) => (
                <li
                  key={guest.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-2 sm:max-w-xl"
                >
                  <input
                    className={compactFieldClass}
                    value={guestDrafts[guest.id] ?? guest.fullName}
                    onChange={(e) =>
                      setGuestDrafts((prev) => ({
                        ...prev,
                        [guest.id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    disabled={pending}
                    className="text-xs text-red-200/90 hover:text-red-100 disabled:opacity-40"
                    onClick={() => void onRemoveGuest(guest.id, guest.fullName)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-2 sm:max-w-xl">
              <input
                className={compactFieldClass}
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                placeholder="Add guest name"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newGuestName.trim()) {
                    e.preventDefault();
                    void onAddGuest(household.id, newGuestName).then(() =>
                      setNewGuestName(""),
                    );
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                className={tableBtnClass}
                onClick={() => {
                  void onAddGuest(household.id, newGuestName).then(() =>
                    setNewGuestName(""),
                  );
                }}
              >
                Add
              </Button>
            </div>
          </td>
        </tr>
      ) : null}
    </Fragment>
  );
}
