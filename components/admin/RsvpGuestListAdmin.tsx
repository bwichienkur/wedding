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
  "hidden sm:grid sm:grid-cols-[2rem_minmax(10rem,1.4fr)_4.5rem_minmax(12rem,2fr)_5rem_4.5rem_auto] sm:gap-x-2 sm:border-b sm:border-white/10 sm:pb-2 sm:text-[0.65rem] sm:font-medium sm:uppercase sm:tracking-wide text-[var(--admin-muted,#8a9bb0)]";

const gridRowClass =
  "grid gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-2 sm:grid-cols-[2rem_minmax(10rem,1.4fr)_4.5rem_minmax(12rem,2fr)_5rem_4.5rem_auto] sm:items-center sm:gap-x-2 sm:gap-y-1 sm:border-0 sm:bg-transparent sm:p-0 sm:py-1.5";

const compactFieldClass = `${adminFieldClass} !py-1 !text-xs`;

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
    <div className="space-y-8">
      <div className={adminCardClass}>
        <h2 className="font-display text-xl text-[var(--admin-gold-bright,#f5e6a8)]">
          Add invitation
        </h2>
        <p className={`mt-2 text-sm ${adminMutedClass}`}>
          One row per guest name. Codes are optional — leave blank to auto-generate.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className={`mb-2 block ${adminLabelClass}`}>Household label</span>
            <input
              className={adminFieldClass}
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Alex & Riley Example"
            />
          </label>
          <label className="block text-sm">
            <span className={`mb-2 block ${adminLabelClass}`}>Invitation code (optional)</span>
            <input
              className={adminFieldClass}
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="EXAMPLE27"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className={`mb-2 block ${adminLabelClass}`}>Guest names</span>
            <textarea
              className={`${adminFieldClass} min-h-24`}
              value={newGuestNames}
              onChange={(e) => setNewGuestNames(e.target.value)}
              placeholder={"Alex Example\nRiley Example"}
            />
          </label>
        </div>
        <Button
          type="button"
          variant="gold"
          className="mt-4"
          disabled={pending}
          onClick={() => void createHousehold()}
        >
          Add household
        </Button>
      </div>

      <label className="block text-sm">
        <span className={`mb-2 block ${adminLabelClass}`}>Search guest list</span>
        <input
          className={adminFieldClass}
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

      <p className={`text-sm ${adminMutedClass}`}>
        {filtered.length} invitation{filtered.length === 1 ? "" : "s"} ·{" "}
        {filtered.reduce((n, h) => n + h.guests.length, 0)} named guests
      </p>

      <div className="space-y-1">
        <div className={gridHeaderClass}>
          <span />
          <span>Household</span>
          <span className="text-center">Allow</span>
          <span>Guests on invite</span>
          <span>RSVP</span>
          <span className="text-center">Listed</span>
          <span className="text-right">Actions</span>
        </div>

        <ul className="space-y-1">
          {filtered.map((household) => (
            <li key={household.id}>
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

  return (
    <div className="sm:space-y-0">
      <div className={gridRowClass}>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded border border-white/10 text-xs text-[var(--admin-muted,#8a9bb0)] hover:bg-white/5"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse guests" : "Expand guests"}
          onClick={onToggleExpand}
        >
          {expanded ? "−" : "+"}
        </button>

        <label className="min-w-0 sm:contents">
          <span className={`mb-1 block text-[0.65rem] uppercase sm:hidden ${adminMutedClass}`}>
            Household
          </span>
          <input
            className={compactFieldClass}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </label>

        <label className="sm:contents">
          <span className={`mb-1 block text-[0.65rem] uppercase sm:hidden ${adminMutedClass}`}>
            Allow
          </span>
          <input
            type="number"
            min={listed}
            className={`${compactFieldClass} w-full text-center tabular-nums`}
            value={allowance}
            onChange={(e) => setAllowance(e.target.value)}
            title="Total guests allowed (named + extra slots)"
          />
        </label>

        <div className="min-w-0 sm:col-span-1">
          <span className={`mb-1 block text-[0.65rem] uppercase sm:hidden ${adminMutedClass}`}>
            Guests
          </span>
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

        <div className="flex flex-wrap justify-end gap-1">
          <Button
            type="button"
            variant="secondary"
            disabled={pending || !dirty}
            className="!px-2 !py-1 !text-xs"
            onClick={() => void saveAll()}
          >
            Save
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            className="!px-2 !py-1 !text-xs !text-red-200"
            onClick={onDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-1 space-y-1 border-l-2 border-white/10 pl-3 sm:ml-8">
          {household.guests.map((guest) => (
            <div
              key={guest.id}
              className="flex flex-wrap items-center gap-2 py-0.5"
            >
              <input
                className={`${compactFieldClass} min-w-[10rem] flex-1`}
                value={guestDrafts[guest.id] ?? guest.fullName}
                onChange={(e) =>
                  setGuestDrafts((prev) => ({
                    ...prev,
                    [guest.id]: e.target.value,
                  }))
                }
              />
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                className="!px-2 !py-1 !text-xs !text-red-200"
                onClick={() => void onRemoveGuest(guest.id, guest.fullName)}
              >
                Remove
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <input
              className={`${compactFieldClass} min-w-[10rem] flex-1`}
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              placeholder="New guest name"
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
              className="!px-2 !py-1 !text-xs"
              onClick={() => {
                void onAddGuest(household.id, newGuestName).then(() =>
                  setNewGuestName(""),
                );
              }}
            >
              Add guest
            </Button>
          </div>
          {household.invitationCodeHint ? (
            <p className={`pt-1 text-[0.65rem] ${adminMutedClass}`}>
              Code hint: {household.invitationCodeHint}…
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
