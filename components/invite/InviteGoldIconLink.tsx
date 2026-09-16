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
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8.5 4.5h2l1.2 2.8a1 1 0 0 0 .95.65l2.6-.35a1 1 0 0 1 1.15 1.15l-.35 2.6a1 1 0 0 0 .65.95L19 13.5v2a2 2 0 0 1-2 2A14.5 14.5 0 0 1 5 7.5a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}
