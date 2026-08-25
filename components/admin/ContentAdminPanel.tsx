"use client";

import { Button } from "@/components/ui/Button";
import type {
  FaqItem,
  TravelAirport,
  TravelInfo,
  VenueInfo,
  WeddingPartyMember,
} from "@/data/logistics-types";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Tab = "venue" | "travel" | "faq" | "party";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "venue", label: "Venue" },
  { id: "travel", label: "Travel" },
  { id: "faq", label: "FAQ" },
  { id: "party", label: "Wedding party" },
];

const fieldClass =
  "mt-2 w-full rounded-sm border border-stone/60 bg-white px-3 py-2 text-sm text-forest outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

const labelClass =
  "font-sans text-xs uppercase tracking-[0.16em] text-gold";

export function ContentAdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("faq");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [venue, setVenue] = useState<VenueInfo | null>(null);
  const [travel, setTravel] = useState<TravelInfo | null>(null);
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [party, setParty] = useState<WeddingPartyMember[]>([]);

  const apply = useCallback(
    (data: {
      venue: VenueInfo;
      travel: TravelInfo;
      faq: FaqItem[];
      party: WeddingPartyMember[];
    }) => {
      setVenue(data.venue);
      setTravel(data.travel);
      setFaq(data.faq);
      setParty(data.party);
      setLoaded(true);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const response = await fetch("/api/admin/logistics");
      if (response.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!response.ok) {
        if (!cancelled) setError("Unable to load section content.");
        return;
      }
      const data = (await response.json()) as {
        venue: VenueInfo;
        travel: TravelInfo;
        faq: FaqItem[];
        party: WeddingPartyMember[];
      };
      if (!cancelled) {
        apply(data);
        setError(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apply, router]);

  async function patch(body: Record<string, unknown>, successMessage: string) {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/admin/logistics", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.status === 401) {
        router.replace("/admin/login");
        return false;
      }
      const data = (await response.json()) as {
        error?: string;
        venue?: VenueInfo;
        travel?: TravelInfo;
        faq?: FaqItem[];
        party?: WeddingPartyMember[];
      };
      if (!response.ok || !data.venue || !data.travel || !data.faq || !data.party) {
        setError(data.error ?? "Unable to save.");
        return false;
      }
      apply({
        venue: data.venue,
        travel: data.travel,
        faq: data.faq,
        party: data.party,
      });
      setSuccess(successMessage);
      return true;
    } catch {
      setError("Unable to save.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (!loaded || !venue || !travel) {
    return <p className="text-sm text-ink-muted">Loading section content…</p>;
  }

  return (
    <div className="space-y-8">
      <p className="max-w-prose text-sm text-ink-muted">
        Add, edit, or remove the pieces guests see inside each section — FAQ
        answers, wedding-party bios, venue details, and travel notes.
      </p>

      <div className="flex flex-wrap gap-2 border-b border-stone/40 pb-3">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-11 px-3 font-sans text-sm uppercase tracking-[0.12em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
              tab === item.id
                ? "text-forest underline decoration-gold decoration-2 underline-offset-8"
                : "text-ink-muted"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

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

      {tab === "venue" ? (
        <VenueEditor
          venue={venue}
          busy={busy}
          onChange={setVenue}
          onSave={() =>
            void patch(
              {
                kind: "venue",
                name: venue.name,
                city: venue.city,
                region: venue.region,
                addressLine1: venue.addressLine1,
                addressIsPlaceholder: venue.addressIsPlaceholder,
              },
              "Venue details saved.",
            )
          }
        />
      ) : null}

      {tab === "travel" ? (
        <TravelEditor
          travel={travel}
          busy={busy}
          onChange={setTravel}
          onSave={() =>
            void patch(
              {
                kind: "travel",
                intro: travel.intro,
                airports: travel.airports,
                hotels: travel.hotels,
                transportation: travel.transportation,
                transportationIsPlaceholder: travel.transportationIsPlaceholder,
                recommendations: travel.recommendations,
                emergencyContact: travel.emergencyContact,
                emergencyIsPlaceholder: travel.emergencyIsPlaceholder,
              },
              "Travel details saved.",
            )
          }
        />
      ) : null}

      {tab === "faq" ? (
        <FaqEditor
          items={faq}
          busy={busy}
          onUpsert={async (item) => {
            const ok = await patch(
              {
                kind: "faq",
                action: "upsert",
                ...(item.id.trim() ? { id: item.id.trim() } : {}),
                category: item.category,
                question: item.question,
                answer: item.answer,
                answerIsPlaceholder: item.answerIsPlaceholder,
              },
              item.id.trim() ? "FAQ updated." : "FAQ added.",
            );
            return ok;
          }}
          onDelete={async (id) => {
            await patch(
              { kind: "faq", action: "delete", id },
              "FAQ removed.",
            );
          }}
        />
      ) : null}

      {tab === "party" ? (
        <PartyEditor
          members={party}
          busy={busy}
          onUpsert={async (member) => {
            const ok = await patch(
              {
                kind: "party",
                action: "upsert",
                ...(member.id.trim() ? { id: member.id.trim() } : {}),
                name: member.name,
                role: member.role,
                side: member.side,
                relationship: member.relationship,
                relationshipIsPlaceholder: member.relationshipIsPlaceholder,
                description: member.description,
                descriptionIsPlaceholder: member.descriptionIsPlaceholder,
                ...(member.funFact?.trim()
                  ? { funFact: member.funFact.trim() }
                  : {}),
                funFactIsPlaceholder: member.funFactIsPlaceholder,
                ...(member.sharedMemory?.trim()
                  ? { sharedMemory: member.sharedMemory.trim() }
                  : {}),
                ...(member.photoSrc?.trim()
                  ? { photoSrc: member.photoSrc.trim() }
                  : {}),
                ...(member.photoAlt?.trim()
                  ? { photoAlt: member.photoAlt.trim() }
                  : {}),
              },
              member.id.trim() ? "Person updated." : "Person added.",
            );
            return ok;
          }}
          onDelete={async (id) => {
            await patch(
              { kind: "party", action: "delete", id },
              "Person removed.",
            );
          }}
        />
      ) : null}
    </div>
  );
}

function VenueEditor({
  venue,
  busy,
  onChange,
  onSave,
}: {
  venue: VenueInfo;
  busy: boolean;
  onChange: (next: VenueInfo) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4 rounded-sm border border-stone/50 bg-ivory px-5 py-5">
      {(
        [
          ["name", "Venue name"],
          ["city", "City"],
          ["region", "Region"],
          ["addressLine1", "Address"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block">
          <span className={labelClass}>{label}</span>
          <input
            className={fieldClass}
            value={venue[key]}
            onChange={(event) =>
              onChange({ ...venue, [key]: event.target.value })
            }
          />
        </label>
      ))}
      <Button type="button" variant="gold" disabled={busy} onClick={onSave}>
        {busy ? "Saving…" : "Save venue"}
      </Button>
    </div>
  );
}

function TravelEditor({
  travel,
  busy,
  onChange,
  onSave,
}: {
  travel: TravelInfo;
  busy: boolean;
  onChange: (next: TravelInfo) => void;
  onSave: () => void;
}) {
  function updateAirport(index: number, patch: Partial<TravelAirport>) {
    onChange({
      ...travel,
      airports: travel.airports.map((airport, i) =>
        i === index ? { ...airport, ...patch } : airport,
      ),
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-sm border border-stone/50 bg-ivory px-5 py-5">
        <label className="block">
          <span className={labelClass}>Intro</span>
          <textarea
            rows={2}
            className={fieldClass}
            value={travel.intro}
            onChange={(event) =>
              onChange({ ...travel, intro: event.target.value })
            }
          />
        </label>
        <label className="block">
          <span className={labelClass}>Transportation</span>
          <textarea
            rows={3}
            className={fieldClass}
            value={travel.transportation}
            onChange={(event) =>
              onChange({ ...travel, transportation: event.target.value })
            }
          />
        </label>
        <label className="block">
          <span className={labelClass}>Day-of contact</span>
          <input
            className={fieldClass}
            value={travel.emergencyContact}
            onChange={(event) =>
              onChange({ ...travel, emergencyContact: event.target.value })
            }
          />
        </label>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-forest">Airports</h2>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() =>
              onChange({
                ...travel,
                airports: [
                  ...travel.airports,
                  {
                    id: `airport-${Date.now()}`,
                    name: "New airport",
                    code: "TBD",
                    driveTimeLabel: "",
                    driveTimeIsPlaceholder: true,
                    notes: "",
                    notesIsPlaceholder: true,
                  },
                ],
              })
            }
          >
            Add airport
          </Button>
        </div>
        {travel.airports.map((airport, index) => (
          <div
            key={airport.id}
            className="space-y-3 rounded-sm border border-stone/50 bg-ivory px-5 py-5"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Name</span>
                <input
                  className={fieldClass}
                  value={airport.name}
                  onChange={(event) =>
                    updateAirport(index, { name: event.target.value })
                  }
                />
              </label>
              <label className="block">
                <span className={labelClass}>Code</span>
                <input
                  className={fieldClass}
                  value={airport.code}
                  onChange={(event) =>
                    updateAirport(index, { code: event.target.value })
                  }
                />
              </label>
            </div>
            <label className="block">
              <span className={labelClass}>Drive time</span>
              <input
                className={fieldClass}
                value={airport.driveTimeLabel}
                onChange={(event) =>
                  updateAirport(index, {
                    driveTimeLabel: event.target.value,
                    driveTimeIsPlaceholder: false,
                  })
                }
              />
            </label>
            <label className="block">
              <span className={labelClass}>Notes</span>
              <textarea
                rows={2}
                className={fieldClass}
                value={airport.notes}
                onChange={(event) =>
                  updateAirport(index, {
                    notes: event.target.value,
                    notesIsPlaceholder: false,
                  })
                }
              />
            </label>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() =>
                onChange({
                  ...travel,
                  airports: travel.airports.filter((_, i) => i !== index),
                })
              }
            >
              Remove airport
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-forest">
            Local recommendations
          </h2>
          <Button
            type="button"
            variant="secondary"
            disabled={busy}
            onClick={() =>
              onChange({
                ...travel,
                recommendations: [
                  ...travel.recommendations,
                  {
                    id: `rec-${Date.now()}`,
                    category: "activity",
                    name: "New recommendation",
                    description: "",
                    isPlaceholder: false,
                  },
                ],
              })
            }
          >
            Add recommendation
          </Button>
        </div>
        {travel.recommendations.map((item, index) => (
          <div
            key={item.id}
            className="space-y-3 rounded-sm border border-stone/50 bg-ivory px-5 py-5"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className={labelClass}>Name</span>
                <input
                  className={fieldClass}
                  value={item.name}
                  onChange={(event) =>
                    onChange({
                      ...travel,
                      recommendations: travel.recommendations.map((rec, i) =>
                        i === index
                          ? { ...rec, name: event.target.value, isPlaceholder: false }
                          : rec,
                      ),
                    })
                  }
                />
              </label>
              <label className="block">
                <span className={labelClass}>Category</span>
                <select
                  className={fieldClass}
                  value={item.category}
                  onChange={(event) =>
                    onChange({
                      ...travel,
                      recommendations: travel.recommendations.map((rec, i) =>
                        i === index
                          ? {
                              ...rec,
                              category: event.target.value as
                                | "restaurant"
                                | "activity"
                                | "other",
                            }
                          : rec,
                      ),
                    })
                  }
                >
                  <option value="activity">activity</option>
                  <option value="restaurant">restaurant</option>
                  <option value="other">other</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className={labelClass}>Description</span>
              <textarea
                rows={2}
                className={fieldClass}
                value={item.description}
                onChange={(event) =>
                  onChange({
                    ...travel,
                    recommendations: travel.recommendations.map((rec, i) =>
                      i === index
                        ? {
                            ...rec,
                            description: event.target.value,
                            isPlaceholder: false,
                          }
                        : rec,
                    ),
                  })
                }
              />
            </label>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() =>
                onChange({
                  ...travel,
                  recommendations: travel.recommendations.filter(
                    (_, i) => i !== index,
                  ),
                })
              }
            >
              Remove recommendation
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="gold" disabled={busy} onClick={onSave}>
        {busy ? "Saving…" : "Save travel"}
      </Button>
    </div>
  );
}

function FaqEditor({
  items,
  busy,
  onUpsert,
  onDelete,
}: {
  items: FaqItem[];
  busy: boolean;
  onUpsert: (item: FaqItem) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [drafts, setDrafts] = useState<Record<string, FaqItem>>({});
  const [creating, setCreating] = useState<FaqItem>({
    id: "",
    category: "General",
    question: "",
    answer: "",
    answerIsPlaceholder: false,
  });

  function draftFor(item: FaqItem) {
    return drafts[item.id] ?? item;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-sm border border-dashed border-gold/50 bg-ivory px-5 py-5">
        <h2 className="font-display text-2xl text-forest">Add FAQ</h2>
        <label className="block">
          <span className={labelClass}>Category</span>
          <input
            className={fieldClass}
            value={creating.category}
            onChange={(event) =>
              setCreating((prev) => ({ ...prev, category: event.target.value }))
            }
          />
        </label>
        <label className="block">
          <span className={labelClass}>Question</span>
          <input
            className={fieldClass}
            value={creating.question}
            onChange={(event) =>
              setCreating((prev) => ({ ...prev, question: event.target.value }))
            }
          />
        </label>
        <label className="block">
          <span className={labelClass}>Answer</span>
          <textarea
            rows={3}
            className={fieldClass}
            value={creating.answer}
            onChange={(event) =>
              setCreating((prev) => ({ ...prev, answer: event.target.value }))
            }
          />
        </label>
        <Button
          type="button"
          variant="gold"
          disabled={busy || !creating.question.trim()}
          onClick={() => {
            void (async () => {
              const payload = {
                ...creating,
                id: "",
                answerIsPlaceholder: !creating.answer.trim(),
              };
              const ok = await onUpsert(payload);
              if (ok) {
                setCreating({
                  id: "",
                  category: "General",
                  question: "",
                  answer: "",
                  answerIsPlaceholder: false,
                });
              }
            })();
          }}
        >
          Add question
        </Button>
      </div>

      <ul className="space-y-4">
        {items.map((item) => {
          const draft = draftFor(item);
          return (
            <li
              key={item.id}
              className="space-y-3 rounded-sm border border-stone/50 bg-ivory px-5 py-5"
            >
              <label className="block">
                <span className={labelClass}>Category</span>
                <input
                  className={fieldClass}
                  value={draft.category}
                  onChange={(event) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [item.id]: { ...draft, category: event.target.value },
                    }))
                  }
                />
              </label>
              <label className="block">
                <span className={labelClass}>Question</span>
                <input
                  className={fieldClass}
                  value={draft.question}
                  onChange={(event) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [item.id]: { ...draft, question: event.target.value },
                    }))
                  }
                />
              </label>
              <label className="block">
                <span className={labelClass}>Answer</span>
                <textarea
                  rows={3}
                  className={fieldClass}
                  value={draft.answer}
                  onChange={(event) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [item.id]: {
                        ...draft,
                        answer: event.target.value,
                        answerIsPlaceholder: false,
                      },
                    }))
                  }
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="gold"
                  disabled={busy}
                  onClick={() => {
                    void (async () => {
                      const ok = await onUpsert(draft);
                      if (ok) {
                        setDrafts((prev) => {
                          const next = { ...prev };
                          delete next[item.id];
                          return next;
                        });
                      }
                    })();
                  }}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    void onDelete(item.id);
                  }}
                >
                  Remove
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PartyEditor({
  members,
  busy,
  onUpsert,
  onDelete,
}: {
  members: WeddingPartyMember[];
  busy: boolean;
  onUpsert: (member: WeddingPartyMember) => Promise<boolean>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [drafts, setDrafts] = useState<Record<string, WeddingPartyMember>>({});
  const [creating, setCreating] = useState<WeddingPartyMember>({
    id: "",
    name: "",
    role: "Bridesmaid",
    side: "lexi",
    relationship: "",
    description: "",
    relationshipIsPlaceholder: false,
    descriptionIsPlaceholder: false,
  });

  function draftFor(member: WeddingPartyMember) {
    return drafts[member.id] ?? member;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-muted">
        {members.length} people currently listed. Add, edit, or remove anyone —
        including the ceremony pianist under Shared.
      </p>

      <div className="space-y-3 rounded-sm border border-dashed border-gold/50 bg-ivory px-5 py-5">
        <h2 className="font-display text-2xl text-forest">Add person</h2>
        <PartyFields
          member={creating}
          onChange={setCreating}
        />
        <Button
          type="button"
          variant="gold"
          disabled={busy || !creating.name.trim()}
          onClick={() => {
            void (async () => {
              const ok = await onUpsert({ ...creating, id: "" });
              if (ok) {
                setCreating({
                  id: "",
                  name: "",
                  role: "Bridesmaid",
                  side: "lexi",
                  relationship: "",
                  description: "",
                  relationshipIsPlaceholder: false,
                  descriptionIsPlaceholder: false,
                });
              }
            })();
          }}
        >
          Add person
        </Button>
      </div>

      <ul className="space-y-4">
        {members.map((member) => {
          const draft = draftFor(member);
          return (
            <li
              key={member.id}
              className="space-y-3 rounded-sm border border-stone/50 bg-ivory px-5 py-5"
            >
              <PartyFields
                member={draft}
                onChange={(next) =>
                  setDrafts((prev) => ({ ...prev, [member.id]: next }))
                }
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="gold"
                  disabled={busy}
                  onClick={() => {
                    void (async () => {
                      const ok = await onUpsert(draft);
                      if (ok) {
                        setDrafts((prev) => {
                          const next = { ...prev };
                          delete next[member.id];
                          return next;
                        });
                      }
                    })();
                  }}
                >
                  Save
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    void onDelete(member.id);
                  }}
                >
                  Remove
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PartyFields({
  member,
  onChange,
}: {
  member: WeddingPartyMember;
  onChange: (next: WeddingPartyMember) => void;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Name</span>
          <input
            className={fieldClass}
            value={member.name}
            onChange={(event) =>
              onChange({ ...member, name: event.target.value })
            }
          />
        </label>
        <label className="block">
          <span className={labelClass}>Role</span>
          <input
            className={fieldClass}
            value={member.role}
            onChange={(event) =>
              onChange({ ...member, role: event.target.value })
            }
          />
        </label>
      </div>
      <label className="block">
        <span className={labelClass}>Side</span>
        <select
          className={fieldClass}
          value={member.side}
          onChange={(event) =>
            onChange({
              ...member,
              side: event.target.value as WeddingPartyMember["side"],
            })
          }
        >
          <option value="lexi">Lexi (bridesmaids)</option>
          <option value="bright">Bright (groomsmen)</option>
          <option value="shared">Shared (pianist / honor)</option>
        </select>
      </label>
      <label className="block">
        <span className={labelClass}>Relationship</span>
        <input
          className={fieldClass}
          value={member.relationship}
          onChange={(event) =>
            onChange({
              ...member,
              relationship: event.target.value,
              relationshipIsPlaceholder: false,
            })
          }
        />
      </label>
      <label className="block">
        <span className={labelClass}>Description</span>
        <textarea
          rows={3}
          className={fieldClass}
          value={member.description}
          onChange={(event) =>
            onChange({
              ...member,
              description: event.target.value,
              descriptionIsPlaceholder: false,
            })
          }
        />
      </label>
      <label className="block">
        <span className={labelClass}>Fun fact (optional)</span>
        <input
          className={fieldClass}
          value={member.funFact ?? ""}
          onChange={(event) =>
            onChange({
              ...member,
              funFact: event.target.value || undefined,
              funFactIsPlaceholder: false,
            })
          }
        />
      </label>
    </>
  );
}
