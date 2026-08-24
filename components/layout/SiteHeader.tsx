"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  mobileNavGroups,
  mobileQuickNav,
  primaryNav,
  rsvpNav,
} from "@/data/navigation";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";
import { useEffect, useId, useState } from "react";

const observedSectionIds = Array.from(
  new Set([
    ...primaryNav.map((item) => item.id),
    ...mobileNavGroups.flatMap((group) => group.items.map((item) => item.id)),
    rsvpNav.id,
  ]),
);

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const menuId = useId();

  useEffect(() => {
    const sections = observedSectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-stone/50 bg-ivory/95 backdrop-blur-md">
      <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:min-h-16 sm:px-8 lg:px-10">
        <a
          href="#home"
          className="font-display text-lg tracking-wide text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          {wedding.couple.displayName}
        </a>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 lg:flex"
        >
          {primaryNav.map((item) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={activeId === item.id ? "true" : undefined}
              className={cn(
                "min-h-11 px-3 py-2 font-sans text-xs uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                activeId === item.id && "text-forest",
              )}
            >
              {item.label}
            </a>
          ))}
          <ButtonLink href={rsvpNav.href} variant="gold" size="md" className="ml-3">
            {rsvpNav.label}
          </ButtonLink>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <ButtonLink href={rsvpNav.href} variant="gold" size="md">
            {rsvpNav.label}
          </ButtonLink>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-stone text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden className="flex w-5 flex-col gap-1.5">
              <span
                className={cn(
                  "h-px w-full bg-forest transition-transform",
                  open && "translate-y-[7px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-px w-full bg-forest transition-opacity",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-px w-full bg-forest transition-transform",
                  open && "-translate-y-[7px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Horizontal section chips — always visible on phone/tablet */}
      <nav
        aria-label="Sections"
        className="border-t border-stone/40 lg:hidden"
      >
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 scrollbar-none sm:px-8">
          {mobileQuickNav.map((item) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={activeId === item.id ? "true" : undefined}
              className={cn(
                "shrink-0 whitespace-nowrap px-3 py-2 font-sans text-xs uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                activeId === item.id
                  ? "border-b-2 border-gold text-forest"
                  : "border-b-2 border-transparent text-ink-muted",
              )}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Full mobile drawer with grouped destinations */}
      <div
        id={menuId}
        hidden={!open}
        className={cn(
          "absolute inset-x-0 top-full max-h-[min(80svh,36rem)] overflow-y-auto border-b border-stone/60 bg-ivory shadow-sm lg:hidden",
          open && "block",
        )}
      >
        <nav aria-label="Mobile" className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
          <a
            href="#home"
            className="mb-5 flex min-h-12 items-center font-display text-xl text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            onClick={() => setOpen(false)}
          >
            Home
          </a>

          <div className="space-y-6">
            {mobileNavGroups.map((group) => (
              <div key={group.id}>
                <p className="mb-2 font-sans text-[0.65rem] uppercase tracking-[0.2em] text-gold">
                  {group.label}
                </p>
                <ul className="divide-y divide-stone/50 border-y border-stone/50">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        aria-current={activeId === item.id ? "true" : undefined}
                        className={cn(
                          "flex min-h-12 items-center font-sans text-base text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                          activeId === item.id && "text-gold",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
