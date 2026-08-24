"use client";

import type { MemoryCard } from "@/data/memories";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  CanvasTexture,
  Color,
  DoubleSide,
  type Group,
  type Mesh,
  SRGBColorSpace,
} from "three";

function createPrintTexture(card: MemoryCard) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 960;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new CanvasTexture(canvas);

  const gradient = ctx.createLinearGradient(0, 0, 768, 960);
  gradient.addColorStop(0, "#E8E1D4");
  gradient.addColorStop(0.55, "#C9D0C2");
  gradient.addColorStop(1, "#A8B5A0");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 768, 960);

  ctx.strokeStyle = "rgba(166, 135, 59, 0.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, 696, 888);

  ctx.fillStyle = "#1C2A22";
  ctx.font = "500 36px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText(card.title, 384, 430);

  ctx.fillStyle = "#A6873B";
  ctx.font = "500 22px system-ui, sans-serif";
  ctx.fillText(card.dateLabel, 384, 480);

  if (card.annotation) {
    ctx.fillStyle = "#5A615C";
    ctx.font = "italic 20px Georgia, serif";
    ctx.fillText(card.annotation, 384, 540);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function MemoryPrint({
  card,
  onSelect,
}: {
  card: MemoryCard;
  onSelect: (id: string) => void;
}) {
  const mesh = useRef<Mesh>(null);
  const texture = useMemo(() => createPrintTexture(card), [card]);

  return (
    <mesh
      ref={mesh}
      position={[card.offsetX, card.offsetY, card.depth]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(card.id);
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <planeGeometry args={[1.35, 1.7]} />
      <meshStandardMaterial map={texture} side={DoubleSide} roughness={0.75} />
    </mesh>
  );
}

function GalleryThread({ depths }: { depths: number[] }) {
  const points = useMemo(() => {
    return depths.map((depth, index) => {
      const x = index % 2 === 0 ? -0.2 : 0.25;
      const y = index % 3 === 0 ? 0.3 : -0.2;
      return [x, y, depth] as [number, number, number];
    });
  }, [depths]);

  return (
    <group>
      {points.slice(0, -1).map((start, index) => {
        const end = points[index + 1];
        const mid = [
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2,
          (start[2] + end[2]) / 2,
        ] as [number, number, number];
        const length = Math.abs(end[2] - start[2]);
        return (
          <mesh key={index} position={mid} rotation={[Math.PI / 2, 0, 0.2]}>
            <cylinderGeometry args={[0.012, 0.012, length, 6]} />
            <meshStandardMaterial
              color="#A6873B"
              metalness={0.7}
              roughness={0.35}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function MemoryGalleryScene({
  cards,
  scrollProgress,
  reducedMotion,
  onSelect,
}: {
  cards: MemoryCard[];
  scrollProgress: number;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
}) {
  const group = useRef<Group>(null);
  const { camera } = useThree();
  const gold = useMemo(() => new Color("#A6873B"), []);

  useFrame(() => {
    if (reducedMotion) {
      camera.position.z = 3.2;
      return;
    }
    const z = 3.4 + scrollProgress * Math.abs(cards.at(-1)?.depth ?? -6);
    camera.position.z = z;
    camera.position.x = Math.sin(scrollProgress * Math.PI) * 0.15;
    camera.lookAt(0, 0, cards[Math.floor(scrollProgress * (cards.length - 1))]?.depth ?? -2);
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[2, 3, 4]} intensity={0.9} color="#fff8ec" />
      <GalleryThread depths={cards.map((card) => card.depth)} />
      {cards.map((card) => (
        <MemoryPrint key={card.id} card={card} onSelect={onSelect} />
      ))}
      <mesh position={[0, 0, cards.at(-1)?.depth ?? -6]} visible={false}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color={gold} />
      </mesh>
    </group>
  );
}
