import { expect, test } from "@playwright/test";

test("navigates from the landing topbar to marketplace categories and rankings", async ({ page }) => {
  await page.goto("/");

  await page.getByTestId("landing-topbar-nav-categories").click();
  await expect(page).toHaveURL(/\/categories$/);
  await expect(page.getByTestId("categories-page-title")).toBeVisible();

  await page.goto("/");

  await page.getByTestId("landing-topbar-nav-rankings").click();
  await expect(page).toHaveURL(/\/rankings$/);
  await expect(page.getByRole("heading", { name: "Download Ranking" })).toBeVisible();
});

test("uses client-side navigation when opening marketplace categories from the landing topbar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("landing-topbar-nav-categories")).toBeVisible();

  const navigationRequests: string[] = [];
  page.on("request", (request) => {
    if (request.resourceType() !== "document") {
      return;
    }

    navigationRequests.push(new URL(request.url()).pathname);
  });

  const navigationEntryCountBefore = await page.evaluate(() => performance.getEntriesByType("navigation").length);

  await page.getByTestId("landing-topbar-nav-categories").click();
  await expect(page).toHaveURL(/\/categories$/);
  await expect(page.getByTestId("categories-page-title")).toBeVisible();
  await page.waitForLoadState("networkidle");

  const navigationEntryCountAfter = await page.evaluate(() => performance.getEntriesByType("navigation").length);

  expect(navigationRequests).not.toContain("/categories");
  expect(navigationEntryCountAfter).toBe(navigationEntryCountBefore);
});

test("keeps representative marketplace topbars aligned with shell content without horizontal overflow", async ({ page }) => {
  const representativeShellRoutes = [
    "/",
    "/categories",
    "/results?q=nextjs&tags=react",
    "/rankings",
    "/skills/101"
  ];

  async function resolveShellMetrics(pathname: string) {
    await page.goto(pathname, { waitUntil: "domcontentloaded" });
    await expect(page.locator(".marketplace-topbar")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator(".marketplace-shell-content")).toBeVisible({ timeout: 15_000 });

    return page.evaluate(() => {
      const topbar = document.querySelector(".marketplace-topbar");
      const below = document.querySelector(".marketplace-topbar-below");
      const content = document.querySelector(".marketplace-shell-content");

      if (!topbar || !content) {
        return null;
      }

      const topbarRect = topbar.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const belowRect = below?.getBoundingClientRect() || null;

      return {
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        topbar: {
          left: Math.round(topbarRect.left),
          right: Math.round(window.innerWidth - topbarRect.right),
          width: Math.round(topbarRect.width),
          center: Math.round(topbarRect.left + topbarRect.width / 2)
        },
        below: belowRect
          ? {
              left: Math.round(belowRect.left),
              right: Math.round(window.innerWidth - belowRect.right),
              width: Math.round(belowRect.width),
              center: Math.round(belowRect.left + belowRect.width / 2)
            }
          : null,
        content: {
          left: Math.round(contentRect.left),
          right: Math.round(window.innerWidth - contentRect.right),
          width: Math.round(contentRect.width),
          center: Math.round(contentRect.left + contentRect.width / 2)
        }
      };
    });
  }

  const viewportWidth = 1600;
  await page.setViewportSize({ width: viewportWidth, height: 1200 });

  for (const pathname of representativeShellRoutes) {
    const routeMetrics = await resolveShellMetrics(pathname);

    expect(routeMetrics).not.toBeNull();
    if (!routeMetrics) {
      continue;
    }

    expect(routeMetrics.scrollWidth).toBeLessThanOrEqual(routeMetrics.viewportWidth);
    expect(Math.abs(routeMetrics.topbar.left - routeMetrics.content.left)).toBeLessThanOrEqual(2);
    expect(Math.abs(routeMetrics.topbar.right - routeMetrics.content.right)).toBeLessThanOrEqual(2);
    expect(Math.abs(routeMetrics.topbar.center - routeMetrics.content.center)).toBeLessThanOrEqual(1);
    expect(routeMetrics.topbar.left).toBeLessThanOrEqual(64);
    expect(routeMetrics.topbar.right).toBeLessThanOrEqual(64);

    if (routeMetrics.below) {
      expect(Math.abs(routeMetrics.below.left - routeMetrics.content.left)).toBeLessThanOrEqual(2);
      expect(Math.abs(routeMetrics.below.right - routeMetrics.content.right)).toBeLessThanOrEqual(2);
      expect(Math.abs(routeMetrics.below.center - routeMetrics.content.center)).toBeLessThanOrEqual(1);
    }
  }
});

test("exposes a shared marketplace favicon on public routes", async ({ page }) => {
  await page.goto("/categories");

  const iconHrefs = await page.locator("head link[rel='icon']").evaluateAll((links) =>
    links.map((link) => link.getAttribute("href") || "")
  );

  expect(iconHrefs.some((href) => href.includes("skillsindex-tab"))).toBe(true);
  expect(iconHrefs.some((href) => href.includes("icon.svg"))).toBe(true);
});
