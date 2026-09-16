"use client";

import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { InviteDivider } from "@/components/invite/InviteDecor";
import {
  householdRsvpSummary,
  inferHouseholdCeremonyAttending,
  inferHouseholdWelcomeAttending,
  countWelcomeGuests,
  resolveCeremonyAndWelcomeEvents,
  type HouseholdYesNo,
} from "@/components/rsvp/attendance-plan";
import { RsvpStepper } from "@/components/rsvp/RsvpStepper";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";
import type { Attending, EventRecord, HouseholdCandidate } from "@/lib/rsvp/types";
import { useCallback, useEffect, useMemo, useState } from "react";

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
    guestAllowance: number;
  };
  guests: WorkspaceGuest[];
  events: EventRecord[];
  mealOptions: unknown[];
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

interface RosterEntry {
  id?: string;
  fullName: string;
}

interface HouseholdForm {
  ceremonyAttending: HouseholdYesNo;
  welcomeAttending: HouseholdYesNo;
  welcomeGuestCount: number;
  roster: RosterEntry[];
  notesByGuestId: Record<
    string,
    { dietaryNotes: string; accessibilityNotes: string }
  >;
}

function buildInitialForm(workspace: Workspace): HouseholdForm {
  const pair = resolveCeremonyAndWelcomeEvents(workspace.events);
  const guestIds = workspace.guests.map((guest) => guest.id);
  const ceremonyAttending = pair
    ? inferHouseholdCeremonyAttending(
        workspace.responses,
        pair.ceremony.id,
        guestIds,
      )
    : "unknown";
  const welcomeAttending = pair
    ? inferHouseholdWelcomeAttending(
        workspace.responses,
        pair.welcome.id,
        guestIds,
      )
    : "unknown";
  const welcomeGuestCount = pair
    ? Math.max(
        1,
        countWelcomeGuests(workspace.responses, pair.welcome.id, guestIds),
      )
    : 1;

  const notesByGuestId: HouseholdForm["notesByGuestId"] = {};
  for (const guest of workspace.guests) {
    const note =
      workspace.responses.find((response) => response.guestId === guest.id) ??
      null;
    notesByGuestId[guest.id] = {
      dietaryNotes: note?.dietaryNotes ?? "",
      accessibilityNotes: note?.accessibilityNotes ?? "",
    };
  }

  return {
    ceremonyAttending,
    welcomeAttending,
    welcomeGuestCount,
    roster: workspace.guests.map((guest) => ({
      id: guest.id,
      fullName: guest.fullName,
    })),
    notesByGuestId,
  };
}

