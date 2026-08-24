import { MonogramSvg } from "@/components/monogram/MonogramSvg";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("MonogramSvg", () => {
  it("exposes an accessible name by default", () => {
    render(<MonogramSvg />);
    expect(
      screen.getByRole("img", { name: /Bright & Lexi monogram/i }),
    ).toBeInTheDocument();
  });

  it("can render decoratively", () => {
    const { container } = render(<MonogramSvg decorative />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
