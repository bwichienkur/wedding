/** Client-safe Mux helpers (no secrets). */
export function muxPosterUrl(playbackId: string, time = 1): string {
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?time=${time}&width=1280`;
}
