"use client";

import { FlapEmbossedArt } from "./FlapEmbossedArt";

export interface FlapVinesProps {
  glowing?: boolean;
}

/** Left flap: illustrated vertical filigree along outer edge. */
export function LeftFlapVines({ glowing }: FlapVinesProps) {
  return <FlapEmbossedArt side="left" glowing={glowing} />;
}
