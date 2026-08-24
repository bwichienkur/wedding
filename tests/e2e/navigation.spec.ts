import { expect, test } from "@playwright/test";

test.describe("navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("bl-wedding-intro-seen", "1");
    });
  });

  test("desktop primary nav reaches venue and FAQ", async ({ page }) => {
    test.skip(
      test.info().project.name !== "chromium-desktop",
      "Desktop nav project only",
    );
    await page.goto("/");
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Venue" })
      .click();
    await expect(page.locator("#venue")).toBeVisible();
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "FAQ" })
      .click();
    await expect(page.locator("#faq")).toBeVisible();
  });

  test("mobile menu opens with large targets and RSVP remains available", async ({
    page,
  }) => {
    test.skip(
      test.info().project.name !== "chromium-mobile",
      "Mobile project only",
    );
    await page.goto("/");
    await expect(page.getByRole("link", { name: "RSVP" }).first()).toBeVisible();
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();
    await page
      .getByRole("navigation", { name: "Mobile" })
      .getByRole("link", { name: "Travel" })
      .click();
    await expect(page.locator("#travel")).toBeVisible();
  });
});
