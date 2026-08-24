"use client";

import { EmbossedLeaf, EmbossedPath, GoldBud } from "./EmbossedPath";
import { FlapVineCanvas } from "./FlapVineCanvas";

export interface FlapVinesProps {
  glowing?: boolean;
}

/** Right flap: mirror of left with slightly varied tendril placement. */
export function RightFlapVines({ glowing }: FlapVinesProps) {
  return (
    <FlapVineCanvas side="right" glowing={glowing}>
      <g transform="scale(-1 1) translate(-100 0)">
        <EmbossedPath
          d="M 5 5 C 5.5 18, 6 32, 7.5 46 C 9 58, 12 68, 17 76 C 22 82, 28 78, 34 68 C 38 60, 42 52, 44.5 48"
          strokeWidth={0.28}
        />
        <EmbossedPath d="M 7 24 C 12 22, 16 25, 15 29" strokeWidth={0.18} />
        <EmbossedPath d="M 8 40 C 13 38, 17 41, 16 45" strokeWidth={0.17} />
        <EmbossedPath d="M 10 56 C 15 54, 19 57, 18 61" strokeWidth={0.16} />
        <EmbossedPath
          d="M 14 70 C 18 68, 21 70, 20 73"
          strokeWidth={0.15}
          goldAccent
        />
        <EmbossedPath
          d="M 31 74 C 35 69, 39 63, 41 57"
          strokeWidth={0.2}
        />

        <EmbossedLeaf cx={8} cy={15} angle={-22} scale={0.84} />
        <EmbossedLeaf cx={9} cy={30} angle={18} scale={0.79} />
        <EmbossedLeaf cx={11} cy={44} angle={-16} scale={0.76} />
        <EmbossedLeaf cx={13} cy={58} angle={24} scale={0.71} />
        <EmbossedLeaf cx={16} cy={70} angle={-10} scale={0.67} />
        <EmbossedLeaf cx={25} cy={75} angle={32} scale={0.64} />
        <EmbossedLeaf cx={37} cy={65} angle={-26} scale={0.61} />

        <GoldBud cx={15} cy={29} r={0.37} />
        <GoldBud cx={18} cy={61} r={0.33} />
      </g>
    </FlapVineCanvas>
  );
}
