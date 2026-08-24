"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  CatmullRomCurve3,
  Color,
  type Group,
  type Mesh,
  TubeGeometry,
  Vector3,
} from "three";

interface MonogramKnotProps {
  reducedMotion: boolean;
  pointerParallax: boolean;
}

function buildMonogramCurve() {
  const points = [
    new Vector3(-0.9, -0.55, 0.1),
    new Vector3(-0.55, 0.75, -0.15),
    new Vector3(0.05, 0.95, 0.2),
    new Vector3(0.65, 0.35, -0.1),
    new Vector3(0.35, -0.15, 0.25),
    new Vector3(-0.15, -0.05, -0.2),
    new Vector3(-0.45, 0.45, 0.15),
    new Vector3(0.15, 0.65, -0.05),
    new Vector3(0.75, -0.25, 0.1),
    new Vector3(0.35, -0.85, -0.1),
    new Vector3(-0.35, -0.95, 0.05),
    new Vector3(-0.9, -0.55, 0.1),
  ];
  return new CatmullRomCurve3(points, true, "catmullrom", 0.45);
}

export function MonogramKnot({
  reducedMotion,
  pointerParallax,
}: MonogramKnotProps) {
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);
  const target = useRef({ x: 0, y: 0 });

  const geometry = useMemo(() => {
    const curve = buildMonogramCurve();
    return new TubeGeometry(curve, 220, 0.045, 12, true);
  }, []);

  const gold = useMemo(() => new Color("#A6873B"), []);

  useFrame((state, delta) => {
    if (!group.current) return;

    if (!reducedMotion) {
      group.current.rotation.y += delta * 0.18;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.08;
    }

    if (pointerParallax && !reducedMotion) {
      const x = state.pointer.x * 0.18;
      const y = state.pointer.y * 0.12;
      target.current.x += (x - target.current.x) * 0.06;
      target.current.y += (y - target.current.y) * 0.06;
      group.current.rotation.y += target.current.x * 0.01;
      group.current.rotation.x += target.current.y * 0.01;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={mesh} geometry={geometry} castShadow={false} receiveShadow={false}>
        <meshStandardMaterial
          color={gold}
          metalness={0.72}
          roughness={0.32}
          envMapIntensity={0.55}
        />
      </mesh>
      <mesh scale={0.92}>
        <torusGeometry args={[0.98, 0.012, 12, 80]} />
        <meshStandardMaterial
          color="#C4A85A"
          metalness={0.55}
          roughness={0.4}
          transparent
          opacity={0.65}
        />
      </mesh>
    </group>
  );
}

export function MonogramLights({ tier }: { tier: "high" | "medium" | "low" }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} color="#fff6e8" />
      <directionalLight
        position={[-3, -1, -2]}
        intensity={tier === "low" ? 0.2 : 0.35}
        color="#d7e0d2"
      />
    </>
  );
}
