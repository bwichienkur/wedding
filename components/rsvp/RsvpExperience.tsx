"use client";

import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";
import type {
  Attending,
  EventRecord,
  HouseholdCandidate,
  MealOption,
} from "@/lib/rsvp/types";
import { useEffect, useMemo, useState } from "react";

interface WorkspaceGuest {
  id: string;
  fullName: string;
  isChild: boolean;
  isPlusOne: boolean;
  plusOneNamed: boolean;
}

interface Workspace {
  household: {
    id: string;
    displayName: string;
    email: string | null;
    rsvpStatus: string;
    maxPlusOnes: number;
  };
  guests: WorkspaceGuest[];
  events: EventRecord[];
  mealOptions: MealOption[];
  responses: Array<{
    guestId: string;
    eventId: string;
    attending: Attending;
    mealOptionId: string | null;
    dietaryNotes: string;
    accessibilityNotes: string;
  }>;
  deadlineLabel: string;
  deadlineIsPlaceholder: boolean;
}

type Step =
  | "lookup"
  | "select"
  | "respond"
  | "details"
  | "review"
  | "done";

interface ResponseDraft {
  guestId: string;
  eventId: string;
  attending: Attending;
  mealOptionId: string | null;
  dietaryNotes: string;
  accessibilityNotes: string;
  plusOneName?: string;
}

