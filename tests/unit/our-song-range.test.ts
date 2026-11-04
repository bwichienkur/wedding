import { describe, expect, it } from "vitest";
import { upstreamRangeHeader } from "@/lib/media/our-song-range";

describe("upstreamRangeHeader", () => {
  it("drops micro-ranges that only return ID3 prefix bytes", () => {
    const request = new Request("https://example.com/song", {
      headers: { Range: "bytes=0-1" },
    });
    expect(upstreamRangeHeader("bytes=0-1", request)).toBeNull();
  });

  it("keeps large range requests for seeking", () => {
    const request = new Request("https://example.com/song");
    expect(upstreamRangeHeader("bytes=100000-200000", request)).toBe(
      "bytes=100000-200000",
    );
  });

  it("serves full file when opened as a document", () => {
    const request = new Request("https://example.com/song", {
      headers: {
        Range: "bytes=0-1",
        "Sec-Fetch-Dest": "document",
      },
    });
    expect(upstreamRangeHeader("bytes=0-1", request)).toBeNull();
  });
});
