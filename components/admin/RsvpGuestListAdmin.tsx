"use client";

import { Button } from "@/components/ui/Button";
import {
  adminCardClass,
  adminFieldClass,
  adminLabelClass,
  adminMutedClass,
} from "@/components/admin/admin-styles";
import { useCallback, useEffect, useMemo, useState } from "react";

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

function guestAllowance(household: Pick<HouseholdRow, "guests" | "maxPlusOnes">) {
  return household.guests.length + (household.maxPlusOnes ?? 0);
}

const gridHeaderClass =
  "hidden md:grid md:grid-cols-[1.75rem_minmax(8rem,1.35fr)_3.25rem_minmax(9rem,1.65fr)_4.5rem_3.25rem_minmax(5.5rem,auto)] md:gap-x-2 md:border-b md:border-white/10 md:pb-1.5 md:text-[0.625rem] md:font-medium md:uppercase md:tracking-wide text-[var(--admin-muted,#8a9bb0)]";

const compactFieldClass =
  "admin-input w-full rounded-sm px-2 py-1 text-xs leading-tight outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--admin-gold,#e8c872)]";

const mobileBtnClass =
  "!min-h-7 !px-2 !py-0.5 !text-[0.625rem] !tracking-normal !normal-case";

const statusPillClass =
  "inline-flex shrink-0 items-center rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[0.625rem] capitalize leading-none text-[var(--admin-muted,#9aa8bc)]";

