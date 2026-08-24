"use client";

import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface AdminHouseholdRow {
  id: string;
  displayName: string;
  email: string | null;
  rsvpStatus: string;
  guestCount: number;
  dietary: string[];
  accessibility: string[];
  songRequest: string;
  messageToCouple: string;
  updatedAt: string;
}

interface Summary {
  totals: {
    households: number;
    pending: number;
    partial: number;
    complete: number;
    declined: number;
  };
  mealTotals: Array<{ mealOptionId: string; label: string; count: number }>;
  households: AdminHouseholdRow[];
}

export function RsvpAdminPanel() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/admin/rsvp");
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) {
        if (!cancelled) setError("Unable to load RSVP summary.");
        return;
      }
      const data = (await response.json()) as Summary;
      if (!cancelled) setSummary(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const filtered = useMemo(() => {
    if (!summary) return [];
    return summary.households.filter((household) => {
      const statusOk =
        filter === "all" || household.rsvpStatus === filter;
      const q = query.trim().toLowerCase();
      const queryOk =
        !q ||
        household.displayName.toLowerCase().includes(q) ||
        (household.email ?? "").toLowerCase().includes(q);
      return statusOk && queryOk;
    });
  }, [filter, query, summary]);

  if (!summary) {
    return (
      <p className="text-sm text-ink-muted" role="status">
        {error ?? "Loading RSVP responses…"}
      </p>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-5">
        {(
          [
            ["households", summary.totals.households],
            ["pending", summary.totals.pending],
            ["partial", summary.totals.partial],
            ["complete", summary.totals.complete],
            ["declined", summary.totals.declined],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="border border-stone bg-parchment/40 px-4 py-5">
            <p className="font-sans text-xs uppercase tracking-[0.16em] text-gold">
              {label}
            </p>
            <p className="mt-2 font-display text-3xl text-forest">{value}</p>
          </div>
        ))}
      </div>

      {summary.mealTotals.length > 0 ? (
        <div>
          <h2 className="font-display text-2xl text-forest">Meal totals</h2>
          <ul className="mt-4 space-y-2 text-sm text-charcoal">
            {summary.mealTotals.map((meal) => (
              <li key={meal.mealOptionId}>
                {meal.label}: {meal.count}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm">
          <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
            Search households
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-11 w-full border border-stone bg-ivory px-3"
          />
        </label>
        <label className="block text-sm sm:w-48">
          <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
            Status
          </span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="min-h-11 w-full border border-stone bg-ivory px-3"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="complete">Complete</option>
            <option value="declined">Declined</option>
          </select>
        </label>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            void (async () => {
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
            })();
          }}
        >
          Export CSV
        </Button>
      </div>

      <ul className="space-y-4">
        {filtered.map((household) => (
          <li key={household.id} className="border border-stone bg-ivory p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl text-forest">
                  {household.displayName}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-gold">
                  {household.rsvpStatus} · {household.guestCount} guests
                </p>
                {household.email ? (
                  <p className="mt-2 text-sm text-ink-muted">{household.email}</p>
                ) : null}
              </div>
              <p className="text-xs text-ink-muted">
                Updated {new Date(household.updatedAt).toLocaleString()}
              </p>
            </div>
            {household.dietary.length > 0 ? (
              <p className="mt-3 text-sm">Dietary: {household.dietary.join("; ")}</p>
            ) : null}
            {household.accessibility.length > 0 ? (
              <p className="mt-1 text-sm">
                Accessibility: {household.accessibility.join("; ")}
              </p>
            ) : null}
            {household.songRequest ? (
              <p className="mt-1 text-sm">Song: {household.songRequest}</p>
            ) : null}
            {household.messageToCouple ? (
              <p className="mt-1 text-sm">Message: {household.messageToCouple}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
