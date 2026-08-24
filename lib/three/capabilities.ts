export type PerformanceTier = "high" | "medium" | "low";

export interface ExperienceCapabilities {
  webgl: boolean;
  reducedMotion: boolean;
  saveData: boolean;
  tier: PerformanceTier;
  /** Prefer static/simplified presentation */
  simplified: boolean;
}

function detectWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

function detectTier(): PerformanceTier {
  if (typeof navigator === "undefined") return "medium";

  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  const cores = navigator.hardwareConcurrency ?? 4;
  const saveData =
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData === true;

  if (saveData || (memory !== undefined && memory <= 2) || cores <= 2) {
    return "low";
  }
  if (memory !== undefined && memory <= 4) return "medium";
  return "high";
}

export function getExperienceCapabilities(): ExperienceCapabilities {
  const webgl = detectWebGL();
  const reducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData =
    typeof navigator !== "undefined" &&
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData === true;
  const tier = detectTier();
  const simplified = !webgl || reducedMotion || saveData || tier === "low";

  return { webgl, reducedMotion, saveData, tier, simplified };
}

export function maxDevicePixelRatio(tier: PerformanceTier): number {
  if (tier === "low") return 1;
  if (tier === "medium") return 1.25;
  return 1.5;
}
