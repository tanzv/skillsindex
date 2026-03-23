import { expect, test } from "@playwright/test";

test("renders the public results route without falling into an error state", async ({
  page,
}) => {
  await page.goto("/results?q=Release");

  await expect(page).toHaveURL(/\/results\?q=Release$/);
  await expect(page.getByTestId("search-shell-breadcrumb")).toBeVisible();
  await expect(page.getByTestId("results-layout")).toBeVisible();
  await expect(page.getByTestId("results-main")).toBeVisible();
  await expect(page.getByTestId("results-support")).toBeVisible();
  await expect(
    page.locator(
      "[data-testid='results-main'] .marketplace-section-header h2",
    ).first(),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Request failed" })).toHaveCount(
    0,
  );
});
