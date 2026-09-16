import "server-only";

import type { RsvpDatabase } from "@/lib/rsvp/types";

const TTL_MS = 30_000;

let snapshot: { db: RsvpDatabase; expiresAt: number } | null = null;
let inFlight: Promise<RsvpDatabase> | null = null;

export function invalidateRsvpDbCache(): void {
  snapshot = null;
  inFlight = null;
}

export async function withRsvpDbCache(
  loader: () => Promise<RsvpDatabase>,
): Promise<RsvpDatabase> {
  const now = Date.now();
  if (snapshot && now < snapshot.expiresAt) {
    return snapshot.db;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = loader()
    .then((db) => {
      snapshot = { db, expiresAt: Date.now() + TTL_MS };
      inFlight = null;
      return db;
    })
    .catch((error) => {
      inFlight = null;
      throw error;
    });

  return inFlight;
}
