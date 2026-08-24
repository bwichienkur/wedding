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
        <header className="mb-10 max-w-2xl md:mb-14">
          {eyebrow ? (
            <p className="mb-3 font-sans text-xs uppercase tracking-[0.22em] text-gold">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="font-display text-balance text-3xl text-forest sm:text-4xl md:text-5xl">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-muted sm:text-lg">
              {description}
            </p>
          ) : null}
        </header>
      )}
      {children}
    </>
  );

  return (
    <section
      id={id}
      className={cn("relative scroll-mt-24 py-16 md:py-24", className)}
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
