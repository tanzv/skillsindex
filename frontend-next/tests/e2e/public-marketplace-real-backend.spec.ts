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

test("navigates grouped category detail pagination against the real backend", async ({
  page,
}) => {
  await page.goto("/categories/programming-development?page=1&page_size=1");

  const pagination = page.getByTestId("marketplace-pagination");
  const nextLink = pagination.getByRole("link").last();

  await expect(page.getByTestId("category-results-layout")).toBeVisible();
  await expect(page.getByTestId("category-results-main")).toBeVisible();
  await expect(page.getByTestId("category-results-support")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Request failed" })).toHaveCount(
    0,
  );
  await expect(pagination).toBeVisible();
  await expect(nextLink).toHaveAttribute(
    "href",
    /\/categories\/programming-development\?page_size=1&page=2$|\/categories\/programming-development\?page=2&page_size=1$/,
  );

  await nextLink.click();

  await expect(page).toHaveURL(
    /\/categories\/programming-development\?.*page=2.*page_size=1|\/categories\/programming-development\?.*page_size=1.*page=2/,
  );
  await expect(
    page.locator(".marketplace-search-utility-pill").filter({ hasText: /2 \/ \d+/ }).first(),
  ).toBeVisible();
});
