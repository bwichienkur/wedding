"use client";

import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminFieldClass, adminLabelClass } from "@/components/admin/admin-styles";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError("Unable to sign in. Check the password and try again.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Unable to sign in right now.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-sm space-y-5">
      <div>
        <label
          htmlFor="admin-password"
          className={adminLabelClass}
        >
          Admin password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={adminFieldClass}
        />
      </div>
      {error ? (
        <p className="text-sm text-[var(--admin-gold-bright,#f5e6a8)]" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="gold" size="lg" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
