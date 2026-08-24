import { expect, test } from "@playwright/test";

test.describe("RSVP", () => {
  test("looks up a fictional household and reaches response step", async ({
    page,
  }) => {
    await page.goto("/rsvp");
    await expect(
      page.getByRole("heading", { name: "Bright & Lexi" }),
    ).toBeVisible();

    await page
      .getByLabel("Full name or invitation code")
      .fill("Alex Rivera");
    await page.getByRole("button", { name: "Find invitation" }).click();

    await expect(
      page.getByRole("heading", { name: "Alex Rivera" }).first(),
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("The Rivera Family")).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue" })).toBeVisible();
  });

  test("shows a generic miss for unknown guests", async ({ page }) => {
    await page.goto("/rsvp");
    await page
      .getByLabel("Full name or invitation code")
      .fill("Not A Real Guest");
    await page.getByRole("button", { name: "Find invitation" }).click();
    await expect(
      page.getByText(/couldn’t find a matching invitation/i),
    ).toBeVisible();
  });
});
