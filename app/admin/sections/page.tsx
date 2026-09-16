import { SectionsAdminPanel } from "@/components/admin/SectionsAdminPanel";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Section controls",
  robots: { index: false, follow: false },
};

export default async function AdminSectionsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <AdminPageShell
      activeNav="sections"
      title="Sections"
      description="Control which blocks appear on the scrolling invite and edit the eyebrow, title, and description guests see. Order below matches the live page."
    >
      <SectionsAdminPanel />
    </AdminPageShell>
  );
}
