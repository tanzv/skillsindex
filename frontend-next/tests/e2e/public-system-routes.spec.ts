import { expect, test } from "@playwright/test";

test("renders explicit and implicit system status pages", async ({ page }) => {
  await page.goto("/states/503");

  await expect(page.getByTestId("system-status-page")).toBeVisible();
  await expect(page.getByTestId("system-status-code")).toHaveText("503");
  await expect(page.getByRole("heading", { name: "Service Unavailable" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();

  await page.goto("/states/server-error");

  await expect(page.getByTestId("system-status-page")).toBeVisible();
  await expect(page.getByTestId("system-status-code")).toHaveText("500");
  await expect(page.getByRole("heading", { name: "Unexpected Application Error" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Try Again" })).toBeVisible();

  await page.goto("/missing-system-route");

  await expect(page.getByTestId("system-status-page")).toBeVisible();
  await expect(page.getByTestId("system-status-code")).toHaveText("404");
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Marketplace" })).toBeVisible();
});

test("keeps private diagnostic runtime routes out of the public router", async ({ page }) => {
  await page.goto("/__diagnostics/runtime-error");

  await expect(page.getByTestId("system-status-page")).toBeVisible();
  await expect(page.getByTestId("system-status-code")).toHaveText("404");
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Marketplace" })).toBeVisible();
});

test("keeps private diagnostic slow routes out of the public router", async ({ page }) => {
  await page.goto("/__diagnostics/slow");

  await expect(page.getByTestId("system-status-page")).toBeVisible();
  await expect(page.getByTestId("system-status-code")).toHaveText("404");
  await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
});

test("renders the state compatibility route", async ({ page }) => {
  await page.goto("/states/error");

  await expect(page.getByRole("heading", { name: "Error State" })).toBeVisible();
});
