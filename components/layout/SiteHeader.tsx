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
import { editorialEase, fadeUpSmallVariants, staggerFastContainerVariants } from "@/lib/motion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
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
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();
  const reduceMotion = useReducedMotion();

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

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500",
        scrolled || open
          ? "border-b border-stone/40 bg-ivory/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:min-h-16 sm:px-8 lg:px-10">
        <a
          href="#home"
          className={cn(
            "font-display text-xl tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose",
            scrolled || open ? "text-forest" : "text-ivory",
          )}
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
                "group relative min-h-11 px-3 py-2 font-display text-sm tracking-[0.04em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose",
                scrolled
                  ? activeId === item.id
                    ? "text-forest"
                    : "text-ink-muted hover:text-forest"
                  : activeId === item.id
                    ? "text-ivory"
                    : "text-ivory/75 hover:text-ivory",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute inset-x-3 bottom-1 h-px origin-left scale-x-0 bg-current transition-transform duration-500 ease-out group-hover:scale-x-100",
                  activeId === item.id && "scale-x-100",
                )}
              />
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
            className={cn(
              "inline-flex min-h-11 min-w-11 items-center justify-center border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose",
              scrolled || open
                ? "border-stone text-forest"
                : "border-ivory/40 text-ivory",
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
          scrolled || open ? "border-stone/40" : "border-ivory/15",
        )}
      >
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 scrollbar-none sm:px-8">
          {mobileQuickNav.map((item) => (
            <a
              key={item.id}
              href={item.href}
              aria-current={activeId === item.id ? "true" : undefined}
              className={cn(
                "shrink-0 whitespace-nowrap px-3 py-2 font-sans text-xs uppercase tracking-[0.14em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose",
                scrolled || open
                  ? activeId === item.id
                    ? "border-b border-rose text-forest"
                    : "border-b border-transparent text-ink-muted"
                  : activeId === item.id
                    ? "border-b border-blush text-ivory"
                    : "border-b border-transparent text-ivory/70",
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
            className="fixed inset-0 z-50 flex flex-col bg-ivory lg:hidden"
            initial={reduceMotion ? false : { opacity: 0, y: "-4%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: "-2%" }}
            transition={{ duration: 0.45, ease: editorialEase }}
          >
            <div className="flex min-h-14 items-center justify-between px-5 sm:min-h-16 sm:px-8">
              <p className="font-display text-xl text-forest">
                {wedding.couple.displayName}
              </p>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center border border-stone text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
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
              className="flex flex-1 flex-col overflow-y-auto px-5 pb-10 pt-4 sm:px-8"
              variants={staggerFastContainerVariants}
              initial={reduceMotion ? "visible" : "hidden"}
              animate="visible"
            >
              <motion.a
                href="#home"
                variants={fadeUpSmallVariants}
                className="mb-8 font-display text-3xl text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
                onClick={() => setOpen(false)}
              >
                Home
              </motion.a>

              {mobileNavGroups.map((group) => (
                <motion.div
                  key={group.id}
                  variants={fadeUpSmallVariants}
                  className="mb-8"
                >
                  <p className="mb-3 font-sans text-[0.65rem] uppercase tracking-[0.24em] text-rose">
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
                            "flex min-h-14 items-center font-display text-2xl text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose",
                            activeId === item.id && "text-rose-deep",
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
