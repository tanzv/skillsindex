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

test("keeps public marketplace topbar gutters aligned across landing, category, and skill pages", async ({ page }) => {
  async function resolveTopbarBox(pathname: string) {
    await page.goto(pathname);
    await expect(page.locator(".marketplace-topbar")).toBeVisible();

    return page.locator(".marketplace-topbar").evaluate((node) => {
      const rect = node.getBoundingClientRect();
      return {
        left: Math.round(rect.left),
        right: Math.round(window.innerWidth - rect.right),
        width: Math.round(rect.width)
      };
    });
  }

  const landingBox = await resolveTopbarBox("/");
  const categoriesBox = await resolveTopbarBox("/categories");
  const skillBox = await resolveTopbarBox("/skills/13");

  expect(categoriesBox.left).toBe(landingBox.left);
  expect(categoriesBox.right).toBe(landingBox.right);
  expect(categoriesBox.width).toBe(landingBox.width);

  expect(skillBox.left).toBe(landingBox.left);
  expect(skillBox.right).toBe(landingBox.right);
  expect(skillBox.width).toBe(landingBox.width);
});
