import "server-only";

import { normalizeGuestName } from "@/lib/rsvp/normalize";

const TITLE_TOKENS = new Set([
  "mr",
  "mrs",
  "ms",
  "miss",
  "dr",
  "prof",
  "rev",
]);

/** Score how well a lookup query matches a guest's normalized name (higher = better). */
export function scoreGuestNameMatch(query: string, candidateNormalized: string): number {
  const q = stripTitles(normalizeGuestName(query));
  const c = stripTitles(candidateNormalized);
  if (!q || !c) return 0;
  if (q === c) return 100;

  const qParts = q.split(" ").filter(Boolean);
  const cParts = c.split(" ").filter(Boolean);
  if (qParts.length === 0 || cParts.length === 0) return 0;

  const cFirst = cParts[0]!;
  const cLast = cParts[cParts.length - 1]!;

  if (qParts.length === 1) {
    const word = qParts[0]!;
    if (word.length < 2) return 0;
    if (word === cFirst || word === cLast) return 75;
    if (word.length >= 3 && (cFirst.startsWith(word) || cLast.startsWith(word))) {
      return 55;
    }
    if (c.includes(` ${word} `) || c.endsWith(` ${word}`) || c.startsWith(`${word} `)) {
      return 45;
    }
    return 0;
  }

  const qFirst = qParts[0]!;
  const qLast = qParts[qParts.length - 1]!;

  if (
    (qFirst === cFirst && qLast === cLast) ||
    (qFirst === cLast && qLast === cFirst)
  ) {
    return 90;
  }

  if (
    qParts.every((part) =>
      cParts.some(
        (cp) => cp === part || (part.length >= 3 && cp.startsWith(part)),
      ),
    )
  ) {
    return 70;
  }

  return 0;
}

export function stripTitles(normalized: string): string {
  const parts = normalized.split(" ").filter(Boolean);
  while (parts.length > 0 && TITLE_TOKENS.has(parts[0]!)) {
    parts.shift();
  }
  return parts.join(" ");
}
