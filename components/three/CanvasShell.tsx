"use client";

import { Button } from "@/components/ui/Button";
import { maxDevicePixelRatio } from "@/lib/three/capabilities";
import { useExperienceCapabilities } from "@/lib/three/useExperienceCapabilities";
import { Canvas } from "@react-three/fiber";
import {
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface CanvasShellProps {
  children: ReactNode;
  className?: string;
  ariaLabel: string;
  camera?: {
    position?: [number, number, number];
    fov?: number;
  };
}

export function CanvasShell({
  children,
  className,
  ariaLabel,
  camera = { position: [0, 0, 4], fov: 42 },
}: CanvasShellProps) {
  const capabilities = useExperienceCapabilities();
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!host) return;

    let frameVisible = true;
    let pageVisible = document.visibilityState === "visible";

    const sync = () => {
      setActive(frameVisible && pageVisible);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        frameVisible = entry.isIntersecting;
        sync();
      },
      { rootMargin: "120px", threshold: 0.02 },
    );
    observer.observe(host);

    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [host]);

  return (
    <div ref={setHost} className={className} role="img" aria-label={ariaLabel}>
      <Canvas
        dpr={[1, maxDevicePixelRatio(capabilities.tier)]}
        gl={{
          antialias: capabilities.tier !== "low",
          alpha: true,
          powerPreference:
            capabilities.tier === "high" ? "high-performance" : "low-power",
        }}
        camera={camera}
        frameloop={active ? "always" : "never"}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}

/** Presentational pause notice for when WebGL is unavailable — unused helper export for tests. */
export function WebGlUnavailableNotice({ onContinue }: { onContinue?: () => void }) {
  return (
    <div className="rounded-sm border border-gold/25 bg-parchment px-4 py-6 text-center">
      <p className="font-display text-xl text-gold">Simplified view</p>
      <p className="mt-2 text-sm text-ivory/70">
        This device is using the non-3D experience so everything stays smooth and
        readable.
      </p>
      {onContinue ? (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={onContinue}>
            Continue
          </Button>
        </div>
      ) : null}
    </div>
  );
}
