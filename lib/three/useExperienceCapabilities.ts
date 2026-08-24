"use client";

import {
  getExperienceCapabilities,
  type ExperienceCapabilities,
} from "@/lib/three/capabilities";
import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

const serverSnapshot: ExperienceCapabilities = {
  webgl: false,
  reducedMotion: false,
  saveData: false,
  tier: "medium",
  simplified: true,
};

/** Stable client snapshot — must be referentially equal between store reads. */
let clientSnapshot: ExperienceCapabilities = serverSnapshot;
let clientSnapshotReady = false;

function sameCapabilities(
  a: ExperienceCapabilities,
  b: ExperienceCapabilities,
): boolean {
  return (
    a.webgl === b.webgl &&
    a.reducedMotion === b.reducedMotion &&
    a.saveData === b.saveData &&
    a.tier === b.tier &&
    a.simplified === b.simplified
  );
}

function refreshClientSnapshot(): ExperienceCapabilities {
  const next = getExperienceCapabilities();
  if (!clientSnapshotReady || !sameCapabilities(clientSnapshot, next)) {
    clientSnapshot = next;
  }
  clientSnapshotReady = true;
  return clientSnapshot;
}

function subscribe(callback: () => void) {
  listeners.add(callback);

  if (typeof window === "undefined") {
    return () => listeners.delete(callback);
  }

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange = () => {
    const previous = clientSnapshot;
    refreshClientSnapshot();
    if (previous !== clientSnapshot) {
      listeners.forEach((listener) => listener());
    }
  };

  motionQuery.addEventListener("change", onChange);
  window.addEventListener("offline", onChange);
  window.addEventListener("online", onChange);

  return () => {
    listeners.delete(callback);
    motionQuery.removeEventListener("change", onChange);
    window.removeEventListener("offline", onChange);
    window.removeEventListener("online", onChange);
  };
}

function getClientSnapshot(): ExperienceCapabilities {
  if (!clientSnapshotReady) {
    return refreshClientSnapshot();
  }
  return clientSnapshot;
}

function getServerSnapshot(): ExperienceCapabilities {
  return serverSnapshot;
}

/** Runtime experience mode — SSR defaults to simplified until hydrated. */
export function useExperienceCapabilities(): ExperienceCapabilities {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}

/** Test helper — resets the cached client snapshot between Vitest cases. */
export function resetExperienceCapabilityStore(): void {
  clientSnapshot = serverSnapshot;
  clientSnapshotReady = false;
}
