"use client";

import { cn } from "@/lib/cn";

const STEPS = ["Find", "Your RSVP"] as const;

export function rsvpStepIndex(
  step: "lookup" | "select" | "form" | "done",
): number {
  switch (step) {
    case "lookup":
    case "select":
      return 0;
    case "form":
      return 1;
    case "done":
      return 2;
    default:
      return 0;
  }
}

export function RsvpStepper({
  step,
}: {
  step: "lookup" | "select" | "form" | "done";
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
