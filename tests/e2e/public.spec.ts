import { expect, test } from "@playwright/test";
import { gotoHome } from "./helpers";

test.describe("public invitation", () => {
  test("shows skip links, couple branding, and core sections", async ({
    page,
  }) => {
    await gotoHome(page);

    await expect(page.getByRole("link", { name: "Skip to content" })).toBeAttached();
    await expect(
      page.getByRole("link", { name: "Skip to wedding details" }),
    ).toBeAttached();

    await expect(
      page.getByRole("heading", { level: 1 }).filter({ hasText: "Bright" }).first(),
    ).toBeVisible();
    await expect(page.getByText("Lexi").first()).toBeVisible();

    await expect(page.locator("#wedding-day")).toBeVisible();
    await expect(page.locator("#venue")).toBeVisible();
    await expect(page.locator("#faq")).toBeVisible();
    await expect(page.locator("#registry")).toBeVisible();
    await expect(page.getByRole("link", { name: "RSVP" }).first()).toBeVisible();
  });

  test("keeps the sealed envelope until the seal is opened", async ({
    page,
  }) => {
    await page.goto("/");
    const seal = page.getByRole("button", { name: "Open wedding invitation" });
    await expect(seal).toBeVisible();
    await page.waitForTimeout(1500);
    await expect(seal).toBeVisible();
    await expect(page.locator('[data-intro="sealed"]')).toBeVisible();
  });

  test("still shows the seal after a prior visit", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open wedding invitation" }).click();
    await expect(page.locator("#home")).toBeVisible({ timeout: 16000 });

    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Open wedding invitation" }),
    ).toBeVisible();
  });

  test("opens sealed invitation via wax seal", async ({ page }) => {
    await page.goto("/");
    const seal = page.getByRole("button", { name: "Open wedding invitation" });
    await expect(seal).toBeVisible();
    await seal.click();
    await expect(page.locator("#home")).toBeVisible({ timeout: 16000 });
    await expect(page.locator('[data-intro="sealed"]')).toHaveCount(0, {
      timeout: 16000,
    });
  });

  test("schedule includes ceremony time and calendar actions", async ({
    page,
  }) => {
    await gotoHome(page, "#wedding-day");
    const schedule = page.locator("#wedding-day");
    await expect(
      schedule.getByRole("heading", { name: "Ceremony", exact: true }),
    ).toBeVisible();
    await expect(schedule.getByText("4:00 PM").first()).toBeVisible();
    await expect(
      schedule.getByRole("heading", { name: "Reception", exact: true }),
    ).toBeVisible();
    await expect(schedule.getByText("5:30 PM").first()).toBeVisible();
    await expect(
      schedule.getByRole("link", { name: "Google Calendar" }),
    ).toHaveCount(2);
    await expect(
      schedule.getByRole("button", { name: "Download ICS" }),
    ).toHaveCount(2);
  });

  test("FAQ search filters questions", async ({ page }) => {
    await gotoHome(page, "#faq");
    await page.getByPlaceholder("Dress code, parking, RSVP…").fill("parking");
    await expect(
      page.getByRole("button", { name: "Where do I park?", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "What is the dress code?", exact: true }),
    ).toHaveCount(0);
  });

  test("respects reduced motion by keeping intro static controls usable", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const skip = page.getByRole("button", { name: "Skip to wedding details" });
    await expect(skip).toBeVisible();
    await skip.click();
    await expect(page.locator("#wedding-day")).toBeVisible();
  });
});
