"use client";

import { FlapEmbossedArt } from "./FlapEmbossedArt";

export interface FlapVinesProps {
  glowing?: boolean;
}

/** Right flap: mirrored vertical filigree. */
export function RightFlapVines({ glowing }: FlapVinesProps) {
  return <FlapEmbossedArt side="right" glowing={glowing} />;
}
