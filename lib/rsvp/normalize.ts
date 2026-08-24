import "server-only";

/** Normalize guest names for careful matching — lowercase, strip punctuation, collapse space. */
export function normalizeGuestName(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function namesMatch(query: string, candidate: string): boolean {
  const q = normalizeGuestName(query);
  const c = normalizeGuestName(candidate);
  if (!q || !c) return false;
  if (q === c) return true;

  const qParts = q.split(" ");
  const cParts = c.split(" ");
  if (qParts.length >= 2 && cParts.length >= 2) {
    const qFirst = qParts[0];
    const qLast = qParts[qParts.length - 1];
    const cFirst = cParts[0];
    const cLast = cParts[cParts.length - 1];
    if (qFirst === cFirst && qLast === cLast) return true;
  }

  // Avoid loose substring matches that leak arbitrary membership.
  return false;
}

export function sanitizeText(input: string, max = 1000): string {
  return input.replace(/[<>]/g, "").trim().slice(0, max);
}
