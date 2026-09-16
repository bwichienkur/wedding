"use client";

import { getCountdownParts, type CountdownParts } from "@/lib/dates";
import { useSyncExternalStore } from "react";

/** Stable reference per second — required by useSyncExternalStore in React 19. */
let snapshotCache: { tick: number; value: CountdownParts } | null = null;

function snapshotTick(now = Date.now()): number {
  return Math.floor(now / 1000);
}

function getSnapshot(): CountdownParts {
  const tick = snapshotTick();
  if (snapshotCache?.tick === tick) {
    return snapshotCache.value;
  }
  const value = getCountdownParts(new Date(tick * 1000));
  snapshotCache = { tick, value };
  return value;
}

function subscribe(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(id);
}

function getServerSnapshot(): null {
  return null;
}

/** Live wedding countdown — null during SSR to avoid hydration text drift. */
export function useWeddingCountdown(): CountdownParts | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** @internal Test helper */
export function resetWeddingCountdownSnapshotCache(): void {
  snapshotCache = null;
}
