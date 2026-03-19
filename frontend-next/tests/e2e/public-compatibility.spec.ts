import { expect, test } from "@playwright/test";

test("renders the about compatibility route", async ({ page }) => {
  await page.goto("/about");

  await expect(page.getByTestId("public-program-about")).toBeVisible();
  await expect(page.getByRole("heading", { name: "About SkillsIndex" })).toBeVisible();
  await expect(page.getByText("Current route: /about")).toHaveCount(0);
  await expect(page.getByTestId("public-program-about-skills")).toBeVisible();
});

test("redirects the legacy compare compatibility route to rankings", async ({ page }) => {
  await page.goto("/compare?left=101&right=102");

  await expect(page).toHaveURL(/\/rankings\?left=101&right=102&sort=stars|\/rankings\?left=101&right=102/);
  await expect(page.getByRole("heading", { name: "Download Ranking" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sort by Stars" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Compare from Rankings" })).toBeVisible();
  const compareSelectors = page.getByRole("combobox");
  await expect(compareSelectors).toHaveCount(2);
});

test("redirects the legacy search compatibility route to results", async ({ page }) => {
  await page.goto("/search?q=release");

  await expect(page).toHaveURL(/\/results\?q=release/);
  await expect(page.locator("main").getByRole("heading", { name: "Search Results" }).first()).toBeVisible();
});

test("keeps prefixed public header navigation stable after proxy rewrites", async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && message.text().includes("hydrated")) {
      hydrationErrors.push(message.text());
    }
  });

  await page.goto("/light/categories");

  const topbar = page.locator("header.marketplace-topbar-shell");
  const brandLink = topbar.locator(".marketplace-brand");
  const searchLink = topbar.locator(".marketplace-topbar-button.is-subtle");

  await expect(page).toHaveURL(/\/light\/categories$/);
  await brandLink.click();
  await expect(page).toHaveURL(/\/light$/);

  await page.goto("/light/categories");
  await searchLink.click();
  await expect(page).toHaveURL(/\/light\/results$/);
  expect(hydrationErrors).toEqual([]);
});

test("renders the docs compatibility route", async ({ page }) => {
  await page.goto("/docs");

  const mainContent = page.getByRole("main");
  await expect(page.getByTestId("public-docs-stage")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Migration Overview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Quick Links" })).toBeVisible();
  await expect(mainContent.getByRole("link", { name: "Marketplace" })).toBeVisible();
  await expect(mainContent.getByRole("link", { name: "Workspace" })).toBeVisible();
  await expect(mainContent.getByRole("link", { name: "Admin" })).toBeVisible();
});

test("keeps the docs compatibility route visible when semantic tags are present in the URL", async ({ page }) => {
  await page.goto("/docs?tags=ops");

  await expect(page.getByTestId("public-docs-stage")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Migration Overview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Quick Links" })).toBeVisible();
});

test("renders the governance compatibility route", async ({ page }) => {
  await page.goto("/governance");

  await expect(page.getByTestId("public-program-governance")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Governance" })).toBeVisible();
  await expect(page.getByText("Current route: /governance")).toHaveCount(0);
  await expect(page.getByRole("main").getByRole("link", { name: "Categories" })).toBeVisible();
});

test("renders the rollout compatibility route", async ({ page }) => {
  await page.goto("/rollout");

  await expect(page.getByTestId("public-program-rollout")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Rollout Overview" })).toBeVisible();
  await expect(page.getByText("Current route: /rollout")).toHaveCount(0);
  await expect(page.getByRole("main").getByRole("link", { name: "Workspace" })).toBeVisible();
});

test("renders the timeline compatibility route", async ({ page }) => {
  await page.goto("/timeline");

  await expect(page.getByTestId("public-program-timeline")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
  await expect(page.getByText("Current route: /timeline")).toHaveCount(0);
  await expect(page.getByTestId("public-program-timeline-skills")).toBeVisible();
});

test("redirects the dashboard compatibility route to login when the viewer is anonymous", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login\?redirect=%2Fdashboard/);
  await expect(page.getByRole("heading", { name: "Account Sign In" })).toBeVisible();
});
