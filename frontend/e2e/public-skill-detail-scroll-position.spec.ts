import { expect, test, type Page, type Route } from "@playwright/test";

async function fulfillJSON(route: Route, status: number, body: unknown): Promise<void> {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body)
  });
}

async function forceEnglishLocale(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("skillsindex.locale", "en");
  });
}

test.describe("Public skill detail scroll behavior", () => {
  test("resets to the top when navigating to skill detail from a scrolled page", async ({ page }) => {
    await forceEnglishLocale(page);

    await page.route("**/api/v1/auth/me", async (route) => {
      await fulfillJSON(route, 200, { user: null });
    });

    await page.goto("/");
    await page.evaluate(() => {
      const spacer = document.createElement("div");
      spacer.id = "scroll-test-spacer";
      spacer.style.width = "1px";
      spacer.style.height = "4000px";
      document.body.appendChild(spacer);
      window.scrollTo(0, 3200);
    });

    const previousScrollY = await page.evaluate(() => window.scrollY);
    expect(previousScrollY).toBeGreaterThan(0);

    await page.evaluate(() => {
      window.history.pushState({}, "", "/skills/8?skill_detail_mode=prototype");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    await expect(page.locator(".skill-detail-title")).toBeVisible();
    await expect.poll(async () => page.evaluate(() => window.scrollY)).toBe(0);
  });
});
