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
        <RevealGroup className="mb-10 max-w-2xl md:mb-14">
          {eyebrow ? (
            <RevealItem compact>
              <p className="mb-3 font-sans text-xs uppercase tracking-[0.28em] text-gold">
                {eyebrow}
              </p>
            </RevealItem>
          ) : null}
          {title ? (
            <RevealItem>
              <h2 className="font-display text-balance text-4xl font-medium text-forest sm:text-5xl md:text-6xl">
                {title}
              </h2>
            </RevealItem>
          ) : null}
          {title ? (
            <RevealItem compact>
              <RevealLine className="mt-5 w-20" />
            </RevealItem>
          ) : null}
          {description ? (
            <RevealItem compact>
              <p className="mt-5 max-w-prose text-base leading-relaxed text-ink-muted sm:text-lg">
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
      className={cn("relative scroll-mt-28 py-16 md:py-28", className)}
      {...props}
    >
      {contained ? (
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
          {body}
        </div>
      ) : (
        body
      )}
    </section>
  );
}
