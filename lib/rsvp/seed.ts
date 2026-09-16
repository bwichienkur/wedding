import "server-only";

import { createStandardEvents } from "@/lib/rsvp/event-config";
import {
  appendTestHousehold,
  shouldIncludeTestHousehold,
} from "@/lib/rsvp/test-fixtures";
import type { RsvpDatabase } from "@/lib/rsvp/types";

/** Default RSVP store: standard events, no guest list until you import real invitations. */
export function createSeedDatabase(): RsvpDatabase {
  const db: RsvpDatabase = {
    events: createStandardEvents(),
    mealOptions: [],
    households: [],
    guests: [],
    responses: [],
    submissions: [],
    history: [],
    auditLogs: [],
  };

  if (shouldIncludeTestHousehold()) {
    appendTestHousehold(db);
  }

  return db;
}
