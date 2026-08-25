"use client";

import { Button } from "@/components/ui/Button";
import type { ResolvedSiteSection } from "@/lib/content/types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function SectionsAdminPanel() {
  const router = useRouter();
  const [sections, setSections] = useState<ResolvedSiteSection[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<
    Record<string, { eyebrow: string; title: string; description: string }>
  >({});

  const applySections = useCallback((next: ResolvedSiteSection[]) => {
    setSections(next);
    setDrafts(
      Object.fromEntries(
        next.map((section) => [
          section.id,
          {
            eyebrow: section.eyebrow,
            title: section.title,
            description: section.description,
          },
        ]),
      ),
    );
  }, []);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/sections");
    if (response.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (!response.ok) {
      setError("Unable to load sections.");
      return;
    }
    const data = (await response.json()) as { sections: ResolvedSiteSection[] };
    applySections(data.sections);
    setLoaded(true);
    setError(null);
  }, [applySections, router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function patchSection(
    id: string,
    body: Record<string, unknown>,
    successMessage: string,
  ) {
    setSavingId(id);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/admin/sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = (await response.json()) as {
        error?: string;
        sections?: ResolvedSiteSection[];
      };
      if (!response.ok) {
        setError(data.error ?? "Unable to save section.");
        return;
      }
      if (data.sections) applySections(data.sections);
      setSuccess(successMessage);
    } catch {
      setError("Unable to save section.");
    } finally {
      setSavingId(null);
    }
  }

  if (!loaded) {
    return <p className="text-sm text-ink-muted">Loading sections…</p>;
  }

  return (
    <div className="space-y-8">
      <p className="max-w-prose text-sm text-ink-muted">
        Hide sections you do not need on the public invitation, and edit the
        short description guests see under each section title. RSVP stays
        visible so guests can always respond.
      </p>

      {error ? (
        <p className="rounded-sm border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-forest">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-sm border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-forest">
          {success}
        </p>
      ) : null}

      <ul className="space-y-6">
        {sections.map((section) => {
          const draft = drafts[section.id] ?? {
            eyebrow: section.eyebrow,
            title: section.title,
            description: section.description,
          };
          const busy = savingId === section.id;

          return (
            <li
              key={section.id}
              className="rounded-sm border border-stone/50 bg-ivory px-5 py-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl text-forest">
                    {section.label}
                  </h2>
                  <p className="mt-1 font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
                    #{section.id}
                  </p>
                </div>
                <label className="inline-flex min-h-11 items-center gap-3 font-sans text-sm text-forest">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--color-forest,#0F1C33)]"
                    checked={section.visible}
                    disabled={section.required || busy}
                    onChange={(event) => {
                      void patchSection(
                        section.id,
                        { visible: event.target.checked },
                        event.target.checked
                          ? `${section.label} is visible.`
                          : `${section.label} is hidden.`,
                      );
                    }}
                  />
                  {section.required ? "Required" : "Show on site"}
                </label>
              </div>

              {section.hasDescription ? (
                <div className="mt-5 grid gap-4">
                  <label className="block">
                    <span className="font-sans text-xs uppercase tracking-[0.16em] text-gold">
                      Eyebrow
                    </span>
                    <input
                      value={draft.eyebrow}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [section.id]: {
                            ...draft,
                            eyebrow: event.target.value,
                          },
                        }))
                      }
                      className="mt-2 w-full rounded-sm border border-stone/60 bg-white px-3 py-2 text-sm text-forest outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    />
                  </label>
                  <label className="block">
                    <span className="font-sans text-xs uppercase tracking-[0.16em] text-gold">
                      Title
                    </span>
                    <input
                      value={draft.title}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [section.id]: {
                            ...draft,
                            title: event.target.value,
                          },
                        }))
                      }
                      className="mt-2 w-full rounded-sm border border-stone/60 bg-white px-3 py-2 text-sm text-forest outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    />
                  </label>
                  <label className="block">
                    <span className="font-sans text-xs uppercase tracking-[0.16em] text-gold">
                      Description
                    </span>
                    <textarea
                      value={draft.description}
                      rows={3}
                      onChange={(event) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [section.id]: {
                            ...draft,
                            description: event.target.value,
                          },
                        }))
                      }
                      className="mt-2 w-full rounded-sm border border-stone/60 bg-white px-3 py-2 text-sm leading-relaxed text-forest outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    />
                  </label>
                  <div>
                    <Button
                      type="button"
                      variant="gold"
                      disabled={busy}
                      onClick={() => {
                        void patchSection(
                          section.id,
                          {
                            eyebrow: draft.eyebrow,
                            title: draft.title,
                            description: draft.description,
                          },
                          `${section.label} copy saved.`,
                        );
                      }}
                    >
                      {busy ? "Saving…" : "Save copy"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-muted">
                  This block has no guest-facing section description to edit.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
