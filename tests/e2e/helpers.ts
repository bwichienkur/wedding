import { expect, type Page } from "@playwright/test";

/** Skip cinematic entry so section assertions hit the invitation content. */
export async function dismissIntro(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("bl-wedding-intro-seen", "1");
  });
}

export async function gotoHome(page: Page, hash = "") {
  await dismissIntro(page);
  await page.goto(`/${hash}`);
  await expect(page.locator("#home")).toBeVisible();
}
