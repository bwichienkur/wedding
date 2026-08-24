"use client";

import { getStableCountdownParts, type CountdownParts } from "@/lib/dates";
import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, 60_000);
  return () => window.clearInterval(id);
}

function getSnapshot(): CountdownParts {
  return getStableCountdownParts();
}

function getServerSnapshot(): null {
  return null;
}

/** Live wedding countdown — null during SSR to avoid hydration text drift. */
export function useWeddingCountdown(): CountdownParts | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