export function RsvpGuestListAdmin() {
  const [households, setHouseholds] = useState<HouseholdRow[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
      else await load();
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

      <label className="block text-sm">
        <span className={`mb-1 block md:mb-2 ${adminLabelClass}`}>Search guest list</span>
        <input
          className={`${adminFieldClass} !mt-1 md:!mt-2`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name or household"
        />
      </label>

      {error ? (
        <p className="text-sm text-red-300" role="alert">
          {error}
        </p>
      ) : null}

      <p className={`text-xs md:text-sm ${adminMutedClass}`}>
        {filtered.length} invitation{filtered.length === 1 ? "" : "s"} ·{" "}
        {filtered.reduce((n, h) => n + h.guests.length, 0)} named guests
      </p>

      <div className="overflow-x-auto md:overflow-visible">
        <div className={gridHeaderClass}>
          <span />
          <span>Household</span>
          <span className="text-center">Allow</span>
          <span>Guests on invite</span>
          <span>RSVP</span>
          <span className="text-center">Listed</span>
          <span className="text-right">Actions</span>
        </div>

        <ul className="divide-y divide-white/10 md:space-y-0 md:divide-y-0">
          {filtered.map((household) => (
            <li
              key={household.id}
              className="py-1 first:pt-0 md:rounded-sm md:py-0 md:odd:bg-white/[0.02]"
            >
              <HouseholdGridRow
                key={`${household.id}:${household.updatedAt}:${household.guests.map((g) => `${g.id}:${g.fullName}`).join("|")}:${household.displayName}:${household.maxPlusOnes}`}
                household={household}
                pending={pending}
                expanded={expandedIds.has(household.id)}
                onToggleExpand={() => toggleExpanded(household.id)}
                onSaveHousehold={saveHousehold}
                onUpdateGuestName={updateGuestName}
                onAddGuest={addGuest}
                onRemoveGuest={removeGuest}
                onDelete={() =>
                  void deleteHousehold(household.id, household.displayName)
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function HouseholdGridRow({
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

  const expandButton = (
    <button
      type="button"
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-white/10 text-[0.625rem] leading-none text-[var(--admin-muted,#8a9bb0)] hover:bg-white/5 md:h-7 md:w-7 md:text-xs"
      aria-expanded={expanded}
      aria-label={expanded ? "Collapse guests" : "Expand guests"}
      onClick={onToggleExpand}
    >
      {expanded ? "−" : "+"}
    </button>
  );

  const allowanceInput = (
    <input
      type="number"
      min={listed}
      aria-label="Guests allowed"
      className={`${compactFieldClass} w-full tabular-nums md:text-center`}
      value={allowance}
      onChange={(e) => setAllowance(e.target.value)}
      title="Total guests allowed (named + extra slots)"
    />
  );

  const nameInput = (
    <input
      aria-label="Household name"
      className={compactFieldClass}
      value={displayName}
      onChange={(e) => setDisplayName(e.target.value)}
    />
  );

  const actionButtons = (
    <div className="flex shrink-0 items-center gap-0.5 md:gap-1">
      <Button
        type="button"
        variant="secondary"
        disabled={pending || !dirty}
        className={mobileBtnClass}
        onClick={() => void saveAll()}
      >
        Save
      </Button>
      <Button
        type="button"
        variant="ghost"
        disabled={pending}
        className={`${mobileBtnClass} !text-red-200`}
        onClick={onDelete}
      >
        <span className="md:hidden">Del</span>
        <span className="hidden md:inline">Delete</span>
      </Button>
    </div>
  );

  return (
    <div>
      {/* Mobile: two tight rows */}
      <div className="md:hidden">
        <div className="flex items-center gap-1.5">
          {expandButton}
          <div className="min-w-0 flex-1">{nameInput}</div>
          <label className="flex w-11 shrink-0 flex-col items-center gap-0.5">
            <span className="text-[0.5625rem] uppercase tracking-wide text-[var(--admin-muted,#9aa8bc)]">
              Max
            </span>
            {allowanceInput}
          </label>
        </div>
        <div className="mt-1 flex items-center gap-1.5 pl-7">
          <span className={statusPillClass}>{household.rsvpStatus}</span>
          <span className="text-[0.625rem] tabular-nums text-[var(--admin-muted,#9aa8bc)]">
            {listed} named
          </span>
          <div className="ml-auto">{actionButtons}</div>
        </div>
        {!expanded && guestPreview ? (
          <p
            className={`mt-0.5 truncate pl-7 text-[0.625rem] leading-snug ${adminMutedClass}`}
            title={guestPreview}
          >
            {guestPreview}
          </p>
        ) : null}
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid md:grid-cols-[1.75rem_minmax(8rem,1.35fr)_3.25rem_minmax(9rem,1.65fr)_4.5rem_3.25rem_minmax(5.5rem,auto)] md:items-center md:gap-x-2 md:py-1.5">
        {expandButton}
        {nameInput}
        {allowanceInput}
        <div className="min-w-0">
          {!expanded ? (
            <p className={`truncate text-xs ${adminMutedClass}`} title={guestPreview}>
              {guestPreview || "—"}
            </p>
          ) : (
            <p className={`text-xs ${adminMutedClass}`}>Edit below</p>
          )}
        </div>
        <span className={`text-xs capitalize ${adminMutedClass}`}>
          {household.rsvpStatus}
        </span>
        <span className="text-center text-xs tabular-nums text-[var(--admin-body,#d4dce8)]">
          {listed}
        </span>
        <div className="flex justify-end">{actionButtons}</div>
      </div>

      {expanded ? (
        <div className="mt-1 space-y-0.5 border-l border-white/15 pl-2 md:ml-7 md:space-y-1 md:border-l-2 md:pl-3">
          {household.guests.map((guest) => (
            <div
              key={guest.id}
              className="grid grid-cols-[1fr_auto] items-center gap-1 py-0.5"
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
                className="shrink-0 px-1.5 py-0.5 text-[0.625rem] text-red-200/90 hover:text-red-100 disabled:opacity-40"
                onClick={() => void onRemoveGuest(guest.id, guest.fullName)}
              >
                Remove
              </button>
            </div>
          ))}
          <div className="grid grid-cols-[1fr_auto] items-center gap-1 pt-0.5">
            <input
              className={compactFieldClass}
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              placeholder="Add guest"
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
              className={mobileBtnClass}
              onClick={() => {
                void onAddGuest(household.id, newGuestName).then(() =>
                  setNewGuestName(""),
                );
              }}
            >
              Add
            </Button>
          </div>
          {household.invitationCodeHint ? (
            <p className={`pt-0.5 text-[0.625rem] ${adminMutedClass}`}>
              Code: {household.invitationCodeHint}…
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
