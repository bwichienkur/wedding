import { expect, test } from "@playwright/test";

/** Matches lib/rsvp/test-fixtures (e2e server runs with RSVP_INCLUDE_E2E_FIXTURE=1). */
const E2E_GUEST_NAME = "Alex Example";
const E2E_HOUSEHOLD = "The Example Family";

test.describe("RSVP", () => {
  test("looks up a fictional household and reaches the RSVP form", async ({
    page,
  }) => {
    await page.goto("/rsvp");
    await expect(
      page.getByRole("heading", { name: "Bright & Lexi" }),
    ).toBeVisible();

    await page
      .getByLabel("Full name or invitation code")
      .fill(E2E_GUEST_NAME);
    await page.getByRole("button", { name: "Find invitation" }).click();

    await expect(page.getByText(E2E_HOUSEHOLD)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(E2E_GUEST_NAME)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Attending" }).first(),
    ).toBeVisible();
    await expect(
      page.getByText(/Attending ceremony & reception/i),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Submit RSVP" })).toBeVisible();
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
