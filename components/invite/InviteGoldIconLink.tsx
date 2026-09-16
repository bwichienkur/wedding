import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/** Round gold-bordered icon control (directions, phone, map). */
export function InviteGoldIconLink({
  href,
  ariaLabel,
  children,
  className,
  target,
  rel,
}: {
  href: string;
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target={target}
      rel={rel}
      className={cn("invite-gold-icon-link", className)}
    >
      {children}
    </a>
  );
}

export function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M20.01 15.38c-1.23 0-2.43-.2-3.57-.57a1 1 0 0 0-.98.24l-1.85 1.85a15.64 15.64 0 0 1-6.17-6.17l1.85-1.85a1 1 0 0 0 .24-.98 10.87 10.87 0 0 1-.57-3.57 1 1 0 0 0-.99-.85H4.19A1.19 1.19 0 0 0 3 4.18c0 9.07 7.35 16.42 16.42 16.42.65 0 1.18-.53 1.19-1.18v-3.65a1 1 0 0 0-.85-.99z" />
    </svg>
  );
}
