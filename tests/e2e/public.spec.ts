import { expect, test } from "@playwright/test";

test.describe("public invitation", () => {
  test("shows skip links, couple branding, and core sections", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Skip to content" })).toBeAttached();
    await expect(
      page.getByRole("link", { name: "Skip to wedding details" }),
    ).toBeAttached();

    // Intro or hero should present the couple name
    await expect(page.getByText("Bright & Lexi").first()).toBeVisible();

    // Dismiss intro if present
    const begin = page.getByRole("button", { name: "Begin our story" });
    if (await begin.isVisible().catch(() => false)) {
      await page.getByRole("button", { name: "Skip to wedding details" }).click();
    }

    await expect(page.locator("#wedding-day")).toBeVisible();
    await expect(page.locator("#venue")).toBeVisible();
    await expect(page.locator("#faq")).toBeVisible();
    await expect(page.locator("#registry")).toBeVisible();
    await expect(page.getByRole("link", { name: "RSVP" }).first()).toBeVisible();
  });

  test("remembers intro dismissal for returning visitors", async ({ page }) => {
    await page.goto("/");
    const skip = page.getByRole("button", { name: "Skip to wedding details" });
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
    }

    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Begin our story" }),
    ).toHaveCount(0);
    await expect(page.locator("#home")).toBeVisible();
  });

  test("schedule includes ceremony time and calendar actions", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("bl-wedding-intro-seen", "1");
    });
    await page.goto("/#wedding-day");
    await expect(page.getByRole("heading", { name: "Ceremony" })).toBeVisible();
    await expect(page.getByText("4:00 PM").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Google Calendar" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Download ICS" }),
    ).toBeVisible();
  });

  test("FAQ search filters questions", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("bl-wedding-intro-seen", "1");
    });
    await page.goto("/#faq");
    await page.getByPlaceholder("Dress code, parking, RSVP…").fill("parking");
    await expect(
      page.getByRole("button", { name: "Where do I park?" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "What is the dress code?" }),
    ).toHaveCount(0);
  });

  test("respects reduced motion by keeping intro static controls usable", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const skip = page.getByRole("button", { name: "Skip to wedding details" });
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
    }
    await expect(page.locator("#wedding-day")).toBeVisible();
  });
});
