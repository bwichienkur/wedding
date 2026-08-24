"use client";

import {
  getExperienceCapabilities,
  type ExperienceCapabilities,
} from "@/lib/three/capabilities";
import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);

  if (typeof window === "undefined") {
    return () => listeners.delete(callback);
  }

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange = () => {
    listeners.forEach((listener) => listener());
  };

  motionQuery.addEventListener("change", onChange);
  window.addEventListener("offline", onChange);

  return () => {
    listeners.delete(callback);
    motionQuery.removeEventListener("change", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function getClientSnapshot(): ExperienceCapabilities {
  return getExperienceCapabilities();
}

function getServerSnapshot(): ExperienceCapabilities {
  return {
    webgl: false,
    reducedMotion: false,
    saveData: false,
    tier: "medium",
    simplified: true,
  };
}

/** Runtime experience mode — SSR defaults to simplified until hydrated. */
export function useExperienceCapabilities(): ExperienceCapabilities {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
