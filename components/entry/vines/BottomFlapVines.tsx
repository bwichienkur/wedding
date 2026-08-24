"use client";

import { FlapEmbossedArt } from "./FlapEmbossedArt";

export interface FlapVinesProps {
  glowing?: boolean;
}

/** Bottom flap: symmetrical V-shaped filigree beneath the seal. */
export function BottomFlapVines({ glowing }: FlapVinesProps) {
  return <FlapEmbossedArt side="bottom" glowing={glowing} />;
}
