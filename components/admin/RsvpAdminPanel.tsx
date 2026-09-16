"use client";

import { Button } from "@/components/ui/Button";
import { RsvpGuestListAdmin } from "@/components/admin/RsvpGuestListAdmin";
import {
  adminCardClass,
  adminFieldClass,
  adminLabelClass,
  adminMutedClass,
} from "@/components/admin/admin-styles";
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
  const [tab, setTab] = useState<"responses" | "guests">("responses");
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
      <p className={adminMutedClass} role="status">
        {error ?? "Loading RSVP responses…"}
      </p>
    );
  }

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex flex-wrap gap-1.5 md:gap-2">
        <button
          type="button"
          className={
            tab === "responses"
              ? "rounded-full border border-[var(--admin-gold,#e8c872)] bg-white/10 px-3 py-1.5 text-xs text-[var(--admin-gold-bright,#f5e6a8)] md:px-4 md:py-2 md:text-sm"
              : "rounded-full border border-white/15 px-3 py-1.5 text-xs text-[var(--admin-body,#d4dce8)] md:px-4 md:py-2 md:text-sm"
          }
          onClick={() => setTab("responses")}
        >
          RSVP responses
        </button>
        <button
          type="button"
          className={
            tab === "guests"
              ? "rounded-full border border-[var(--admin-gold,#e8c872)] bg-white/10 px-3 py-1.5 text-xs text-[var(--admin-gold-bright,#f5e6a8)] md:px-4 md:py-2 md:text-sm"
              : "rounded-full border border-white/15 px-3 py-1.5 text-xs text-[var(--admin-body,#d4dce8)] md:px-4 md:py-2 md:text-sm"
          }
          onClick={() => setTab("guests")}
        >
          Guest list
        </button>
      </div>

      {tab === "guests" ? <RsvpGuestListAdmin /> : null}

      {tab === "responses" ? (
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
          <div key={label} className={adminCardClass}>
            <p className={adminLabelClass}>{label}</p>
            <p className="mt-2 font-display text-3xl text-[var(--admin-gold-bright,#f5e6a8)]">
              {value}
            </p>
          </div>
        ))}
      </div>

      {summary.mealTotals.length > 0 ? (
        <div>
          <h2 className="font-display text-2xl text-[var(--admin-gold-bright,#f5e6a8)]">
            Meal totals
          </h2>
          <ul className={`mt-4 space-y-2 ${adminMutedClass}`}>
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
          <span className={`mb-2 block ${adminLabelClass}`}>
            Search households
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={adminFieldClass}
          />
        </label>
        <label className="block text-sm sm:w-48">
          <span className={`mb-2 block ${adminLabelClass}`}>Status</span>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className={adminFieldClass}
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
          <li key={household.id} className={adminCardClass}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl text-[var(--admin-gold-bright,#f5e6a8)]">
                  {household.displayName}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--admin-gold,#e8c872)]">
                  {household.rsvpStatus} · {household.guestCount} guests
                </p>
                {household.email ? (
                  <p className={`mt-2 ${adminMutedClass}`}>{household.email}</p>
                ) : null}
              </div>
              <p className={`text-xs ${adminMutedClass}`}>
                Updated {new Date(household.updatedAt).toLocaleString()}
              </p>
            </div>
            {household.dietary.length > 0 ? (
              <p className={`mt-3 text-sm text-[var(--admin-body,#d4dce8)]`}>
                Dietary: {household.dietary.join("; ")}
              </p>
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
      ) : null}
    </div>
  );
}
