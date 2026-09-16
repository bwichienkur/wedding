"use client";

import { cn } from "@/lib/cn";
import { useId, useState, type ReactNode } from "react";

export function Accordion({
  items,
  className,
  variant = "default",
}: {
  items: Array<{
    id: string;
    title: string;
    content: ReactNode;
    defaultOpen?: boolean;
  }>;
  className?: string;
  /** Dark ink on cream panels (home invite FAQ). */
  variant?: "default" | "invite";
}) {
  return (
    <div
      className={cn(
        variant === "invite"
          ? "divide-y divide-[rgb(26_48_80/0.12)] border-y border-[rgb(26_48_80/0.14)]"
          : "divide-y divide-stone/80 border-y border-stone/80",
        className,
      )}
    >
      {items.map((item) => (
        <AccordionItem key={item.id} variant={variant} {...item} />
      ))}
    </div>
  );
}

function AccordionItem({
  id,
  title,
  content,
  defaultOpen = false,
  variant = "default",
}: {
  id: string;
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
  variant?: "default" | "invite";
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const buttonId = useId();

  return (
    <div id={id}>
      <h3>
        <button
          id={buttonId}
          type="button"
          className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span
            className={cn(
              "font-display text-xl sm:text-2xl",
              variant === "invite"
                ? "text-[#0f1e33]"
                : "text-gold",
            )}
          >
            {title}
          </span>
          <span
            aria-hidden
            className={cn(
              "transition-transform",
              variant === "invite" ? "text-[#1a3050]" : "text-gold",
              open && "rotate-45",
            )}
          >
            +
          </span>
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="pb-5"
      >
        {content}
      </div>
    </div>
  );
}

export function Expandable({
  title,
  children,
  badge,
}: {
  title: string;
  children: ReactNode;
  badge?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonId = useId();

  return (
    <div className="border border-gold/25 bg-parchment">
      <h3>
        <button
          id={buttonId}
          type="button"
          className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="font-display text-xl text-gold">{title}</span>
          {badge ? (
            <span className="font-sans text-[0.65rem] uppercase tracking-[0.16em] text-gold">
              {badge}
            </span>
          ) : null}
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!open}>
        <div className="border-t border-stone/70 px-4 py-4">{children}</div>
      </div>
    </div>
  );
}
