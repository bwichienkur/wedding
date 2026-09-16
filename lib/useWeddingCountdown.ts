"use client";

import { getCountdownParts, type CountdownParts } from "@/lib/dates";
import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(id);
}

function getSnapshot(): CountdownParts {
  return getCountdownParts();
}

function getServerSnapshot(): null {
  return null;
}

/** Live wedding countdown — null during SSR to avoid hydration text drift. */
export function useWeddingCountdown(): CountdownParts | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
