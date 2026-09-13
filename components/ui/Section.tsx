"use client";

import { Reveal, RevealGroup, RevealItem, RevealLine } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  contained?: boolean;
}

export function Section({
  id,
  className,
  children,
  eyebrow,
  title,
  description,
  contained = true,
  ...props
}: SectionProps) {
  const body = (
    <>
      {(eyebrow || title || description) && (
        <RevealGroup className="mb-8 text-center">
          {eyebrow ? (
            <RevealItem compact>
              <p className="mb-2 font-sans text-[0.58rem] uppercase tracking-[0.28em] text-invite-gold">
                {eyebrow}
              </p>
            </RevealItem>
          ) : null}
          {title ? (
            <RevealItem>
              <h2 className="invite-section-heading text-balance">{title}</h2>
            </RevealItem>
          ) : null}
          {title ? (
            <RevealItem compact>
              <RevealLine className="mx-auto mt-4 w-14 bg-invite-gold/60" />
            </RevealItem>
          ) : null}
          {description ? (
            <RevealItem compact>
              <p className="invite-section-subline mx-auto mt-4 max-w-sm text-balance">
                {description}
              </p>
            </RevealItem>
          ) : null}
        </RevealGroup>
      )}
      <Reveal>{children}</Reveal>
    </>
  );

  return (
    <section
      id={id}
      className={cn("invite-section", className)}
      {...props}
    >
      {contained ? <div className="mx-auto w-full">{body}</div> : body}
    </section>
  );
}
