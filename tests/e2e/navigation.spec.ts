import { expect, test } from "@playwright/test";
import { gotoHome } from "./helpers";

test.describe("navigation", () => {
  test("invite section drawer reaches venue and FAQ", async ({ page }) => {
    await gotoHome(page);
    await page.getByRole("button", { name: "Open page menu" }).click();
    await expect(
      page.getByRole("navigation", { name: "Page sections" }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Page sections" })
      .getByRole("link", { name: /venue/i })
      .click();
    await expect(page.locator("#venue")).toBeInViewport();
    await page.getByRole("button", { name: "Open page menu" }).click();
    await page
      .getByRole("navigation", { name: "Page sections" })
      .getByRole("link", { name: "FAQ" })
      .click();
    await expect(page.locator("#faq")).toBeInViewport();
  });

  test("music mute control toggles aria state", async ({ page }) => {
    await gotoHome(page);
    const mute = page.getByRole("button", { name: "Mute background music" });
    await expect(mute).toBeVisible();
    await mute.click();
    await expect(
      page.getByRole("button", { name: "Unmute background music" }),
    ).toBeVisible();
  });

  test("homepage carousel exposes photo controls", async ({ page }) => {
    await gotoHome(page);
    await expect(
      page.getByRole("region", { name: "Homepage photographs" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Show photo 2 of/i }),
    ).toBeVisible();
  });
});
