"use client";

import { BottomFlapVines } from "./BottomFlapVines";
import { LeftFlapVines } from "./LeftFlapVines";
import { RightFlapVines } from "./RightFlapVines";
import { TopFlapVines } from "./TopFlapVines";
import type { VineFlapSide } from "./FlapVineCanvas";

export interface EnvelopeVinesProps {
  side: VineFlapSide;
  glowing?: boolean;
}

/** Renders flap-specific engraved botanical art inside its parent flap. */
export function EnvelopeVines({ side, glowing }: EnvelopeVinesProps) {
  switch (side) {
    case "top":
      return <TopFlapVines glowing={glowing} />;
    case "left":
      return <LeftFlapVines glowing={glowing} />;
    case "right":
      return <RightFlapVines glowing={glowing} />;
    case "bottom":
      return <BottomFlapVines glowing={glowing} />;
  }
}

export {
  TopFlapVines,
  LeftFlapVines,
  RightFlapVines,
  BottomFlapVines,
};
