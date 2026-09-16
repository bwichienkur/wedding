import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { RsvpAdminPanel } from "@/components/admin/RsvpAdminPanel";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import type { Metadata } from "next";
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
    <AdminPageShell
      activeNav="rsvp"
      wide
      title="RSVP"
      description="Guest lookup, responses, and invitation codes."
    >
      <RsvpAdminPanel />
    </AdminPageShell>
  );
}
