import { expect, test } from "@playwright/test";

const requiresExternalBackend =
  String(process.env.PLAYWRIGHT_USE_EXTERNAL_BACKEND || "").trim() === "1" ||
  String(process.env.PLAYWRIGHT_SKIP_MOCK_BACKEND || "").trim() === "1";

test.describe("public marketplace real backend", () => {
  test.skip(!requiresExternalBackend, "This suite requires an external backend.");

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

test("renders the real backend skill detail resources and related skill navigation", async ({
  page,
}) => {
  await page.goto("/skills/13");

  await expect(page.getByTestId("skill-detail-page")).toBeVisible();
  await expect(
    page.getByRole("heading", { level: 1, name: "Release Readiness Checklist" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Request failed" })).toHaveCount(0);

  await page.getByRole("tab", { name: "Resources" }).click();

  const sourceAnalysis = page.getByTestId("skill-detail-source-analysis");
  await expect(sourceAnalysis).toBeVisible();
  await expect(sourceAnalysis).toContainText("Source Analysis");
  await expect(sourceAnalysis).toContainText("Entry File");
  await expect(sourceAnalysis).toContainText("Mechanism");
  await expect(sourceAnalysis).toContainText("SKILL.md");
  await expect(sourceAnalysis).toContainText("fallback");

  await page.getByRole("tab", { name: "Related Skills" }).click();
  await expect(page.getByRole("link", { name: "Recovery Drill Planner" }).first()).toBeVisible();

  await page.getByRole("link", { name: "Recovery Drill Planner" }).first().click();
  await expect(page).toHaveURL(/\/skills\/15$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Recovery Drill Planner" }),
  ).toBeVisible();
});
});
