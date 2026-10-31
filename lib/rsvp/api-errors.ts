const TRANSIENT_PATTERNS = [
  /supabase/i,
  /fetch failed/i,
  /network/i,
  /timeout/i,
  /econnrefused/i,
  /503/,
  /502/,
  /504/,
  /service unavailable/i,
  /failed to fetch/i,
];

export const RSVP_TRY_AGAIN_MESSAGE =
  "Our guest list is temporarily unavailable. Please wait a moment and try again.";

export function isLikelyTransientRsvpBackendError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  if (!message) return true;
  return TRANSIENT_PATTERNS.some((pattern) => pattern.test(message));
}

export function rsvpUnavailableResponse(error: unknown): {
  error: string;
  status: 503;
} {
  return {
    error: isLikelyTransientRsvpBackendError(error)
      ? RSVP_TRY_AGAIN_MESSAGE
      : "Unable to look up invitation right now.",
    status: 503,
  };
}
