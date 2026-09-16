import { ContentAdminPanel } from "@/components/admin/ContentAdminPanel";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { adminMutedClass } from "@/components/admin/admin-styles";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Section content",
  robots: { index: false, follow: false },
};

export default async function AdminContentPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <AdminPageShell
      activeNav="content"
      title="Content"
      description="Structured details inside each invite section — not the section headings (those live under Sections)."
    >
      <Suspense fallback={<p className={adminMutedClass}>Loading…</p>}>
        <ContentAdminPanel />
      </Suspense>
    </AdminPageShell>
  );
}
