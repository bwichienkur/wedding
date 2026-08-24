"use client";

export function AdminSignOutButton() {
  return (
    <button
      type="button"
      className="min-h-11 font-sans text-sm uppercase tracking-[0.12em] text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      Sign out
    </button>
  );
}
