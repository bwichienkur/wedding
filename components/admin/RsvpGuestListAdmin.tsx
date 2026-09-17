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
  adminToolbarControlClass,
  adminToolbarSelectClass,
} from "@/components/admin/admin-styles";
import {
  sumCeremonyAcrossHouseholds,
  sumWelcomeAcrossHouseholds,
} from "@/lib/rsvp/admin-attendance";
import { cn } from "@/lib/cn";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";

interface GuestRsvpEvent {
  eventId: string;
  eventTitle: string;
  attending: string;
}

interface GuestRow {
  id: string;
  fullName: string;
  isChild: boolean;
  isPlusOne: boolean;
  sortOrder: number;
  events: GuestRsvpEvent[];
  dietaryNotes: string;
  accessibilityNotes: string;
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
  messageToCouple: string;
  songRequest: string;
  submittedAt: string | null;
  welcomeAttendingCount: number;
  ceremonyAttendingCount: number;
  ceremonyGuestNames: string[];
  guests: GuestRow[];
}

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "complete", label: "Complete" },
  { value: "declined", label: "Declined" },
  { value: "partial", label: "Partial" },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"];

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

function guestAllowance(household: Pick<HouseholdRow, "guests" | "maxPlusOnes">) {
  return household.guests.length + (household.maxPlusOnes ?? 0);
}

const compactFieldClass =
  "admin-input h-7 w-full min-w-0 rounded-sm px-2 py-0 text-xs leading-none outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--admin-gold,#e8c872)]";

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

function formatAttending(value: string): string {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  return "—";
}

function attendingClass(value: string): string {
  if (value === "yes") return "text-emerald-200/90";
  if (value === "no") return "text-rose-200/80";
  return "text-[var(--admin-muted,#9aa8bc)]";
}

