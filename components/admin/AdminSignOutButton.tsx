"use client";

import { useRouter } from "next/navigation";

export function AdminSignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="min-h-11 font-sans text-sm uppercase tracking-[0.12em] text-[var(--admin-muted,#9aa8bc)] hover:text-[var(--admin-body,#d4dce8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-gold,#e8c872)]"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