export function RsvpExperience() {
  const [step, setStep] = useState<Step>("lookup");
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<HouseholdCandidate[]>([]);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [form, setForm] = useState<HouseholdForm | null>(null);
  const [messageToCouple, setMessageToCouple] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [householdPickerAvailable, setHouseholdPickerAvailable] = useState(false);

  const applyWorkspace = useCallback((next: Workspace) => {
    setWorkspace(next);
    setForm(buildInitialForm(next));
  }, []);

  async function clearInvitationSession() {
    await fetch("/api/rsvp/session", { method: "DELETE" });
    setWorkspace(null);
    setForm(null);
  }

  async function returnToInvitationSearch() {
    setPending(true);
    setError(null);
    try {
      await clearInvitationSession();
      setStep(
        householdPickerAvailable && candidates.length > 1 ? "select" : "lookup",
      );
    } finally {
      setPending(false);
    }
  }

  function goToPreviousStep() {
    setError(null);
    if (step === "review") {
      const attending =
        form?.ceremonyAttending === "yes" || form?.welcomeAttending === "yes";
      setStep(attending ? "details" : "respond");
      return;
    }
    if (step === "details") {
      setStep("respond");
    }
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/rsvp/session");
      if (!response.ok || cancelled) return;
      const data = (await response.json()) as { workspace: Workspace | null };
      if (data.workspace && !cancelled) {
        applyWorkspace(data.workspace);
        setStep("respond");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyWorkspace]);

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
        setHouseholdPickerAvailable(false);
        setStep("lookup");
      } else if (next.length === 1) {
        setHouseholdPickerAvailable(false);
        await selectCandidate(next[0]!);
      } else {
        setHouseholdPickerAvailable(true);
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
      applyWorkspace(data.workspace);
      setStep("respond");
    } catch {
      setError("Unable to open invitation.");
    } finally {
      setPending(false);
    }
  }

  const attendingAny = useMemo(() => {
    if (!form) return false;
    return form.ceremonyAttending === "yes" || form.welcomeAttending === "yes";
  }, [form]);

  async function onSubmit() {
    if (!workspace || !form) return;
    if (form.ceremonyAttending === "unknown" || form.welcomeAttending === "unknown") {
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/rsvp/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ceremonyAttending: form.ceremonyAttending,
          welcomeAttending: form.welcomeAttending,
          welcomeGuestCount:
            form.welcomeAttending === "yes" ? form.welcomeGuestCount : 0,
          guestRoster:
            form.ceremonyAttending === "yes" ? form.roster : undefined,
          guestNotes: Object.entries(form.notesByGuestId).map(
            ([guestId, notes]) => ({
              guestId,
              dietaryNotes: notes.dietaryNotes,
              accessibilityNotes: notes.accessibilityNotes,
            }),
          ),
          songRequest: "",
          messageToCouple,
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

  function validateRespondStep(): string | null {
    if (!workspace || !form) return "Unable to continue.";
    if (form.ceremonyAttending === "unknown") {
      return "Please choose whether you are attending the ceremony.";
    }
    if (form.welcomeAttending === "unknown") {
      return "Please choose whether you are attending the welcome party.";
    }
    if (form.ceremonyAttending === "yes") {
      const names = form.roster.map((entry) => entry.fullName.trim()).filter(Boolean);
      if (names.length === 0) {
        return "Add at least one guest name for the ceremony.";
      }
      if (names.length > workspace.household.guestAllowance) {
        return `Your invitation includes up to ${workspace.household.guestAllowance} guests.`;
      }
    }
    if (form.welcomeAttending === "yes") {
      const maxWelcome =
        form.ceremonyAttending === "yes"
          ? form.roster.filter((entry) => entry.fullName.trim()).length
          : workspace.household.guestAllowance;
      if (form.welcomeGuestCount < 1 || form.welcomeGuestCount > maxWelcome) {
        return `Choose 1–${maxWelcome} guests for the welcome party.`;
      }
    }
    return null;
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
                </button>
              </li>
            ))}
          </ul>
          <RsvpFlowNav
            backLabel="Back to search"
            onBack={() => {
              setError(null);
              setStep("lookup");
            }}
            pending={pending}
          />
        </div>
      ) : null}

      {workspace && form && (step === "respond" || step === "details" || step === "review") ? (
        <>
          <HouseholdSummary workspace={workspace} form={form} />
          <RsvpFlowNav
            backLabel={step === "respond" ? undefined : "Back"}
            onBack={step === "respond" ? undefined : goToPreviousStep}
            changeInvitationLabel="Wrong invitation? Search again"
            onChangeInvitation={() => void returnToInvitationSearch()}
            pending={pending}
            className="mt-4"
          />
        </>
      ) : null}

      {workspace && form && step === "respond" ? (
        <RespondStep
          workspace={workspace}
          form={form}
          setForm={(updater) =>
            setForm((current) => (current ? updater(current) : current))
          }
          onContinue={() => {
            const validationError = validateRespondStep();
            if (validationError) {
              setError(validationError);
              return;
            }
            setError(null);
            setStep(attendingAny ? "details" : "review");
          }}
        />
      ) : null}

      {workspace && form && step === "details" ? (
        <DetailsStep
          workspace={workspace}
          form={form}
          setForm={(updater) =>
            setForm((current) => (current ? updater(current) : current))
          }
          messageToCouple={messageToCouple}
          setMessageToCouple={setMessageToCouple}
          onContinue={() => setStep("review")}
        />
      ) : null}

      {workspace && form && step === "review" ? (
        <ReviewStep
          form={form}
          messageToCouple={messageToCouple}
          pending={pending}
          onSubmit={() => void onSubmit()}
        />
      ) : null}

      {step === "done" ? (
        <div className="mt-10 flex flex-col items-center space-y-5 text-center">
          <span className="font-display text-4xl text-invite-gold" aria-hidden>
            ♥
          </span>
          <h2 className="font-display text-3xl text-invite-navy sm:text-4xl">
            Thank you
          </h2>
          <p className="max-w-md text-base leading-relaxed text-invite-body/85">
            Your RSVP is saved.
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
            <Button
              type="button"
              variant="secondary"
              className="invite-outline-button !text-invite-navy"
              onClick={() => void returnToInvitationSearch()}
            >
              Search for a different invitation
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

function YesNoChoice({
  label,
  value,
  onChange,
}: {
  label: string;
  value: HouseholdYesNo;
  onChange: (value: Exclude<HouseholdYesNo, "unknown">) => void;
}) {
  return (
    <fieldset>
      <legend className="font-sans text-xs uppercase tracking-[0.16em] text-invite-gold">
        {label}
      </legend>
      <div className="invite-rsvp-segments mt-3 flex gap-2">
        {(
          [
            ["yes", "Attending"],
            ["no", "Not attending"],
          ] as const
        ).map(([choice, text]) => (
          <button
            key={choice}
            type="button"
            className={cn(
              "invite-rsvp-segment flex-1",
              value === choice && "is-active",
            )}
            aria-pressed={value === choice}
            onClick={() => onChange(choice)}
          >
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function RespondStep({
  workspace,
  form,
  setForm,
  onContinue,
}: {
  workspace: Workspace;
  form: HouseholdForm;
  setForm: (updater: (current: HouseholdForm) => HouseholdForm) => void;
  onContinue: () => void;
}) {
  const welcomeMax =
    form.ceremonyAttending === "yes"
      ? form.roster.filter((entry) => entry.fullName.trim()).length
      : workspace.household.guestAllowance;

  return (
    <div className="mt-8 space-y-6">
      <YesNoChoice
        label="Attending ceremony & reception?"
        value={form.ceremonyAttending}
        onChange={(ceremonyAttending) =>
          setForm((current) => ({ ...current, ceremonyAttending }))
        }
      />

      {form.ceremonyAttending === "yes" ? (
        <RosterEditor
          roster={form.roster}
          allowance={workspace.household.guestAllowance}
          onChange={(roster) => setForm((current) => ({ ...current, roster }))}
        />
      ) : null}

      <YesNoChoice
        label="Attending welcome party?"
        value={form.welcomeAttending}
        onChange={(welcomeAttending) =>
          setForm((current) => ({
            ...current,
            welcomeAttending,
            welcomeGuestCount:
              welcomeAttending === "yes"
                ? Math.min(
                    Math.max(1, current.welcomeGuestCount),
                    welcomeMax || 1,
                  )
                : current.welcomeGuestCount,
          }))
        }
      />

      {form.welcomeAttending === "yes" ? (
        <label className="block text-sm">
          <span className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-invite-body/75">
            How many guests for the welcome party?
          </span>
          <select
            className="invite-faq-input"
            value={form.welcomeGuestCount}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                welcomeGuestCount: Number(event.target.value),
              }))
            }
          >
            {Array.from({ length: Math.max(1, welcomeMax) }, (_, index) => {
              const count = index + 1;
              return (
                <option key={count} value={count}>
                  {count} guest{count === 1 ? "" : "s"}
                </option>
              );
            })}
          </select>
          <p className="mt-2 text-xs text-invite-body/70">
            Up to {welcomeMax} guest{welcomeMax === 1 ? "" : "s"} on your
            invitation.
          </p>
        </label>
      ) : null}

      <Button type="button" variant="gold" size="lg" className="w-full" onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}

function RosterEditor({
  roster,
  allowance,
  onChange,
}: {
  roster: RosterEntry[];
  allowance: number;
  onChange: (roster: RosterEntry[]) => void;
}) {
  return (
    <div className="invite-rsvp-guest-card">
      <p className="font-sans text-xs uppercase tracking-[0.16em] text-invite-gold">
        Guests on your invitation
      </p>
      <p className="mt-2 text-sm text-invite-body/80">
        Edit names, or add/remove guests (up to {allowance} total).
      </p>
      <ul className="mt-4 space-y-2">
        {roster.map((entry, index) => (
          <li key={entry.id ?? `new-${index}`} className="flex gap-2">
            <input
              className="invite-faq-input flex-1"
              value={entry.fullName}
              onChange={(event) => {
                const next = [...roster];
                next[index] = { ...entry, fullName: event.target.value };
                onChange(next);
              }}
            />
            <Button
              type="button"
              variant="ghost"
              className="!text-red-200/90"
              disabled={roster.length <= 1}
              onClick={() => onChange(roster.filter((_, i) => i !== index))}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="secondary"
        className="invite-outline-button mt-3 !text-invite-navy"
        disabled={roster.length >= allowance}
        onClick={() => onChange([...roster, { fullName: "" }])}
      >
        Add guest
      </Button>
    </div>
  );
}

function DetailsStep({
  workspace,
  form,
  setForm,
  messageToCouple,
  setMessageToCouple,
  onContinue,
}: {
  workspace: Workspace;
  form: HouseholdForm;
  setForm: (updater: (current: HouseholdForm) => HouseholdForm) => void;
  messageToCouple: string;
  setMessageToCouple: (value: string) => void;
  onContinue: () => void;
}) {
  const rosterNames =
    form.ceremonyAttending === "yes"
      ? form.roster.filter((entry) => entry.fullName.trim())
      : workspace.guests.map((guest) => ({ id: guest.id, fullName: guest.fullName }));

  return (
    <div className="mt-8 space-y-6">
      {rosterNames.map((entry, index) => {
        const guestId = entry.id ?? workspace.guests[index]?.id ?? `draft-${index}`;
        const notes = form.notesByGuestId[guestId] ?? {
          dietaryNotes: "",
          accessibilityNotes: "",
        };
        return (
          <div key={guestId} className="invite-rsvp-guest-card">
            <h2 className="font-display text-lg text-invite-navy">
              {entry.fullName.trim() || "Guest"}
            </h2>
            <label className="mt-4 block text-sm">
              <span className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-invite-body/75">
                Dietary restrictions
              </span>
              <textarea
                className="invite-faq-input min-h-20 resize-y"
                value={notes.dietaryNotes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notesByGuestId: {
                      ...current.notesByGuestId,
                      [guestId]: {
                        ...notes,
                        dietaryNotes: event.target.value,
                      },
                    },
                  }))
                }
              />
            </label>
            <label className="mt-3 block text-sm">
              <span className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-invite-body/75">
                Accessibility needs
              </span>
              <textarea
                className="invite-faq-input min-h-20 resize-y"
                value={notes.accessibilityNotes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notesByGuestId: {
                      ...current.notesByGuestId,
                      [guestId]: {
                        ...notes,
                        accessibilityNotes: event.target.value,
                      },
                    },
                  }))
                }
              />
            </label>
          </div>
        );
      })}
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
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="gold" onClick={onContinue}>
          Review
        </Button>
      </div>
    </div>
  );
}

function ReviewStep({
  form,
  messageToCouple,
  pending,
  onSubmit,
}: {
  form: HouseholdForm;
  messageToCouple: string;
  pending: boolean;
  onSubmit: () => void;
}) {
  const rosterSize = form.roster.filter((entry) => entry.fullName.trim()).length;
  return (
    <div className="mt-8 space-y-5">
      <h2 className="text-center font-display text-2xl text-invite-gold-bright">
        Review your RSVP
      </h2>
      <p className="text-center text-sm text-invite-body-soft/95">
        {householdRsvpSummary({
          ceremonyAttending: form.ceremonyAttending,
          welcomeAttending: form.welcomeAttending,
          welcomeGuestCount: form.welcomeGuestCount,
          rosterSize,
        })}
      </p>
      {form.ceremonyAttending === "yes" ? (
        <ul className="invite-rsvp-review-list space-y-2 text-sm">
          {form.roster
            .filter((entry) => entry.fullName.trim())
            .map((entry) => (
              <li key={entry.id ?? entry.fullName} className="invite-rsvp-review-item">
                {entry.fullName.trim()}
              </li>
            ))}
        </ul>
      ) : null}
      {messageToCouple ? (
        <p className="text-sm text-invite-body-soft/90">Message: {messageToCouple}</p>
      ) : null}
      <div className="flex flex-wrap gap-3 pt-2">
        <Button
          type="button"
          variant="gold"
          size="lg"
          disabled={pending}
          onClick={onSubmit}
        >
          {pending ? "Saving…" : "Confirm RSVP"}
        </Button>
      </div>
    </div>
  );
}

function HouseholdSummary({
  workspace,
  form,
}: {
  workspace: Workspace;
  form: HouseholdForm;
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
        Up to {workspace.household.guestAllowance} guests on this invitation.
      </p>
      {form.ceremonyAttending !== "yes" ? (
        <ul className="invite-rsvp-roster-names mt-4">
          {workspace.guests.map((guest) => (
            <li key={guest.id}>{guest.fullName}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function RsvpFlowNav({
  backLabel,
  onBack,
  changeInvitationLabel,
  onChangeInvitation,
  pending,
  className,
}: {
  backLabel?: string;
  onBack?: () => void;
  changeInvitationLabel?: string;
  onChangeInvitation?: () => void;
  pending?: boolean;
  className?: string;
}) {
  if (!backLabel && !changeInvitationLabel) return null;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 border-t border-invite-body/10 pt-4",
        backLabel ? "justify-between" : "justify-end",
        className,
      )}
    >
      {backLabel && onBack ? (
        <Button
          type="button"
          variant="secondary"
          className="invite-outline-button !text-invite-navy"
          disabled={pending}
          onClick={onBack}
        >
          {backLabel}
        </Button>
      ) : null}
      {changeInvitationLabel && onChangeInvitation ? (
        <button
          type="button"
          className="text-sm text-invite-body/80 underline decoration-invite-body/30 underline-offset-4 hover:text-invite-gold disabled:opacity-50"
          disabled={pending}
          onClick={onChangeInvitation}
        >
          {changeInvitationLabel}
        </button>
      ) : null}
    </div>
  );
}
