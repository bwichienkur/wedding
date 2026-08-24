"use client";

import { EmbossedLeaf, EmbossedPath, GoldBud } from "./EmbossedPath";
import { FlapVineCanvas } from "./FlapVineCanvas";

export interface FlapVinesProps {
  glowing?: boolean;
}

/** Left flap: single climbing vine along outer edge, curling toward seal. */
export function LeftFlapVines({ glowing }: FlapVinesProps) {
  return (
    <FlapVineCanvas side="left" glowing={glowing}>
      <EmbossedPath
        d="M 5 5 C 5.5 18, 6 32, 7.5 46 C 9 58, 12 68, 17 76 C 22 82, 28 78, 34 68 C 38 60, 42 52, 44.5 48"
        strokeWidth={0.28}
      />
      <EmbossedPath d="M 7 22 C 12 20, 16 23, 15 27" strokeWidth={0.18} />
      <EmbossedPath d="M 8 38 C 13 36, 17 39, 16 43" strokeWidth={0.17} />
      <EmbossedPath d="M 10 54 C 15 52, 19 55, 18 59" strokeWidth={0.16} />
      <EmbossedPath
        d="M 14 68 C 18 66, 21 68, 20 71"
        strokeWidth={0.15}
        goldAccent
      />
      <EmbossedPath
        d="M 30 72 C 34 68, 38 62, 41 56"
        strokeWidth={0.2}
      />

      <EmbossedLeaf cx={8} cy={14} angle={-25} scale={0.85} />
      <EmbossedLeaf cx={9} cy={28} angle={15} scale={0.8} />
      <EmbossedLeaf cx={11} cy={42} angle={-18} scale={0.78} />
      <EmbossedLeaf cx={13} cy={56} angle={22} scale={0.72} />
      <EmbossedLeaf cx={16} cy={68} angle={-12} scale={0.68} />
      <EmbossedLeaf cx={24} cy={74} angle={35} scale={0.65} />
      <EmbossedLeaf cx={36} cy={64} angle={-28} scale={0.6} />

      <GoldBud cx={15} cy={27} r={0.38} />
      <GoldBud cx={19} cy={59} r={0.34} />
    </FlapVineCanvas>
  );
}
