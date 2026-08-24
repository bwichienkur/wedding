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
    "bg-forest text-ivory hover:bg-charcoal focus-visible:outline-rose",
  secondary:
    "bg-transparent text-forest border border-stone hover:border-rose focus-visible:outline-rose",
  ghost:
    "bg-transparent text-forest hover:text-rose-deep focus-visible:outline-rose",
  gold:
    "bg-rose text-ivory shadow-sm hover:bg-rose-deep hover:shadow-md focus-visible:outline-forest",
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
