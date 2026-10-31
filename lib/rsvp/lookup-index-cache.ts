import "server-only";

import type { EventRecord, Guest, Household, RsvpDatabase } from "@/lib/rsvp/types";

export type RsvpLookupIndex = Pick<RsvpDatabase, "events" | "households" | "guests">;

const TTL_MS = 90_000;

let snapshot: { index: RsvpLookupIndex; expiresAt: number } | null = null;
let inFlight: Promise<RsvpLookupIndex> | null = null;

export function invalidateRsvpLookupIndexCache(): void {
  snapshot = null;
  inFlight = null;
}

export async function withRsvpLookupIndexCache(
  loader: () => Promise<RsvpLookupIndex>,
): Promise<RsvpLookupIndex> {
  const now = Date.now();
  if (snapshot && now < snapshot.expiresAt) {
    return snapshot.index;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = loader()
    .then((index) => {
      snapshot = { index, expiresAt: Date.now() + TTL_MS };
      inFlight = null;
      return index;
    })
    .catch((error) => {
      inFlight = null;
      throw error;
    });

  return inFlight;
}
