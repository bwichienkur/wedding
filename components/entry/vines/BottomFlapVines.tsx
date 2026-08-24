"use client";

import { EmbossedLeaf, EmbossedPath, GoldBud } from "./EmbossedPath";
import { FlapVineCanvas } from "./FlapVineCanvas";

export interface FlapVinesProps {
  glowing?: boolean;
}

/** Bottom flap: corner vines + restrained central flourish; clear footer zone. */
export function BottomFlapVines({ glowing }: FlapVinesProps) {
  return (
    <FlapVineCanvas side="bottom" glowing={glowing}>
      <BottomCornerBranch side="left" />
      <g transform="scale(-1 1) translate(-100 0)">
        <BottomCornerBranch side="right" />
      </g>
      <BottomCenterFlourish glowing={glowing} />
    </FlapVineCanvas>
  );
}

function BottomCornerBranch({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";

  return (
    <g>
      <EmbossedPath
        d="M 4 96 C 6 88, 10 80, 16 72 C 22 64, 30 56, 38 51 C 42 49, 45 47.5, 47 46.5"
        strokeWidth={0.28}
      />
      <EmbossedPath d="M 16 72 C 14 76, 12 80, 10 84" strokeWidth={0.18} />
      <EmbossedPath
        d="M 28 58 C 30 62, 29 66, 27 67"
        strokeWidth={0.16}
        goldAccent={isLeft}
      />
      <EmbossedPath d="M 36 52 C 38 54, 37 56, 35 56" strokeWidth={0.14} />

      <EmbossedLeaf cx={10} cy={88} angle={35} scale={0.82} />
      <EmbossedLeaf cx={18} cy={78} angle={-20} scale={0.76} />
      <EmbossedLeaf cx={26} cy={68} angle={25} scale={0.72} />
      <EmbossedLeaf cx={34} cy={58} angle={-18} scale={0.68} />
      <EmbossedLeaf cx={42} cy={52} angle={15} scale={0.62} />

      <GoldBud cx={12} cy={84} r={0.38} />
      <GoldBud cx={30} cy={66} r={0.34} />
    </g>
  );
}

function BottomCenterFlourish({ glowing }: { glowing?: boolean }) {
  return (
    <g className={glowing ? "envelope-vines-center--lit" : undefined}>
      <EmbossedPath
        d="M 50 92 C 49 86, 48 80, 50 76 C 52 80, 51 86, 50 92"
        strokeWidth={0.22}
        goldAccent
      />
      <EmbossedPath d="M 50 76 C 46 78, 44 80, 45 83" strokeWidth={0.16} />
      <EmbossedPath d="M 50 76 C 54 78, 56 80, 55 83" strokeWidth={0.16} />
      <EmbossedLeaf cx={46} cy={81} angle={-40} scale={0.55} />
      <EmbossedLeaf cx={54} cy={81} angle={40} scale={0.55} />
      <GoldBud cx={50} cy={74} r={0.42} />
    </g>
  );
}
