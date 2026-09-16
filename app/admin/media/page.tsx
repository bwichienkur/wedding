import { MediaAdminPanel } from "@/components/admin/MediaAdminPanel";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { adminMutedClass } from "@/components/admin/admin-styles";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Media management",
  robots: { index: false, follow: false },
};

export default async function AdminMediaPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <AdminPageShell
      activeNav="media"
      wide
      title="Media"
      description="Assign uploads to invite sections. Bundled repo photos (for example party portraits checked into public/) appear alongside your library until replaced by an upload."
    >
      <Suspense fallback={<p className={adminMutedClass}>Loading…</p>}>
        <MediaAdminPanel />
      </Suspense>
    </AdminPageShell>
  );
}
