"use client";

import { AmbientBackground } from "@/components/ambient/AmbientBackground";
import type { ReactNode } from "react";
import { useEffect } from "react";

/** Full-page RSVP with the same animated scroll background as the invitation. */
export function RsvpPageShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.body.classList.add("invite-revealed");
    return () => {
      document.body.classList.remove("invite-revealed");
    };
  }, []);

  return (
    <>
      <AmbientBackground active />
      <div className="relative z-[1]">{children}</div>
    </>
  );
}
