import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  adminBodyClass,
  adminCardClass,
  adminEyebrowClass,
  adminTitleClass,
} from "@/components/admin/admin-styles";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-[100svh] max-w-lg flex-col justify-center px-5 py-16">
      <p className={adminEyebrowClass}>Administration</p>
      <h1 className={`mt-3 ${adminTitleClass}`}>Sign in</h1>
      <p className={`mt-4 mb-10 ${adminBodyClass}`}>
        Protected area for the wedding invite. Set{" "}
        <code className="text-[var(--admin-gold-bright,#f5e6a8)]">
          WEDDING_ADMIN_PASSWORD
        </code>{" "}
        in your environment before production use.
      </p>
      <div className={adminCardClass}>
        <AdminLoginForm />
      </div>
    </main>
  );
}
