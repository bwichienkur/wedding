"use client";

import { FlapEmbossedArt } from "./FlapEmbossedArt";

export interface FlapVinesProps {
  glowing?: boolean;
}

/** Top flap: illustrated corner filigree from embossed artwork. */
export function TopFlapVines({ glowing }: FlapVinesProps) {
  return <FlapEmbossedArt side="top" glowing={glowing} />;
}