export function RsvpGuestListAdmin() {
  const [households, setHouseholds] = useState<HouseholdRow[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
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

  const statusTotals = useMemo(() => {
    const totals: Record<StatusFilter, number> = {
      all: households.length,
      pending: 0,
      complete: 0,
      declined: 0,
      partial: 0,
    };
    for (const household of households) {
      if (household.rsvpStatus === "pending") totals.pending += 1;
      else if (household.rsvpStatus === "complete") totals.complete += 1;
      else if (household.rsvpStatus === "declined") totals.declined += 1;
      else if (household.rsvpStatus === "partial") totals.partial += 1;
    }
    return totals;
  }, [households]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return households.filter((household) => {
      const statusOk =
        statusFilter === "all" || household.rsvpStatus === statusFilter;
      if (!statusOk) return false;
      if (!q) return true;
      return (
        household.displayName.toLowerCase().includes(q) ||
        household.guests.some((guest) =>
          guest.fullName.toLowerCase().includes(q),
        )
      );
    });
  }, [households, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageIndex = Math.min(page, totalPages);

  const pageRows = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, pageIndex, pageSize]);

  const rangeStart = filtered.length === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const rangeEnd = Math.min(pageIndex * pageSize, filtered.length);

  const attendanceTotals = useMemo(
    () => ({
      welcome: sumWelcomeAcrossHouseholds(filtered),
      ceremony: sumCeremonyAcrossHouseholds(filtered),
    }),
    [filtered],
  );

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

  async function exportCsv() {
    const response = await fetch("/api/admin/rsvp?format=csv");
    if (!response.ok) {
      setError("Unable to export CSV.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "rsvp-export.csv";
    anchor.click();
    URL.revokeObjectURL(url);
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

      <div className={`${adminTableShellClass} w-full`}>
        <div className="flex flex-col gap-3 border-b border-white/10 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="block min-w-0 flex-1 text-sm sm:min-w-[12rem]">
            <span className={`mb-1 block ${adminLabelClass}`}>Search</span>
            <input
              className={`${adminFieldClass} !mt-0 !py-1.5 !text-xs`}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Household or guest name"
            />
          </label>
          <label className="block w-full text-sm sm:w-48">
            <span className={`mb-1 block ${adminLabelClass}`}>RSVP status</span>
            <select
              className={adminToolbarSelectClass}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPage(1);
              }}
            >
              {STATUS_FILTERS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label} ({statusTotals[value]})
                </option>
              ))}
            </select>
          </label>
          <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto">
            <button
              type="button"
              className={adminToolbarControlClass}
              disabled={pending}
              onClick={() => void load()}
            >
              Refresh
            </button>
            <button
              type="button"
              className={adminToolbarControlClass}
              disabled={pending}
              onClick={() => void exportCsv()}
            >
              Export CSV
            </button>
          </div>
        </div>

        <div
          className={`flex flex-wrap gap-x-4 gap-y-1 border-b border-white/10 px-3 py-2 text-xs ${adminMutedClass}`}
        >
          <span>
            <span className={adminLabelClass}>Invitations </span>
            {filtered.length}
          </span>
          <span>
            <span className={adminLabelClass}>Welcome party </span>
            {attendanceTotals.welcome} guest
            {attendanceTotals.welcome === 1 ? "" : "s"}
          </span>
          <span>
            <span className={adminLabelClass}>Ceremony </span>
            {attendanceTotals.ceremony} guest
            {attendanceTotals.ceremony === 1 ? "" : "s"}
          </span>
        </div>

        <p className={`border-b border-white/10 px-3 py-2 text-xs ${adminMutedClass}`}>
          Expand a row to edit guest names and view full RSVP detail. Ceremony names
          column lists everyone marked attending the ceremony.
        </p>

        <div className="overflow-x-auto">
          <table className={adminTableClass}>
            <thead>
              <tr>
                <th className={`${adminThClass} w-9`} scope="col">
                  <span className="sr-only">Expand</span>
                </th>
                <th className={`${adminThClass} min-w-[9rem]`} scope="col">
                  Household
                </th>
                <th className={`${adminThClass} w-14 text-center`} scope="col">
                  Guests
                </th>
                <th className={`${adminThClass} w-[5.25rem]`} scope="col">
                  RSVP
                </th>
                <th className={`${adminThClass} w-12 text-center`} scope="col">
                  Welcome
                </th>
                <th className={`${adminThClass} w-12 text-center`} scope="col">
                  Ceremony
                </th>
                <th className={`${adminThClass} hidden min-w-[8rem] md:table-cell`} scope="col">
                  Ceremony names
                </th>
                <th className={`${adminThClass} hidden sm:table-cell w-12`} scope="col">
                  Code
                </th>
                <th className={`${adminThClass} w-[6.25rem] text-right`} scope="col">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
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

        <div className={`${adminTableFootClass} px-2 py-2`}>
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
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-white/12 bg-white/[0.03] text-[0.65rem] leading-none text-[var(--admin-gold,#e8c872)] hover:bg-white/[0.08]"
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse details" : "View guests and responses"}
            onClick={onToggleExpand}
          >
            {expanded ? "▾" : "▸"}
          </button>
        </td>
        <td className={`${adminTdClass} min-w-[9rem]`}>
          <input
            aria-label="Household name"
            className={compactFieldClass}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </td>
        <td className={`${adminTdClass} w-14 text-center`}>
          <input
            type="number"
            min={listed}
            aria-label="Guests allowed"
            className={`${compactFieldClass} mx-auto w-11 px-1 text-center tabular-nums`}
            value={allowance}
            onChange={(e) => setAllowance(e.target.value)}
          />
        </td>
        <td className={`${adminTdClass} w-[5.25rem]`}>
          <span
            className={cn(
              "inline-flex max-w-full rounded-full border px-1.5 py-0.5 text-[0.5625rem] capitalize leading-tight",
              rsvpStatusClass(household.rsvpStatus),
            )}
          >
            {household.rsvpStatus}
          </span>
        </td>
        <td className={`${adminTdClass} text-center tabular-nums`}>
          {household.welcomeAttendingCount > 0
            ? household.welcomeAttendingCount
            : "—"}
        </td>
        <td className={`${adminTdClass} text-center tabular-nums`}>
          {household.ceremonyAttendingCount > 0
            ? household.ceremonyAttendingCount
            : "—"}
        </td>
        <td
          className={`${adminTdClass} hidden max-w-[11rem] truncate md:table-cell`}
          title={
            household.ceremonyGuestNames.length
              ? household.ceremonyGuestNames.join(", ")
              : undefined
          }
        >
          {household.ceremonyGuestNames.length
            ? household.ceremonyGuestNames.join(", ")
            : "—"}
        </td>
        <td className={`${adminTdClass} hidden sm:table-cell`}>
          <span className="font-mono text-[0.5625rem] text-[var(--admin-muted,#9aa8bc)]">
            {household.invitationCodeHint ? `${household.invitationCodeHint}…` : "—"}
          </span>
        </td>
        <td className={`${adminTdClass} text-right`}>
          <div className="inline-flex items-center justify-end gap-0.5">
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
          <td colSpan={9} className="border-b border-white/[0.07] px-3 py-3 md:px-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className={`mb-2 text-[0.625rem] uppercase tracking-wide ${adminLabelClass}`}>
                  Guest names
                </p>
                <ul className="space-y-1.5">
                  {household.guests.map((guest) => (
                    <li
                      key={guest.id}
                      className="grid grid-cols-[1fr_auto] items-center gap-2"
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
                <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-2">
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
              </div>

              <div>
                <p className={`mb-2 text-[0.625rem] uppercase tracking-wide ${adminLabelClass}`}>
                  RSVP responses
                </p>
                {household.submittedAt ? (
                  <p className={`mb-2 text-[0.625rem] ${adminMutedClass}`}>
                    Submitted {new Date(household.submittedAt).toLocaleString()}
                  </p>
                ) : null}
                {household.email ? (
                  <p className={`mb-2 text-xs ${adminMutedClass}`}>{household.email}</p>
                ) : null}
                {household.messageToCouple ? (
                  <p className="mb-2 text-xs text-[var(--admin-body,#d4dce8)]">
                    <span className={adminLabelClass}>Message: </span>
                    {household.messageToCouple}
                  </p>
                ) : null}
                {household.songRequest ? (
                  <p className="mb-2 text-xs text-[var(--admin-body,#d4dce8)]">
                    <span className={adminLabelClass}>Song: </span>
                    {household.songRequest}
                  </p>
                ) : null}
                <div className="overflow-x-auto rounded-sm border border-white/10">
                  <table className="w-full min-w-[16rem] text-left text-xs">
                    <thead className="bg-white/[0.04] text-[0.5625rem] uppercase tracking-wide text-[var(--admin-muted,#9aa8bc)]">
                      <tr>
                        <th className="px-2 py-1.5 font-normal">Guest</th>
                        {household.guests[0]?.events.map((event) => (
                          <th key={event.eventId} className="px-2 py-1.5 font-normal">
                            {event.eventTitle.replace(" & Reception", "")}
                          </th>
                        )) ?? null}
                        <th className="hidden px-2 py-1.5 font-normal sm:table-cell">
                          Dietary
                        </th>
                        <th className="hidden px-2 py-1.5 font-normal md:table-cell">
                          A11y
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {household.guests.map((guest) => (
                        <tr key={guest.id} className="border-t border-white/[0.06]">
                          <td className="px-2 py-1.5 text-[var(--admin-body,#d4dce8)]">
                            {guest.fullName}
                          </td>
                          {guest.events.map((event) => (
                            <td
                              key={event.eventId}
                              className={cn(
                                "px-2 py-1.5 tabular-nums",
                                attendingClass(event.attending),
                              )}
                            >
                              {formatAttending(event.attending)}
                            </td>
                          ))}
                          <td className="hidden max-w-[8rem] truncate px-2 py-1.5 sm:table-cell">
                            {guest.dietaryNotes || "—"}
                          </td>
                          <td className="hidden max-w-[8rem] truncate px-2 py-1.5 md:table-cell">
                            {guest.accessibilityNotes || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {household.rsvpStatus === "pending" &&
                household.guests.every((guest) =>
                  guest.events.every((event) => event.attending === "unknown"),
                ) ? (
                  <p className={`mt-2 text-xs ${adminMutedClass}`}>
                    No RSVP submitted yet.
                  </p>
                ) : null}
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </Fragment>
  );
}
