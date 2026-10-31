/** Controls optional tables on Supabase reads (large audit/history tables). */
export type ReadRsvpDbOptions = {
  includeSubmissions?: boolean;
  includeHistory?: boolean;
  includeAuditLogs?: boolean;
  includeResponses?: boolean;
};

/** Guest form/workspace: skip tables not needed outside admin. */
export const RSVP_GUEST_READ_OPTIONS: ReadRsvpDbOptions = {
  includeSubmissions: false,
  includeHistory: false,
  includeAuditLogs: false,
};

/** Name/code lookup only needs households, guests, and events. */
export const RSVP_LOOKUP_READ_OPTIONS: ReadRsvpDbOptions = {
  ...RSVP_GUEST_READ_OPTIONS,
  includeResponses: false,
};

export function resolveReadRsvpDbOptions(
  options?: ReadRsvpDbOptions,
): Required<ReadRsvpDbOptions> {
  return {
    includeSubmissions: options?.includeSubmissions ?? true,
    includeHistory: options?.includeHistory ?? true,
    includeAuditLogs: options?.includeAuditLogs ?? true,
    includeResponses: options?.includeResponses ?? true,
  };
}
