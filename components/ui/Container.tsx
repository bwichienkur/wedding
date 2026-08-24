import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

export function Container({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10", className)}
      {...props}
    >
      {children}
    </div>
  );
}
