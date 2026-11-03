"use client";

import { buildInviteSectionNavItems } from "@/components/invite/build-invite-section-nav";
import type { ResolvedSiteSections } from "@/lib/content/types";
import { cn } from "@/lib/cn";
import { editorialEase } from "@/lib/motion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useMemo, useState } from "react";

/** Top-right menu — opens a right-side panel of in-page section links. */
export function InviteSectionMenu({
  sections,
}: {
  sections: ResolvedSiteSections;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const reduceMotion = useReducedMotion();
  const items = useMemo(
    () => buildInviteSectionNavItems(sections),
    [sections],
  );

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
    <>
      <button
        type="button"
        className="invite-chrome-fab invite-chrome-fab--menu"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="sr-only">{open ? "Close menu" : "Open page menu"}</span>
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

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              className="invite-section-drawer-scrim"
              aria-label="Close menu"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Page sections"
              className="invite-section-drawer"
              initial={reduceMotion ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: "100%" }}
              transition={{ duration: 0.38, ease: editorialEase }}
            >
              <div className="invite-section-drawer-header">
                <p className="font-sans text-[0.58rem] uppercase tracking-[0.28em] text-invite-gold">
                  On this page
                </p>
                <button
                  type="button"
                  className="invite-chrome-fab invite-chrome-fab--compact"
                  onClick={() => setOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <span aria-hidden className="text-lg leading-none">
                    ×
                  </span>
                </button>
              </div>
              <nav aria-label="Page sections" className="invite-section-drawer-nav">
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        className="invite-section-drawer-link"
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
