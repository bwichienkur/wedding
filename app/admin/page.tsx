import { adminDashboardGroups } from "@/data/admin-nav";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  adminBodyClass,
  adminCardClass,
  adminMutedClass,
} from "@/components/admin/admin-styles";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cn } from "@/lib/cn";

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
    <AdminPageShell
      activeNav="home"
      title="Overview"
      description="Manage the scrolling wedding invite — section headings, guest content, media, and RSVPs — in one place."
    >
      <div className="space-y-10">
        {adminDashboardGroups.map((group) => (
          <section key={group.title}>
            <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-[var(--admin-gold,#e8c872)]">
              {group.title}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      adminCardClass,
                      "block transition hover:border-[rgb(212_175_55/0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-gold,#e8c872)]",
                    )}
                  >
                    <p className="font-display text-xl text-[var(--admin-gold-bright,#f5e6a8)]">
                      {item.title}
                    </p>
                    <p className={cn("mt-2", adminBodyClass)}>{item.body}</p>
                    <p className={cn("mt-4 text-xs uppercase tracking-[0.14em]", adminMutedClass)}>
                      Open →
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </AdminPageShell>
  );
}
