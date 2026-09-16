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
  updatedAt: string;
  guests: GuestRow[];
}

export function RsvpGuestListAdmin() {
  const [households, setHouseholds] = useState<HouseholdRow[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        {filtered.reduce((n, h) => n + h.guests.length, 0)} guests
      </p>

      <ul className="space-y-3">
        {filtered.map((household) => (
          <li key={household.id} className={adminCardClass}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <button
                type="button"
                className="text-left"
                onClick={() =>
                  setExpandedId(expandedId === household.id ? null : household.id)
                }
              >
                <p className="font-display text-lg text-[var(--admin-gold-bright,#f5e6a8)]">
                  {household.displayName}
                </p>
                <p className={`mt-1 text-xs ${adminMutedClass}`}>
                  {household.guests.length} guests
                  {household.invitationCodeHint
                    ? ` · code hint ${household.invitationCodeHint}…`
                    : ""}
                  {` · ${household.rsvpStatus}`}
                </p>
              </button>
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  void deleteHousehold(household.id, household.displayName)
                }
              >
                Delete invitation
              </Button>
            </div>

            {expandedId === household.id ? (
              <GuestHouseholdEditor
                household={household}
                pending={pending}
                onAddGuest={addGuest}
                onRemoveGuest={removeGuest}
              />
            ) : (
              <p className={`mt-2 text-sm ${adminMutedClass}`}>
                {household.guests.map((g) => g.fullName).join(" · ")}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GuestHouseholdEditor({
  household,
  pending,
  onAddGuest,
  onRemoveGuest,
}: {
  household: HouseholdRow;
  pending: boolean;
  onAddGuest: (householdId: string, name: string) => Promise<void>;
  onRemoveGuest: (guestId: string, name: string) => Promise<void>;
}) {
  const [newName, setNewName] = useState("");

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <ul className="space-y-2">
        {household.guests.map((guest) => (
          <li
            key={guest.id}
            className="flex flex-wrap items-center justify-between gap-2 text-sm"
          >
            <span className="text-[var(--admin-body,#d4dce8)]">{guest.fullName}</span>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              className="!text-red-200"
              onClick={() => void onRemoveGuest(guest.id, guest.fullName)}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          className={`${adminFieldClass} min-w-[12rem] flex-1`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add guest name"
        />
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            void onAddGuest(household.id, newName).then(() => setNewName(""));
          }}
        >
          Add guest
        </Button>
      </div>
    </div>
  );
}
