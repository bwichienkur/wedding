"use client";

import { Accordion } from "@/components/ui/Accordion";
import { Section } from "@/components/ui/Section";
import type { FaqItem } from "@/data/logistics-types";
import { faqItems as defaultFaqItems } from "@/data/faq";
import { cn } from "@/lib/cn";
import { useMemo, useState } from "react";

export function FaqSection({
  items = defaultFaqItems,
  eyebrow = "FAQ",
  title = "A few helpful answers",
  description = "Search or browse by topic. Placeholder answers stay clearly labeled until confirmed.",
}: {
  items?: FaqItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
} = {}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const categories = useMemo(
    () => [...new Set(items.map((item) => item.category))],
    [items],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const categoryOk = category === "All" || item.category === category;
      if (!categoryOk) return false;
      if (!normalized) return true;
      return (
        item.question.toLowerCase().includes(normalized) ||
        item.answer.toLowerCase().includes(normalized) ||
        item.category.toLowerCase().includes(normalized)
      );
    });
  }, [category, items, query]);

  return (
    <Section
      id="faq"
      eyebrow={eyebrow}
      title={title}
      description={description}
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm">
          <span className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
            Search
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Dress code, parking, RSVP…"
            className="min-h-12 w-full border border-stone bg-ivory px-3 text-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          />
        </label>
        <label className="block text-sm sm:w-52">
          <span className="mb-2 block font-sans text-xs uppercase tracking-[0.16em] text-ink-muted">
            Category
          </span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="min-h-12 w-full border border-stone bg-ivory px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <option value="All">All</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-muted">No questions match that search.</p>
      ) : (
        <Accordion
          items={filtered.map((item) => ({
            id: `faq-${item.id}`,
            title: item.question,
            content: (
              <div>
                <p className="mb-2 font-sans text-xs uppercase tracking-[0.16em] text-gold">
                  {item.category}
                </p>
                <p
                  className={cn(
                    "max-w-prose text-base leading-relaxed text-charcoal",
                    item.answerIsPlaceholder && "placeholder-copy text-ink-muted",
                  )}
                >
                  {item.answer}
                </p>
              </div>
            ),
          }))}
        />
      )}
    </Section>
  );
}
