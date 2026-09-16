"use client";

import { Button } from "@/components/ui/Button";
import {
  adminAlertErrorClass,
  adminAlertSuccessClass,
  adminBodyClass,
  adminCardClass,
  adminFieldClass,
  adminLabelClass,
  adminMutedClass,
} from "@/components/admin/admin-styles";
import type { AdminSectionRow } from "@/lib/content/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export function SectionsAdminPanel() {
  const router = useRouter();
  const [sections, setSections] = useState<AdminSectionRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<
    Record<string, { eyebrow: string; title: string; description: string }>
  >({});

  const applySections = useCallback((next: AdminSectionRow[]) => {
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

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/admin/sections");
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) {
        if (!cancelled) setError("Unable to load sections.");
        return;
      }
      const data = (await response.json()) as {
        sections: AdminSectionRow[];
      };
      if (cancelled) return;
      applySections(data.sections);
      setLoaded(true);
      setError(null);
    })();
    return () => {
      cancelled = true;
    };
  }, [applySections, router]);

  const liveSections = useMemo(
    () => sections.filter((section) => section.mountedOnInvite),
    [sections],
  );
  const archivedSections = useMemo(
    () => sections.filter((section) => !section.mountedOnInvite),
    [sections],
  );

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
        sections?: AdminSectionRow[];
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
    return <p className={adminMutedClass}>Loading sections…</p>;
  }

  return (
    <div className="space-y-10">
      <p className={`max-w-prose ${adminBodyClass}`}>
        RSVP always stays visible. For bios, FAQ, venue details, and portraits,
        use{" "}
        <Link
          href="/admin/content"
          className="text-[var(--admin-gold-bright,#f5e6a8)] underline-offset-4 hover:underline"
        >
          Content
        </Link>{" "}
        and{" "}
        <Link
          href="/admin/media"
          className="text-[var(--admin-gold-bright,#f5e6a8)] underline-offset-4 hover:underline"
        >
          Media
        </Link>
        .
      </p>

      {error ? <p className={adminAlertErrorClass}>{error}</p> : null}
      {success ? <p className={adminAlertSuccessClass}>{success}</p> : null}

      <SectionGroup
        title="On the invite scroll"
        sections={liveSections}
        drafts={drafts}
        savingId={savingId}
        setDrafts={setDrafts}
        patchSection={patchSection}
      />

      {archivedSections.length > 0 ? (
        <SectionGroup
          title="Not on the current invite"
          subtitle="These settings are kept for future layouts or navigation only."
          sections={archivedSections}
          drafts={drafts}
          savingId={savingId}
          setDrafts={setDrafts}
          patchSection={patchSection}
          muted
        />
      ) : null}
    </div>
  );
}

function SectionGroup({
  title,
  subtitle,
  sections,
  drafts,
  savingId,
  setDrafts,
  patchSection,
  muted,
}: {
  title: string;
  subtitle?: string;
  sections: AdminSectionRow[];
  drafts: Record<
    string,
    { eyebrow: string; title: string; description: string }
  >;
  savingId: string | null;
  setDrafts: React.Dispatch<
    React.SetStateAction<
      Record<string, { eyebrow: string; title: string; description: string }>
    >
  >;
  patchSection: (
    id: string,
    body: Record<string, unknown>,
    successMessage: string,
  ) => Promise<void>;
  muted?: boolean;
}) {
  return (
    <section>
      <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-[var(--admin-gold,#e8c872)]">
        {title}
      </h2>
      {subtitle ? (
        <p className={`mt-2 max-w-prose ${adminMutedClass}`}>{subtitle}</p>
      ) : null}
      <ul className="mt-5 space-y-5">
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
              className={adminCardClass}
              style={muted ? { opacity: 0.88 } : undefined}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="font-display text-2xl text-[var(--admin-gold-bright,#f5e6a8)]">
                      {section.label}
                    </h3>
                    {section.inviteOrder != null ? (
                      <span className="font-sans text-xs uppercase tracking-[0.14em] text-[var(--admin-muted,#9aa8bc)]">
                        #{section.inviteOrder} on scroll
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 font-sans text-xs uppercase tracking-[0.14em] text-[var(--admin-muted,#9aa8bc)]">
                    id: {section.id}
                  </p>
                  <p className={`mt-3 max-w-prose text-sm ${adminMutedClass}`}>
                    {section.adminHint}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.12em]">
                    {section.contentTab ? (
                      <Link
                        href={`/admin/content?tab=${section.contentTab}`}
                        className="text-[var(--admin-gold,#e8c872)] underline-offset-4 hover:underline"
                      >
                        Edit in Content →
                      </Link>
                    ) : null}
                    {section.id === "party" ||
                    section.id === "story" ||
                    section.id === "gallery" ||
                    section.id === "venue" ? (
                      <Link
                        href={`/admin/media?placement=${section.id === "venue" ? "venue.architecture" : section.id === "story" ? "story.how-we-met" : section.id === "gallery" ? "gallery" : "party"}`}
                        className="text-[var(--admin-gold,#e8c872)] underline-offset-4 hover:underline"
                      >
                        Manage media →
                      </Link>
                    ) : null}
                    {section.id === "rsvp" ? (
                      <Link
                        href="/admin/rsvp"
                        className="text-[var(--admin-gold,#e8c872)] underline-offset-4 hover:underline"
                      >
                        RSVP admin →
                      </Link>
                    ) : null}
                  </div>
                </div>
                <label className="inline-flex min-h-11 items-center gap-3 font-sans text-sm text-[var(--admin-body,#d4dce8)]">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--admin-gold,#e8c872)]"
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
                    <span className={adminLabelClass}>Eyebrow</span>
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
                      className={adminFieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className={adminLabelClass}>Title</span>
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
                      className={adminFieldClass}
                    />
                  </label>
                  <label className="block">
                    <span className={adminLabelClass}>Description</span>
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
                      className={adminFieldClass}
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
                <p className={`mt-4 ${adminMutedClass}`}>
                  No guest-facing description for this block.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
