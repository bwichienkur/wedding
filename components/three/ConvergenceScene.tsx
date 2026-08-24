"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  CatmullRomCurve3,
  Color,
  DoubleSide,
  type Group,
  TubeGeometry,
  Vector3,
} from "three";

function curveFromPoints(points: Vector3[]) {
  return new CatmullRomCurve3(points, false, "catmullrom", 0.35);
}

export function ConvergenceScene({
  progress,
  reducedMotion,
}: {
  progress: number;
  reducedMotion: boolean;
}) {
  const group = useRef<Group>(null);
  const gold = useMemo(() => new Color("#A6873B"), []);

  const brightGeometry = useMemo(() => {
    const curve = curveFromPoints([
      new Vector3(-2.4, 1.1, 0),
      new Vector3(-1.2, 0.7, 0.2),
      new Vector3(-0.3, 0.25, -0.1),
      new Vector3(0.2, 0.05, 0.05),
      new Vector3(0.8, 0, 0),
    ]);
    return new TubeGeometry(curve, 80, 0.028, 8, false);
  }, []);

  const lexiGeometry = useMemo(() => {
    const curve = curveFromPoints([
      new Vector3(-2.4, -1.1, 0),
      new Vector3(-1.2, -0.65, -0.15),
      new Vector3(-0.25, -0.2, 0.12),
      new Vector3(0.25, 0.02, -0.04),
      new Vector3(0.8, 0, 0),
    ]);
    return new TubeGeometry(curve, 80, 0.028, 8, false);
  }, []);

  const unitedGeometry = useMemo(() => {
    const curve = curveFromPoints([
      new Vector3(0.8, 0, 0),
      new Vector3(1.2, 0.08, 0.05),
      new Vector3(1.7, -0.05, -0.05),
      new Vector3(2.3, 0, 0),
    ]);
    return new TubeGeometry(curve, 40, 0.034, 8, false);
  }, []);

  useFrame((state) => {
    if (!group.current || reducedMotion) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
  });

  const weave = reducedMotion ? 1 : Math.min(1, Math.max(0, progress));
  const showUnited = weave > 0.55;
  const frameScale = showUnited ? Math.min(1, (weave - 0.55) / 0.45) : 0;

  return (
    <group ref={group}>
      <ambientLight intensity={0.65} />
      <directionalLight position={[2, 2, 3]} intensity={1} color="#fff6e8" />

      <mesh geometry={brightGeometry} scale={[1, 1, 1]}>
        <meshStandardMaterial
          color={gold}
          metalness={0.7}
          roughness={0.32}
          transparent
          opacity={0.35 + weave * 0.65}
        />
      </mesh>
      <mesh geometry={lexiGeometry}>
        <meshStandardMaterial
          color={gold}
          metalness={0.7}
          roughness={0.32}
          transparent
          opacity={0.35 + weave * 0.65}
        />
      </mesh>

      {showUnited ? (
        <mesh geometry={unitedGeometry}>
          <meshStandardMaterial
            color="#C4A85A"
            metalness={0.75}
            roughness={0.28}
          />
        </mesh>
      ) : null}

      <group position={[1.55, 0, 0]} scale={0.15 + frameScale * 0.95}>
        <mesh>
          <planeGeometry args={[1.6, 0.95]} />
          <meshStandardMaterial color="#E8E1D4" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <ringGeometry args={[0.62, 0.66, 48]} />
          <meshStandardMaterial
            color={gold}
            metalness={0.8}
            roughness={0.3}
            side={DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0, 0.03]}>
          <planeGeometry args={[1.35, 0.76]} />
          <meshStandardMaterial color="#d5cbb8" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
