export function trackEvent(
  name: string,
  payload?: Record<string, string | number | boolean | null | undefined>,
): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_ANALYTICS_ENABLED) return;
  // Abstraction only — no vendor initialized until configured.
  window.dispatchEvent(
    new CustomEvent("bl:analytics", { detail: { name, payload } }),
  );
}
