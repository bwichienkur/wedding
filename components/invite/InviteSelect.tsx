import { cn } from "@/lib/cn";
import type { SelectHTMLAttributes } from "react";

export function InviteSelect({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn("invite-faq-input invite-select", className)}
    />
  );
}
