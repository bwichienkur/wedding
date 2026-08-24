import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-forest text-ivory hover:bg-charcoal focus-visible:outline-gold",
  secondary:
    "bg-transparent text-forest border border-stone hover:border-forest focus-visible:outline-gold",
  ghost:
    "bg-transparent text-forest hover:text-sage-deep focus-visible:outline-gold",
  gold: "bg-gold text-ivory hover:bg-gold-soft focus-visible:outline-forest",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-sm tracking-[0.08em] uppercase",
  lg: "min-h-12 px-6 text-sm tracking-[0.1em] uppercase",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-sm font-sans font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
