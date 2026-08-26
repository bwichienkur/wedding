"use client";

import { ButtonLink } from "@/components/ui/ButtonLink";
import {
  filterNavGroups,
  filterNavItems,
  mobileNavGroups,
  mobileQuickNav,
  primaryNav,
  rsvpNav,
} from "@/data/navigation";
import { wedding } from "@/data/wedding";
import { cn } from "@/lib/cn";
import { editorialEase, fadeUpSmallVariants, staggerFastContainerVariants } from "@/lib/motion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useMemo, useState } from "react";

export function SiteHeader({
  visibleSectionIds,
}: {
  visibleSectionIds?: ReadonlySet<string>;
}) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();
  const reduceMotion = useReducedMotion();

  const visiblePrimaryNav = useMemo(
    () =>
      visibleSectionIds
        ? filterNavItems(primaryNav, visibleSectionIds)
        : primaryNav,
    [visibleSectionIds],
  );
  const visibleQuickNav = useMemo(
    () =>
      visibleSectionIds
        ? filterNavItems(mobileQuickNav, visibleSectionIds)
        : mobileQuickNav,
    [visibleSectionIds],
  );
  const visibleNavGroups = useMemo(
    () =>
      visibleSectionIds
        ? filterNavGroups(mobileNavGroups, visibleSectionIds)
        : mobileNavGroups,
    [visibleSectionIds],
  );
  const showRsvp =
    !visibleSectionIds || visibleSectionIds.has(rsvpNav.id);

  const observedSectionIds = useMemo(
    () =>
      Array.from(
        new Set([
          ...visiblePrimaryNav.map((item) => item.id),
          ...visibleNavGroups.flatMap((group) =>
            group.items.map((item) => item.id),
          ),
          ...(showRsvp ? [rsvpNav.id] : []),
        ]),
      ),
    [showRsvp, visibleNavGroups, visiblePrimaryNav],
  );

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
  }, [observedSectionIds]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const solidChrome = scrolled || open;

  const linkTone = (active: boolean) =>
    solidChrome
      ? active
        ? "text-gold-soft"
        : "text-ivory/75 hover:text-ivory"
      : active
        ? "text-ivory"
        : "text-ivory/75 hover:text-ivory";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500",
        solidChrome
          ? "border-b border-gold/25 bg-forest/94 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto grid min-h-14 max-w-6xl grid-cols-[1fr_auto] items-center gap-3 px-4 sm:min-h-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-4 lg:px-8">
        <a
          href="#home"
          className={cn(
            "justify-self-start font-display text-lg tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:text-xl",
            "text-ivory",
          )}
        >
          {wedding.couple.displayName}
        </a>

        <nav
          aria-label="Primary"
          className="hidden items-center justify-center gap-x-0.5 lg:flex"
        >
          {visiblePrimaryNav.map((item) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={activeId === item.id ? "true" : undefined}
              className={cn(
                "group relative min-h-11 px-2 py-2 text-center font-display text-[0.8rem] tracking-[0.06em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold xl:px-2.5 xl:text-sm",
                linkTone(activeId === item.id),
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute inset-x-2 bottom-1 h-px origin-center scale-x-0 bg-gold transition-transform duration-500 ease-out group-hover:scale-x-100",
                  activeId === item.id && "scale-x-100",
                )}
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          {showRsvp ? (
            <ButtonLink href={rsvpNav.href} variant="gold" size="md">
              {rsvpNav.label}
            </ButtonLink>
          ) : null}
          <button
            type="button"
            className={cn(
              "inline-flex min-h-11 min-w-11 items-center justify-center border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:hidden",
              "border-ivory/35 text-ivory",
            )}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden className="flex w-5 flex-col gap-1.5">
              <span
                className={cn(
                  "h-px w-full bg-current transition-transform",
                  open && "translate-y-[7px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-px w-full bg-current transition-opacity",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-px w-full bg-current transition-transform",
                  open && "-translate-y-[7px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <nav
        aria-label="Sections"
        className={cn(
          "border-t lg:hidden",
          solidChrome ? "border-gold/20" : "border-ivory/15",
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-1 gap-y-0 px-3 py-1.5 sm:px-6">
          {visibleQuickNav.map((item) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={activeId === item.id ? "true" : undefined}
              className={cn(
                "px-2 py-2 text-center font-sans text-[0.65rem] uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                activeId === item.id
                  ? "border-b border-gold text-gold-soft"
                  : "border-b border-transparent text-ivory/70 hover:text-ivory",
              )}
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            className="fixed inset-0 z-50 flex flex-col bg-forest lg:hidden"
            initial={reduceMotion ? false : { opacity: 0, y: "-4%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: "-2%" }}
            transition={{ duration: 0.45, ease: editorialEase }}
          >
            <div className="flex min-h-14 items-center justify-between px-5 sm:min-h-16 sm:px-8">
              <p className="font-display text-xl text-ivory">
                {wedding.couple.displayName}
              </p>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center border border-gold/40 text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                onClick={() => setOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <span aria-hidden className="text-lg leading-none">
                  ×
                </span>
              </button>
            </div>

            <motion.nav
              aria-label="Mobile"
              className="flex flex-1 flex-col overflow-y-auto px-5 pb-10 pt-4 text-center sm:px-8"
              variants={staggerFastContainerVariants}
              initial={reduceMotion ? "visible" : "hidden"}
              animate="visible"
            >
              <motion.a
                href="#home"
                variants={fadeUpSmallVariants}
                className="mb-8 font-display text-3xl text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                onClick={() => setOpen(false)}
              >
                Home
              </motion.a>

              {visibleNavGroups.map((group) => (
                <motion.div
                  key={group.id}
                  variants={fadeUpSmallVariants}
                  className="mb-8"
                >
                  <p className="mb-3 font-sans text-[0.65rem] uppercase tracking-[0.24em] text-gold">
                    {group.label}
                  </p>
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <a
                          href={item.href}
                          aria-current={
                            activeId === item.id ? "true" : undefined
                          }
                          className={cn(
                            "flex min-h-12 items-center justify-center font-display text-2xl text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                            activeId === item.id && "text-gold-soft",
                          )}
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
