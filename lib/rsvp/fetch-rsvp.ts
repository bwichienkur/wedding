import { RSVP_TRY_AGAIN_MESSAGE } from "@/lib/rsvp/api-errors";

/** Retry idempotent guest GET/POST once when the backend is briefly unavailable. */
export async function fetchRsvpJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<{ response: Response; data: T }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    let response: Response;
    try {
      response = await fetch(input, init);
    } catch {
      if (attempt === 1) {
        throw new Error(RSVP_TRY_AGAIN_MESSAGE);
      }
      continue;
    }

    const retryable =
      response.status === 503 || response.status === 502 || response.status === 504;
    if (retryable && attempt === 0) {
      continue;
    }

    const data = (await response.json()) as T;
    return { response, data };
  }

  throw new Error(RSVP_TRY_AGAIN_MESSAGE);
}

export { RSVP_TRY_AGAIN_MESSAGE };
