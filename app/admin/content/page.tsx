import { ContentAdminPanel } from "@/components/admin/ContentAdminPanel";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Section content",
  robots: { index: false, follow: false },
};

export default async function AdminContentPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.22em] text-gold">
            Administration
          </p>
          <h1 className="mt-2 font-display text-4xl text-forest">
            Section content
          </h1>
          <p className="mt-2 max-w-prose text-sm text-ink-muted">
            Edit venue details, travel notes, FAQ questions, and wedding-party
            bios.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="min-h-11 inline-flex items-center font-sans text-sm uppercase tracking-[0.12em] text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Back
          </Link>
          <AdminSignOutButton />
        </div>
      </div>
      <ContentAdminPanel />
    </main>
  );
}
