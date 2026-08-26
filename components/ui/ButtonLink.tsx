import { cn } from "@/lib/cn";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold";
type Size = "md" | "lg";

export interface ButtonLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gold text-forest shadow-[0_8px_24px_-12px_rgba(212,175,55,0.55)] hover:bg-gold-soft focus-visible:outline-gold",
  secondary:
    "bg-transparent text-ivory border border-gold/45 hover:border-gold hover:text-gold-soft focus-visible:outline-gold",
  ghost:
    "bg-transparent text-ivory/85 hover:text-gold focus-visible:outline-gold",
  gold:
    "bg-gold text-forest shadow-[0_8px_24px_-12px_rgba(212,175,55,0.65)] hover:bg-gold-soft hover:shadow-[0_10px_28px_-12px_rgba(212,175,55,0.75)] focus-visible:outline-ivory",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-sm tracking-[0.12em] uppercase",
  lg: "min-h-12 px-7 text-sm tracking-[0.14em] uppercase",
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      className={cn(
        "inline-flex items-center justify-center rounded-sm font-sans font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-out hover:scale-[1.01] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transform-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
