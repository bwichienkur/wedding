"use client";

import { cn } from "@/lib/cn";
import { useId, useState, type ReactNode } from "react";

export function Accordion({
  items,
}: {
  items: Array<{
    id: string;
    title: string;
    content: ReactNode;
    defaultOpen?: boolean;
  }>;
}) {
  return (
    <div className="divide-y divide-stone/80 border-y border-stone/80">
      {items.map((item) => (
        <AccordionItem key={item.id} {...item} />
      ))}
    </div>
  );
}

function AccordionItem({
  id,
  title,
  content,
  defaultOpen = false,
}: {
  id: string;
  title: string;
  content: ReactNode;
  defaultOpen?: boolean;
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
          <span className="font-display text-xl text-gold sm:text-2xl">
            {title}
          </span>
          <span
            aria-hidden
            className={cn(
              "text-gold transition-transform",
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
