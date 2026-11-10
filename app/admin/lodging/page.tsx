import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { LodgingAssignmentsPanel } from "@/components/admin/LodgingAssignmentsPanel";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Lodging assignments",
  robots: { index: false, follow: false },
};

export default async function AdminLodgingPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <AdminPageShell
      activeNav="lodging"
      wide
      title="Lodging"
      description="Assign accepted guests to Bella Cosa rooms (capacities from the venue guide)."
    >
      <LodgingAssignmentsPanel />
    </AdminPageShell>
  );
}
