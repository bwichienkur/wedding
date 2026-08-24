import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { isAdminAuthenticated } from "@/lib/auth/admin";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

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
      <p className="font-sans text-xs uppercase tracking-[0.22em] text-gold">
        Administration
      </p>
      <h1 className="mt-3 font-display text-4xl text-forest">Sign in</h1>
      <p className="mt-4 mb-10 text-sm text-ink-muted">
        Protected area for media and RSVP management. Set{" "}
        <code className="text-forest">WEDDING_ADMIN_PASSWORD</code> in your
        environment (Vercel → Settings → Environment Variables) before production
        use, then sign in at <code className="text-forest">/admin/login</code>.
      </p>
      <AdminLoginForm />
    </main>
  );
}
