"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
}

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("SectionErrorBoundary", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-xl px-5 py-16 text-center" role="alert">
          <p className="font-display text-2xl text-forest">
            {this.props.title ?? "This section couldn’t load"}
          </p>
          <p className="mt-3 text-sm text-ink-muted">
            The rest of the invitation remains available. Refresh to try again,
            or continue to wedding details.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink href="#wedding-day" variant="gold">
              Wedding details
            </ButtonLink>
            <ButtonLink href="#rsvp" variant="secondary">
              RSVP
            </ButtonLink>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