export function RsvpExperience() {
  const [step, setStep] = useState<Step>("lookup");
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<HouseholdCandidate[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [drafts, setDrafts] = useState<ResponseDraft[]>([]);
  const [songRequest, setSongRequest] = useState("");
  const [messageToCouple, setMessageToCouple] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/rsvp/session");
      if (!response.ok || cancelled) return;
      const data = (await response.json()) as { workspace: Workspace | null };
      if (data.workspace && !cancelled) {
        setWorkspace(data.workspace);
        setDrafts(buildDrafts(data.workspace));
        setStep("respond");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const attendingYes = useMemo(
    () => drafts.some((draft) => draft.attending === "yes"),
    [drafts],
  );

  async function onLookup(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/rsvp/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = (await response.json()) as {
        candidates?: HouseholdCandidate[];
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        setError(data.error ?? "Unable to look up invitation.");
        return;
      }
      const next = data.candidates ?? [];
      setCandidates(next);
      if (next.length === 0) {
        setError(
          data.message ??
            "We couldn’t find a matching invitation. Check the spelling or code.",
        );
        setStep("lookup");
      } else if (next.length === 1) {
        await selectCandidate(next[0]!);
      } else {
        setStep("select");
      }
    } catch {
      setError("Unable to look up invitation right now.");
    } finally {
      setPending(false);
    }
  }

  async function selectCandidate(candidate: HouseholdCandidate) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/rsvp/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmationToken: candidate.confirmationToken }),
      });
      const data = (await response.json()) as {
        workspace?: Workspace;
        error?: string;
      };
      if (!response.ok || !data.workspace) {
        setError(data.error ?? "Unable to open invitation.");
        return;
      }
      setWorkspace(data.workspace);
      setDrafts(buildDrafts(data.workspace));
      setStep("respond");
    } catch {
      setError("Unable to open invitation.");
    } finally {
      setPending(false);
    }
  }

  function updateDraft(
    guestId: string,
    eventId: string,
    patch: Partial<ResponseDraft>,
  ) {
    setDrafts((current) =>
      current.map((draft) =>
        draft.guestId === guestId && draft.eventId === eventId
          ? { ...draft, ...patch }
          : draft,
      ),
    );
  }

  async function onSubmit() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/rsvp/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songRequest,
          messageToCouple,
          responses: drafts,
        }),
      });
      const data = (await response.json()) as { error?: string; status?: string };
      if (!response.ok) {
        setError(data.error ?? "Unable to save RSVP.");
        return;
      }
      setStatus(data.status ?? "complete");
      setStep("done");
    } catch {
      setError("Unable to save RSVP.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="font-sans text-xs uppercase tracking-[0.28em] text-rose">
        RSVP
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium text-forest sm:text-5xl">
        {wedding.couple.displayName}
      </h1>
      <p
        className={cn(
          "mt-4 text-sm text-ink-muted",
          wedding.rsvp.deadlineIsPlaceholder && "placeholder-copy",
        )}
      >
        {wedding.rsvp.deadlineLabel}
      </p>

      {error ? (
        <p className="mt-6 text-sm text-forest" role="alert">
          {error}
        </p>
      ) : null}

      {step === "lookup" ? (
        <form onSubmit={onLookup} className="mt-10 space-y-5">
          <label className="block text-sm">
            <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
              Full name or invitation code
            </span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="field-editorial"
              autoComplete="name"
              required
              minLength={2}
            />
          </label>
          <p className="text-sm text-ink-muted">
            Try a fictional demo name like <strong>Alex Rivera</strong> or code{" "}
            <strong>RIVERA27</strong>.
          </p>
          <Button
            type="submit"
            variant="gold"
            size="lg"
            disabled={pending}
            className="w-full shadow-md"
          >
            {pending ? "Searching…" : "Find invitation"}
          </Button>
        </form>
      ) : null}

      {step === "select" ? (
        <div className="mt-10 space-y-4">
          <p className="text-base text-charcoal">
            Multiple invitations matched. Choose the correct household.
          </p>
          <ul className="space-y-3">
            {candidates.map((candidate) => (
              <li key={candidate.confirmationToken}>
                <button
                  type="button"
                  className="w-full border border-stone bg-parchment/40 px-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  onClick={() => void selectCandidate(candidate)}
                  disabled={pending}
                >
                  <span className="font-display text-xl text-forest">
                    {candidate.displayName}
                  </span>
                  <span className="mt-2 block text-sm text-ink-muted">
                    {candidate.guestPreview.join(", ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {workspace && (step === "respond" || step === "details" || step === "review") ? (
        <div className="mt-8">
          <p className="font-display text-2xl text-forest">
            {workspace.household.displayName}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Invited to {workspace.events.map((event) => event.title).join(", ")}
          </p>
        </div>
      ) : null}

      {workspace && step === "respond" ? (
        <div className="mt-8 space-y-8">
          {workspace.guests.map((guest) => (
            <div key={guest.id} className="border-t border-stone/70 pt-6">
              <h2 className="font-display text-2xl text-forest">
                {guest.isPlusOne && !guest.plusOneNamed
                  ? "Plus-one"
                  : guest.fullName}
              </h2>
              {guest.isPlusOne && !guest.plusOneNamed ? (
                <label className="mt-3 block text-sm">
                  <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
                    Plus-one name
                  </span>
                  <input
                    className="field-editorial"
                    value={
                      drafts.find((draft) => draft.guestId === guest.id)
                        ?.plusOneName ?? ""
                    }
                    onChange={(event) => {
                      for (const eventRecord of workspace.events) {
                        updateDraft(guest.id, eventRecord.id, {
                          plusOneName: event.target.value,
                        });
                      }
                    }}
                  />
                </label>
              ) : null}
              {workspace.events.map((eventRecord) => {
                const draft = drafts.find(
                  (item) =>
                    item.guestId === guest.id && item.eventId === eventRecord.id,
                );
                if (!draft) return null;
                const meals = workspace.mealOptions.filter(
                  (meal) => meal.eventId === eventRecord.id,
                );
                return (
                  <fieldset key={eventRecord.id} className="mt-4">
                    <legend className="font-sans text-xs uppercase tracking-[0.16em] text-gold">
                      {eventRecord.title}
                    </legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(["yes", "no"] as Attending[]).map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={cn(
                            "min-h-11 rounded-sm border px-4 text-sm uppercase tracking-[0.12em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                            draft.attending === value
                              ? "border-gold bg-gold/10 text-forest"
                              : "border-stone text-ink-muted",
                          )}
                          onClick={() =>
                            updateDraft(guest.id, eventRecord.id, {
                              attending: value,
                              mealOptionId:
                                value === "yes" ? draft.mealOptionId : null,
                            })
                          }
                        >
                          {value === "yes" ? "Attending" : "Declines"}
                        </button>
                      ))}
                    </div>
                    {draft.attending === "yes" &&
                    eventRecord.collectMeals &&
                    meals.length > 0 ? (
                      <label className="mt-4 block text-sm">
                        <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
                          Meal
                        </span>
                        <select
                          className="field-editorial"
                          value={draft.mealOptionId ?? ""}
                          onChange={(event) =>
                            updateDraft(guest.id, eventRecord.id, {
                              mealOptionId: event.target.value || null,
                            })
                          }
                        >
                          <option value="">Select a meal</option>
                          {meals.map((meal) => (
                            <option key={meal.id} value={meal.id}>
                              {meal.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                  </fieldset>
                );
              })}
            </div>
          ))}
          <Button
            type="button"
            variant="gold"
            size="lg"
            onClick={() => {
              if (drafts.some((draft) => draft.attending === "unknown")) {
                setError("Please choose attending or declines for each guest.");
                return;
              }
              setError(null);
              setStep("details");
            }}
          >
            Continue
          </Button>
        </div>
      ) : null}

      {workspace && step === "details" ? (
        <div className="mt-8 space-y-6">
          {workspace.guests.map((guest) =>
            workspace.events.map((eventRecord) => {
              const draft = drafts.find(
                (item) =>
                  item.guestId === guest.id && item.eventId === eventRecord.id,
              );
              if (!draft || draft.attending !== "yes") return null;
              return (
                <div
                  key={`${guest.id}-${eventRecord.id}`}
                  className="border-t border-stone/70 pt-5"
                >
                  <h2 className="font-display text-xl text-forest">
                    {guest.fullName} · {eventRecord.title}
                  </h2>
                  <label className="mt-3 block text-sm">
                    <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
                      Dietary restrictions
                    </span>
                    <textarea
                      className="field-editorial min-h-20"
                      value={draft.dietaryNotes}
                      onChange={(event) =>
                        updateDraft(guest.id, eventRecord.id, {
                          dietaryNotes: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="mt-3 block text-sm">
                    <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
                      Accessibility needs
                    </span>
                    <textarea
                      className="field-editorial min-h-20"
                      value={draft.accessibilityNotes}
                      onChange={(event) =>
                        updateDraft(guest.id, eventRecord.id, {
                          accessibilityNotes: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>
              );
            }),
          )}
          {attendingYes ? (
            <>
              <label className="block text-sm">
                <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
                  Song request
                </span>
                <input
                  className="field-editorial"
                  value={songRequest}
                  onChange={(event) => setSongRequest(event.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-2 block uppercase tracking-[0.14em] text-ink-muted">
                  Message to Bright & Lexi
                </span>
                <textarea
                  className="field-editorial min-h-24"
                  value={messageToCouple}
                  onChange={(event) => setMessageToCouple(event.target.value)}
                />
              </label>
            </>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={() => setStep("respond")}>
              Back
            </Button>
            <Button type="button" variant="gold" onClick={() => setStep("review")}>
              Review
            </Button>
          </div>
        </div>
      ) : null}

      {workspace && step === "review" ? (
        <div className="mt-8 space-y-5">
          <h2 className="font-display text-2xl text-forest">Review</h2>
          <ul className="space-y-3 text-sm text-charcoal">
            {drafts.map((draft) => {
              const guest = workspace.guests.find((item) => item.id === draft.guestId);
              const eventRecord = workspace.events.find(
                (item) => item.id === draft.eventId,
              );
              const meal = workspace.mealOptions.find(
                (item) => item.id === draft.mealOptionId,
              );
              return (
                <li key={`${draft.guestId}-${draft.eventId}`} className="border-b border-stone/60 pb-3">
                  <p className="font-display text-lg text-forest">
                    {draft.plusOneName || guest?.fullName} · {eventRecord?.title}
                  </p>
                  <p>Attendance: {draft.attending}</p>
                  {meal ? <p>Meal: {meal.label}</p> : null}
                  {draft.dietaryNotes ? <p>Dietary: {draft.dietaryNotes}</p> : null}
                  {draft.accessibilityNotes ? (
                    <p>Accessibility: {draft.accessibilityNotes}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {songRequest ? <p className="text-sm">Song: {songRequest}</p> : null}
          {messageToCouple ? (
            <p className="text-sm">Message: {messageToCouple}</p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" onClick={() => setStep("details")}>
              Back
            </Button>
            <Button
              type="button"
              variant="gold"
              size="lg"
              disabled={pending}
              onClick={() => void onSubmit()}
            >
              {pending ? "Saving…" : "Confirm RSVP"}
            </Button>
          </div>
        </div>
      ) : null}

      {step === "done" ? (
        <div className="mt-14 flex flex-col items-center space-y-5 text-center">
          <span
            className="heart-pulse font-display text-4xl text-rose"
            aria-hidden
          >
            ♥
          </span>
          <h2 className="font-display text-3xl text-forest sm:text-4xl">
            Thank you
          </h2>
          <p className="max-w-md text-base text-ink-muted">
            Your RSVP is saved{status ? ` (${status})` : ""}.
            {workspace?.household.email
              ? " A confirmation email will send when email is enabled."
              : ""}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setStep("respond")}>
              Update response
            </Button>
            <ButtonLink href="/" variant="gold">
              Return to the invitation
            </ButtonLink>
          </div>
        </div>
      ) : null}

      {step === "lookup" ? (
        <div className="mt-10">
          <ButtonLink href="/#rsvp" variant="ghost">
            Return to the invitation
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}

function buildDrafts(workspace: Workspace): ResponseDraft[] {
  const drafts: ResponseDraft[] = [];
  for (const guest of workspace.guests) {
    for (const eventRecord of workspace.events) {
      const existing = workspace.responses.find(
        (response) =>
          response.guestId === guest.id && response.eventId === eventRecord.id,
      );
      drafts.push({
        guestId: guest.id,
        eventId: eventRecord.id,
        attending: existing?.attending ?? "unknown",
        mealOptionId: existing?.mealOptionId ?? null,
        dietaryNotes: existing?.dietaryNotes ?? "",
        accessibilityNotes: existing?.accessibilityNotes ?? "",
        plusOneName:
          guest.isPlusOne && !guest.plusOneNamed ? "" : undefined,
      });
    }
  }
  return drafts;
}
