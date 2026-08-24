"use client";

import { EmbossedLeaf, EmbossedPath, GoldBud } from "./EmbossedPath";
import { FlapVineCanvas } from "./FlapVineCanvas";

export interface FlapVinesProps {
  glowing?: boolean;
}

/** Top flap: mirrored corner branches framing the headline — clear center band. */
export function TopFlapVines({ glowing }: FlapVinesProps) {
  return (
    <FlapVineCanvas side="top" glowing={glowing}>
      <TopCornerBranch side="left" />
      <g transform="scale(-1 1) translate(-100 0)">
        <TopCornerBranch side="right" />
      </g>
    </FlapVineCanvas>
  );
}

function TopCornerBranch({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";

  return (
    <g opacity={isLeft ? 1 : 0.98}>
      {/* Outer top edge + left diagonal — tapers before center */}
      <EmbossedPath
        d="M 3 4 C 10 3, 18 5, 26 7 C 34 9, 40 13, 42 19 C 43.5 24, 44.5 30, 45.5 36 C 46.2 40, 46.8 43, 47.2 45"
        strokeWidth={0.28}
      />
      <EmbossedPath
        d="M 26 7 C 32 6, 38 7, 42 9"
        strokeWidth={0.22}
      />
      <EmbossedPath
        d="M 12 6 C 14 10, 13 14, 11 16"
        strokeWidth={0.18}
        goldAccent
      />
      <EmbossedPath
        d="M 34 12 C 36 15, 35 18, 33 19"
        strokeWidth={0.16}
      />
      <EmbossedPath
        d="M 40 22 C 42 25, 41 28, 39 28"
        strokeWidth={0.15}
        goldAccent={isLeft}
      />

      <EmbossedLeaf cx={14} cy={10} angle={-35} scale={0.9} />
      <EmbossedLeaf cx={22} cy={8} angle={12} scale={0.85} />
      <EmbossedLeaf cx={30} cy={11} angle={-20} scale={0.8} />
      <EmbossedLeaf cx={38} cy={16} angle={28} scale={0.75} />
      <EmbossedLeaf cx={43} cy={24} angle={-15} scale={0.7} />
      <EmbossedLeaf cx={45} cy={32} angle={20} scale={0.65} />

      <GoldBud cx={11} cy={16} r={0.4} />
      <GoldBud cx={41} cy={27} r={0.35} />
    </g>
  );
}
