/**
 * Safari (and iOS AVPlayer) often probe with `Range: bytes=0-1`. Two bytes of an
 * ID3 tag are not decodable; serve the full file instead of honoring micro-ranges.
 */
export function upstreamRangeHeader(
  range: string | null,
  request: Request,
): string | null {
  if (!range) return null;

  const dest = request.headers.get("sec-fetch-dest");
  if (dest === "document") {
    return null;
  }

  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/html")) {
    return null;
  }

  const match = range.match(/^bytes=(\d+)-(\d*)$/i);
  if (!match) return range;

  const start = Number(match[1]);
  if (match[2] === "") {
    return range;
  }

  const end = Number(match[2]);
  if (end - start <= 8191) {
    return null;
  }

  return range;
}
