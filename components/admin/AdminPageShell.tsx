import { adminNavItems, type AdminNavId } from "@/data/admin-nav";
import { AdminSignOutButton } from "@/components/admin/AdminSignOutButton";
import {
  adminBodyClass,
  adminEyebrowClass,
  adminTitleClass,
} from "@/components/admin/admin-styles";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function AdminPageShell({
  activeNav,
  title,
  description,
  wide,
  children,
}: {
  activeNav: AdminNavId;
  title: string;
  description?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100svh]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:flex-row sm:gap-10 sm:px-6 sm:py-10">
        <aside className="sm:w-52 sm:shrink-0">
          <Link href="/admin" className="block">
            <p className={adminEyebrowClass}>Administration</p>
            <p className="mt-1 font-display text-xl text-[var(--admin-gold-bright,#f5e6a8)]">
              Lexi &amp; Bright
            </p>
          </Link>
          <nav
            className="mt-8 flex flex-row flex-wrap gap-2 sm:flex-col sm:gap-1"
            aria-label="Admin"
          >
            {adminNavItems.map((item) => {
              const active = item.id === activeNav;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "min-h-11 rounded-sm px-3 py-2 font-sans text-sm uppercase tracking-[0.1em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-gold,#e8c872)]",
                    active
                      ? "bg-[rgb(212_175_55/0.14)] text-[var(--admin-gold-bright,#f5e6a8)]"
                      : "text-[var(--admin-muted,#9aa8bc)] hover:bg-[rgb(7_14_26/0.5)] hover:text-[var(--admin-body,#d4dce8)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 hidden sm:block">
            <AdminSignOutButton />
          </div>
        </aside>

        <div className={cn("min-w-0 flex-1", wide ? "max-w-4xl" : "max-w-3xl")}>
          <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-[rgb(212_175_55/0.2)] pb-6">
            <div>
              <h1 className={adminTitleClass}>{title}</h1>
              {description ? (
                <p className={cn("mt-3 max-w-prose", adminBodyClass)}>
                  {description}
                </p>
              ) : null}
            </div>
            <div className="sm:hidden">
              <AdminSignOutButton />
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
