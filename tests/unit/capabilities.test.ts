import {
  getExperienceCapabilities,
  maxDevicePixelRatio,
  resetExperienceCapabilityCache,
} from "@/lib/three/capabilities";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("experience capabilities", () => {
  afterEach(() => {
    resetExperienceCapabilityCache();
    vi.restoreAllMocks();
  });

  it("reports simplified mode when WebGL is unavailable", () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
      }),
    });
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const capabilities = getExperienceCapabilities();
    expect(capabilities.webgl).toBe(false);
    expect(capabilities.simplified).toBe(true);
  });

  it("caps device pixel ratio by tier", () => {
    expect(maxDevicePixelRatio("low")).toBe(1);
    expect(maxDevicePixelRatio("medium")).toBe(1.25);
    expect(maxDevicePixelRatio("high")).toBe(1.5);
  });
});
