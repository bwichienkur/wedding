import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { RsvpAdminPanel } from "@/components/admin/RsvpAdminPanel";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "RSVP administration",
  robots: { index: false, follow: false },
};

export default async function AdminRsvpPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.22em] text-gold">
            Administration
          </p>
          <h1 className="mt-2 font-display text-4xl text-forest">RSVP</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center font-sans text-sm uppercase tracking-[0.12em] text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Back
          </Link>
          <AdminSignOutButton />
        </div>
      </div>
      <RsvpAdminPanel />
    </main>
  );
}
