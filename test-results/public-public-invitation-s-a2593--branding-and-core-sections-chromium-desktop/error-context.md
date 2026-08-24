# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: public.spec.ts >> public invitation >> shows skip links, couple branding, and core sections
- Location: tests/e2e/public.spec.ts:4:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Bright & Lexi').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Bright & Lexi').first()

```

```yaml
- img
- heading "This page couldn’t load" [level=1]
- paragraph: Reload to try again, or go back.
- button "Reload"
- button "Back"
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | 
  3  | test.describe("public invitation", () => {
  4  |   test("shows skip links, couple branding, and core sections", async ({
  5  |     page,
  6  |   }) => {
  7  |     await page.goto("/");
  8  | 
  9  |     await expect(page.getByRole("link", { name: "Skip to content" })).toBeAttached();
  10 |     await expect(
  11 |       page.getByRole("link", { name: "Skip to wedding details" }),
  12 |     ).toBeAttached();
  13 | 
  14 |     // Intro or hero should present the couple name
> 15 |     await expect(page.getByText("Bright & Lexi").first()).toBeVisible();
     |                                                           ^ Error: expect(locator).toBeVisible() failed
  16 | 
  17 |     // Dismiss intro if present
  18 |     const begin = page.getByRole("button", { name: "Begin our story" });
  19 |     if (await begin.isVisible().catch(() => false)) {
  20 |       await page.getByRole("button", { name: "Skip to wedding details" }).click();
  21 |     }
  22 | 
  23 |     await expect(page.locator("#wedding-day")).toBeVisible();
  24 |     await expect(page.locator("#venue")).toBeVisible();
  25 |     await expect(page.locator("#faq")).toBeVisible();
  26 |     await expect(page.locator("#registry")).toBeVisible();
  27 |     await expect(page.getByRole("link", { name: "RSVP" }).first()).toBeVisible();
  28 |   });
  29 | 
  30 |   test("remembers intro dismissal for returning visitors", async ({ page }) => {
  31 |     await page.goto("/");
  32 |     const skip = page.getByRole("button", { name: "Skip to wedding details" });
  33 |     if (await skip.isVisible().catch(() => false)) {
  34 |       await skip.click();
  35 |     }
  36 | 
  37 |     await page.goto("/");
  38 |     await expect(
  39 |       page.getByRole("button", { name: "Begin our story" }),
  40 |     ).toHaveCount(0);
  41 |     await expect(page.locator("#home")).toBeVisible();
  42 |   });
  43 | 
  44 |   test("schedule includes ceremony time and calendar actions", async ({
  45 |     page,
  46 |   }) => {
  47 |     await page.addInitScript(() => {
  48 |       window.localStorage.setItem("bl-wedding-intro-seen", "1");
  49 |     });
  50 |     await page.goto("/#wedding-day");
  51 |     await expect(page.getByRole("heading", { name: "Ceremony" })).toBeVisible();
  52 |     await expect(page.getByText("4:00 PM").first()).toBeVisible();
  53 |     await expect(
  54 |       page.getByRole("link", { name: "Google Calendar" }),
  55 |     ).toBeVisible();
  56 |     await expect(
  57 |       page.getByRole("button", { name: "Download ICS" }),
  58 |     ).toBeVisible();
  59 |   });
  60 | 
  61 |   test("FAQ search filters questions", async ({ page }) => {
  62 |     await page.addInitScript(() => {
  63 |       window.localStorage.setItem("bl-wedding-intro-seen", "1");
  64 |     });
  65 |     await page.goto("/#faq");
  66 |     await page.getByPlaceholder("Dress code, parking, RSVP…").fill("parking");
  67 |     await expect(
  68 |       page.getByRole("button", { name: "Where do I park?" }),
  69 |     ).toBeVisible();
  70 |     await expect(
  71 |       page.getByRole("button", { name: "What is the dress code?" }),
  72 |     ).toHaveCount(0);
  73 |   });
  74 | 
  75 |   test("respects reduced motion by keeping intro static controls usable", async ({
  76 |     page,
  77 |   }) => {
  78 |     await page.emulateMedia({ reducedMotion: "reduce" });
  79 |     await page.goto("/");
  80 |     const skip = page.getByRole("button", { name: "Skip to wedding details" });
  81 |     if (await skip.isVisible().catch(() => false)) {
  82 |       await skip.click();
  83 |     }
  84 |     await expect(page.locator("#wedding-day")).toBeVisible();
  85 |   });
  86 | });
  87 | 
```