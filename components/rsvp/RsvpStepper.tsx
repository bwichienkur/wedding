"use client";

import { cn } from "@/lib/cn";

const STEPS = ["Find", "Respond", "Details", "Review"] as const;

export function rsvpStepIndex(
  step:
    | "lookup"
    | "select"
    | "respond"
    | "details"
    | "review"
    | "done",
): number {
  switch (step) {
    case "lookup":
    case "select":
      return 0;
    case "respond":
      return 1;
    case "details":
      return 2;
    case "review":
      return 3;
    case "done":
      return 4;
    default:
      return 0;
  }
}

export function RsvpStepper({
  step,
}: {
  step:
    | "lookup"
    | "select"
    | "respond"
    | "details"
    | "review"
    | "done";
}) {
  const active = rsvpStepIndex(step);
  if (step === "done") {
    return null;
  }

  return (
    <nav
      className="invite-rsvp-stepper"
      aria-label="RSVP progress"
    >
      <ol className="invite-rsvp-stepper-list">
        {STEPS.map((label, index) => {
          const isActive = index === active;
          const isComplete = index < active;
          return (
            <li
              key={label}
              className={cn(
                "invite-rsvp-step",
                isActive && "is-active",
                isComplete && "is-complete",
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <span className="invite-rsvp-step-marker" aria-hidden>
                {isComplete ? "✓" : index + 1}
              </span>
              <span className="invite-rsvp-step-label">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
