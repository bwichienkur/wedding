import { isAdminAuthenticated } from "@/lib/auth/admin";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminHomePage() {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="font-sans text-xs uppercase tracking-[0.22em] text-gold">
        Administration
      </p>
      <h1 className="mt-3 font-display text-4xl text-forest">Bright & Lexi</h1>
      <p className="mt-4 max-w-prose text-ink-muted">
        Secure tools for sections, content, media, and RSVP management.
      </p>
      <ul className="mt-10 space-y-4">
        <li>
          <Link
            href="/admin/sections"
            className="inline-flex min-h-12 items-center font-sans text-base text-forest underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Sections — visibility &amp; descriptions
          </Link>
        </li>
        <li>
          <Link
            href="/admin/content"
            className="inline-flex min-h-12 items-center font-sans text-base text-forest underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Section content — FAQ, party, venue, travel
          </Link>
        </li>
        <li>
          <Link
            href="/admin/rsvp"
            className="inline-flex min-h-12 items-center font-sans text-base text-forest underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            RSVP management
          </Link>
        </li>
        <li>
          <Link
            href="/admin/media"
            className="inline-flex min-h-12 items-center font-sans text-base text-forest underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            Media — photos &amp; videos by section
          </Link>
        </li>
        <li>
          <AdminSignOutButton />
        </li>
      </ul>
    </main>
  );
}
