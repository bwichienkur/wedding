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
        <RevealGroup className="mb-10 max-w-2xl text-center md:mb-12">
          {eyebrow ? (
            <RevealItem compact>
              <p className="mb-3 font-sans text-[0.65rem] uppercase tracking-[0.3em] text-invite-gold">
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
              <RevealLine className="mx-auto mt-5 w-16 bg-invite-gold/70" />
            </RevealItem>
          ) : null}
          {description ? (
            <RevealItem compact>
              <p className="mx-auto mt-5 max-w-prose text-base leading-relaxed text-invite-body/85 sm:text-lg">
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
      className={cn(
        "relative scroll-mt-28 border-t border-invite-gold/15 px-6 py-16 first:border-t-0 md:px-8 md:py-24",
        className,
      )}
      {...props}
    >
      {contained ? (
        <div className="mx-auto w-full max-w-lg">{body}</div>
      ) : (
        body
      )}
    </section>
  );
}
