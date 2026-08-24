import { expect, type Page } from "@playwright/test";

/** Bypass sealed intro in content tests (not used by product UI). */
export async function dismissIntro(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem("bl-wedding-intro-force-skip", "1");
  });
}

export async function gotoHome(page: Page, hash = "") {
  await dismissIntro(page);
  await page.goto(`/${hash}`);
  await expect(page.locator("#home")).toBeVisible();
}
