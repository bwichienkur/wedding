"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/**
 * Centered invitation scroll column — wooowinvites-style continuous card
 * on top of the ambient video background.
 */
export function InviteCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("invite-canvas-outer", className)}>
      <div className="invite-canvas-column">{children}</div>
    </div>
  );
}
