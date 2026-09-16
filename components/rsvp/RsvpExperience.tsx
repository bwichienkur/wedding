"use client";

import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { InviteDivider } from "@/components/invite/InviteDecor";
import { guestDisplayName } from "@/components/rsvp/rsvp-copy";
import {
  ATTENDANCE_PLAN_OPTIONS,
  attendancePlanForGuest,
  attendancePlanLabel,
  attendingForPlan,
  resolveCeremonyAndWelcomeEvents,
  type AttendancePlan,
} from "@/components/rsvp/attendance-plan";
import { RsvpStepper } from "@/components/rsvp/RsvpStepper";
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
  const [messageToCouple, setMessageToCouple] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
          songRequest: "",
          messageToCouple,
          responses: drafts,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Unable to save RSVP.");
        return;
      }
      setStep("done");
    } catch {
      setError("Unable to save RSVP.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="invite-rsvp-flow invite-glass-card mx-auto w-full max-w-lg px-5 py-6 sm:px-7 sm:py-8">
      <p className="font-sans text-[0.58rem] uppercase tracking-[0.28em] text-invite-gold">
        RSVP
      </p>
      <h1 className="invite-section-heading mt-2 text-balance">
        {wedding.couple.displayName}
      </h1>
      <p
        className={cn(
          "invite-section-subline mx-auto mt-3 max-w-md text-center",
          wedding.rsvp.deadlineIsPlaceholder && "placeholder-copy italic",
        )}
      >
        {wedding.rsvp.deadlineLabel}
      </p>
      <InviteDivider className="mx-auto my-6 w-14" />

      <RsvpStepper step={step} />

      {error ? (
        <p className="invite-rsvp-error mt-6 text-sm" role="alert">
          {error}
        </p>
      ) : null}

      {step === "lookup" ? (
        <form onSubmit={onLookup} className="mt-8 space-y-5">
          <label className="block text-sm" htmlFor="rsvp-lookup">
            <span className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-invite-body/75">
              Full name or invitation code
            </span>
            <input
              id="rsvp-lookup"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="invite-faq-input"
              autoComplete="name"
              required
              minLength={2}
              placeholder="Name as it appears on your invitation"
            />
          </label>
          <p className="text-sm text-invite-body/75">
            Use your first or last name, full name, or invitation code — spelling
            can be partial (e.g. “Lexi” or “Wichienkur”).
          </p>
          <Button
            type="submit"
            variant="gold"
            size="lg"
            disabled={pending}
            className="w-full"
          >
            {pending ? "Searching…" : "Find invitation"}
          </Button>
        </form>
      ) : null}

      {step === "select" ? (
        <div className="mt-8 space-y-4">
          <p className="text-center text-sm leading-relaxed text-invite-body/85">
            More than one invitation matched. Choose yours below.
          </p>
          <ul className="space-y-3">
            {candidates.map((candidate) => (
              <li key={candidate.confirmationToken}>
                <button
                  type="button"
                  className="invite-rsvp-household-pick"
                  onClick={() => void selectCandidate(candidate)}
                  disabled={pending}
                >
                  <span className="font-display text-xl text-invite-navy">
                    {candidate.displayName}
                  </span>
                  <span className="mt-2 block text-sm text-invite-body/85">
                    {candidate.guestPreview.join(" · ")}
                  </span>
                  {candidate.invitedEventTitles.length > 0 ? (
                    <span className="mt-2 block font-sans text-[0.58rem] uppercase tracking-[0.18em] text-invite-gold">
                      {candidate.invitedEventTitles.join(" · ")}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {workspace &&
      (step === "respond" || step === "details" || step === "review") ? (
        <HouseholdSummary workspace={workspace} drafts={drafts} />
      ) : null}

      {workspace && step === "respond" ? (
        <RespondStep
          workspace={workspace}
          drafts={drafts}
          onSetPlan={(guestId, plan) => {
            const pair = resolveCeremonyAndWelcomeEvents(workspace.events);
            if (!pair) return;
            const ceremonyAttending = attendingForPlan(plan, "ceremony");
            const welcomeAttending = attendingForPlan(plan, "welcome");
            updateDraft(guestId, pair.ceremony.id, {
              attending: ceremonyAttending,
              mealOptionId: null,
            });
            updateDraft(guestId, pair.welcome.id, {
              attending: welcomeAttending,
              mealOptionId: null,
            });
          }}
          updateDraft={updateDraft}
          onContinue={() => {
            const pair = resolveCeremonyAndWelcomeEvents(workspace.events);
            if (!pair) {
              setError("RSVP events are not configured.");
              return;
            }
            const incomplete = workspace.guests.some(
              (guest) =>
                attendancePlanForGuest(
                  drafts,
                  guest.id,
                  pair.ceremony.id,
                  pair.welcome.id,
                ) === "unknown",
            );
            if (incomplete) {
              setError(
                "Please choose ceremony, welcome party, both, or can’t attend for each guest.",
              );
              return;
            }
            setError(null);
            setStep("details");
          }}
        />
      ) : null}

      {workspace && step === "details" ? (
        <div className="mt-8 space-y-6">
          {workspace.guests.map((guest) => {
            const pair = resolveCeremonyAndWelcomeEvents(workspace.events);
            if (!pair) return null;
            const plan = attendancePlanForGuest(
              drafts,
              guest.id,
              pair.ceremony.id,
              pair.welcome.id,
            );
            if (plan === "neither" || plan === "unknown") return null;
            const draft =
              drafts.find(
                (item) =>
                  item.guestId === guest.id &&
                  item.eventId === pair.ceremony.id,
              ) ??
              drafts.find(
                (item) =>
                  item.guestId === guest.id && item.eventId === pair.welcome.id,
              );
            if (!draft) return null;
            return (
              <div key={guest.id} className="invite-rsvp-guest-card">
                <h2 className="font-display text-lg text-invite-navy">
                  {guestDisplayName(guest, draft.plusOneName)}
                </h2>
                <label className="mt-4 block text-sm">
                  <span className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-invite-body/75">
                    Dietary restrictions
                  </span>
                  <textarea
                    className="invite-faq-input min-h-20 resize-y"
                    value={draft.dietaryNotes}
                    onChange={(event) => {
                      for (const eventRecord of workspace.events) {
                        updateDraft(guest.id, eventRecord.id, {
                          dietaryNotes: event.target.value,
                        });
                      }
                    }}
                  />
                </label>
                <label className="mt-3 block text-sm">
                  <span className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-invite-body/75">
                    Accessibility needs
                  </span>
                  <textarea
                    className="invite-faq-input min-h-20 resize-y"
                    value={draft.accessibilityNotes}
                    onChange={(event) => {
                      for (const eventRecord of workspace.events) {
                        updateDraft(guest.id, eventRecord.id, {
                          accessibilityNotes: event.target.value,
                        });
                      }
                    }}
                  />
                </label>
              </div>
            );
          })}
          {attendingYes ? (
            <label className="block text-sm">
              <span className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-invite-gold">
                Message to Bright & Lexi
              </span>
              <textarea
                className="invite-faq-input min-h-28 resize-y"
                value={messageToCouple}
                onChange={(event) => setMessageToCouple(event.target.value)}
                placeholder="Optional note for the couple"
              />
            </label>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              className="invite-outline-button !text-invite-navy"
              onClick={() => setStep("respond")}
            >
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
          <h2 className="text-center font-display text-2xl text-invite-gold-bright">
            Review your RSVP
          </h2>
          <ul className="invite-rsvp-review-list space-y-3 text-sm text-invite-body-soft/95">
            {workspace.guests.map((guest) => {
              const pair = resolveCeremonyAndWelcomeEvents(workspace.events);
              if (!pair) return null;
              const plan = attendancePlanForGuest(
                drafts,
                guest.id,
                pair.ceremony.id,
                pair.welcome.id,
              );
              const draft = drafts.find((item) => item.guestId === guest.id);
              return (
                <li key={guest.id} className="invite-rsvp-review-item">
                  <p className="font-display text-lg text-invite-gold-bright">
                    {guestDisplayName(guest, draft?.plusOneName)}
                  </p>
                  <p className="mt-1 text-invite-body-soft/95">
                    {attendancePlanLabel(plan)}
                  </p>
                  {draft?.dietaryNotes ? (
                    <p className="mt-1 text-invite-body-soft/85">
                      Dietary: {draft.dietaryNotes}
                    </p>
                  ) : null}
                  {draft?.accessibilityNotes ? (
                    <p className="mt-1 text-invite-body-soft/85">
                      Accessibility: {draft.accessibilityNotes}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {messageToCouple ? (
            <p className="text-sm text-invite-body-soft/90">
              Message: {messageToCouple}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="invite-outline-button !text-invite-navy"
              onClick={() => setStep("details")}
            >
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
        <div className="mt-10 flex flex-col items-center space-y-5 text-center">
          <span
            className="font-display text-4xl text-invite-gold"
            aria-hidden
          >
            ♥
          </span>
          <h2 className="font-display text-3xl text-invite-navy sm:text-4xl">
            Thank you
          </h2>
          <p className="max-w-md text-base leading-relaxed text-invite-body/85">
            Your RSVP is saved.
            {workspace?.household.email
              ? " A confirmation email will send when email is enabled."
              : " We’re so glad you let us know."}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="invite-outline-button !text-invite-navy"
              onClick={() => setStep("respond")}
            >
              Update response
            </Button>
            <ButtonLink href="/" variant="gold">
              Return to the invitation
            </ButtonLink>
          </div>
        </div>
      ) : null}

      {step === "lookup" || step === "select" ? (
        <div className="mt-10 text-center">
          <ButtonLink
            href="/#rsvp"
            variant="ghost"
            className="!text-invite-body/80 hover:!text-invite-gold"
          >
            Return to the invitation
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}

function RespondStep({
  workspace,
  drafts,
  onSetPlan,
  updateDraft,
  onContinue,
}: {
  workspace: Workspace;
  drafts: ResponseDraft[];
  onSetPlan: (guestId: string, plan: AttendancePlan) => void;
  updateDraft: (
    guestId: string,
    eventId: string,
    patch: Partial<ResponseDraft>,
  ) => void;
  onContinue: () => void;
}) {
  const pair = resolveCeremonyAndWelcomeEvents(workspace.events);
  if (!pair) {
    return (
      <p className="mt-8 text-sm text-invite-body/85" role="alert">
        RSVP events are not configured. Please contact the couple.
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {workspace.guests.map((guest) => {
        const plan = attendancePlanForGuest(
          drafts,
          guest.id,
          pair.ceremony.id,
          pair.welcome.id,
        );
        return (
          <div key={guest.id} className="invite-rsvp-guest-card">
            <h2 className="font-display text-xl text-invite-navy sm:text-2xl">
              {guest.isPlusOne && !guest.plusOneNamed
                ? "Plus-one"
                : guest.fullName}
            </h2>
            {guest.isPlusOne && !guest.plusOneNamed ? (
              <label className="mt-4 block text-sm">
                <span className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-invite-body/75">
                  Plus-one name
                </span>
                <input
                  className="invite-faq-input"
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
            <fieldset className="mt-5">
              <legend className="font-sans text-xs uppercase tracking-[0.16em] text-invite-gold">
                Will join you for
              </legend>
              <div
                className="invite-rsvp-segments mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
                role="group"
                aria-label={`Attendance for ${guest.fullName}`}
              >
                {ATTENDANCE_PLAN_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={cn(
                      "invite-rsvp-segment min-w-[10rem] flex-1",
                      plan === option.value && "is-active",
                    )}
                    aria-pressed={plan === option.value}
                    onClick={() => onSetPlan(guest.id, option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
        );
      })}
      <Button
        type="button"
        variant="gold"
        size="lg"
        className="w-full"
        onClick={onContinue}
      >
        Continue
      </Button>
    </div>
  );
}

function HouseholdSummary({
  workspace,
  drafts,
}: {
  workspace: Workspace;
  drafts: ResponseDraft[];
}) {
  return (
    <div className="invite-rsvp-roster mt-8">
      <p className="font-sans text-[0.58rem] uppercase tracking-[0.22em] text-invite-gold">
        Your invitation
      </p>
      <p className="mt-2 font-display text-2xl text-invite-navy">
        {workspace.household.displayName}
      </p>
      <p className="mt-2 text-sm text-invite-body/85">
        You&apos;re invited to the welcome party and ceremony & reception.
        Choose what each guest will attend below.
      </p>
      <ul className="invite-rsvp-roster-names mt-4">
        {workspace.guests.map((guest) => {
          const draft = drafts.find((item) => item.guestId === guest.id);
          return (
            <li key={guest.id}>
              {guestDisplayName(guest, draft?.plusOneName)}
              {guest.isChild ? (
                <span className="text-invite-body/60"> · Child</span>
              ) : null}
            </li>
          );
        })}
      </ul>
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
