import { weddingParty } from "@/data/party";
import {
  listBundledMediaFromParty,
  listDefaultBundledMediaAssets,
} from "@/lib/media/bundled-assets";
import { describe, expect, it } from "vitest";

describe("bundled media assets", () => {
  it("includes repo party portraits with static paths", () => {
    const bundled = listDefaultBundledMediaAssets();
    const zach = bundled.find((item) => item.memberId === "zach-bragg");
    expect(zach).toBeDefined();
    expect(zach?.publicUrl).toBe("/images/party/zach-bragg.jpg");
    expect(zach?.placementKey).toBe("party");
  });

  it("merges logistics party photoSrc overrides", () => {
    const members = weddingParty.map((m) =>
      m.id === "zach-bragg"
        ? { ...m, photoSrc: "/images/party/zach-bragg.jpg" }
        : m,
    );
    expect(listBundledMediaFromParty(members)).toHaveLength(1);
  });
});
