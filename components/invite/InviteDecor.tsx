import { cn } from "@/lib/cn";

/** Gold corner flourish — wooowinvites-style frame accent */
export function InviteCorner({
  className,
  position,
}: {
  className?: string;
  position: "tl" | "tr" | "bl" | "br";
}) {
  return (
    <span
      className={cn("invite-corner pointer-events-none absolute h-10 w-10", className)}
      data-corner={position}
      aria-hidden
    />
  );
}

export function InviteCornerFrame({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-3 sm:inset-4", className)} aria-hidden>
      <InviteCorner position="tl" />
      <InviteCorner position="tr" />
      <InviteCorner position="bl" />
      <InviteCorner position="br" />
    </div>
  );
}

/** Ornamental divider with center diamond */
export function InviteDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("invite-divider mx-auto my-5 w-32", className)}
      aria-hidden
    />
  );
}
