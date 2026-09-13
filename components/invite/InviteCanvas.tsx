"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/** Single centered invitation card — wooowinvites continuous scroll */
export function InviteCanvas({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("invite-page", className)}>
      <div className="invite-card">{children}</div>
    </div>
  );
}
