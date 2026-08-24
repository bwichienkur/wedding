import { GoldenThread } from "@/components/story/GoldenThread";
import { memoryGallery } from "@/data/memories";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("GoldenThread", () => {
  it("renders a decorative svg path for story chapters", () => {
    const { container } = render(
      <GoldenThread chapter="story" split progress={0.5} />,
    );
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.querySelectorAll("path").length).toBeGreaterThanOrEqual(2);
  });
});

describe("memory gallery data", () => {
  it("derives curated cards from story milestones", () => {
    expect(memoryGallery.length).toBeGreaterThan(0);
    expect(memoryGallery[0]?.storyHref).toMatch(/^#story-/);
  });
});
