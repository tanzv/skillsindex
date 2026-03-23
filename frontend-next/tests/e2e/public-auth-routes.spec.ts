import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./helpers/auth";

test("renders the login route with the prototype-aligned auth layout", async ({ page }) => {
  await page.goto("/login?redirect=%2Fadmin%2Foverview");

  await expect(page.getByTestId("login-page")).toBeVisible();
  await expect(page.getByTestId("login-topbar")).toBeVisible();
  await expect(page.getByTestId("login-info-card")).toBeVisible();
  await expect(page.getByTestId("login-info-card")).toContainText("Welcome Back");
  await expect(page.getByTestId("login-info-card")).toContainText("Password Sign-In");
  await expect(page.getByTestId("login-info-card")).toContainText("Controlled by Admin");
  await expect(page.getByTestId("login-info-card")).toContainText("/admin/overview");
  await expect(page.getByTestId("login-info-card-list")).toBeVisible();
  await expect(page.getByTestId("login-info-card-item-credentials")).toBeVisible();
  await expect(page.getByTestId("login-info-card-item-providers")).toBeVisible();
  await expect(page.getByTestId("login-info-card-item-redirect")).toBeVisible();
  await expect(page.getByTestId("login-form-card")).toBeVisible();
  await expect(page.getByTestId("login-form-brand")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Account Sign In" })).toBeVisible();
  await expect(page.getByTestId("login-provider-list")).toBeVisible();
  await expect(page.getByTestId("login-provider-dingtalk")).toHaveAttribute(
    "href",
    "/auth/dingtalk/start?redirect=%2Fadmin%2Foverview"
  );
  await expect(page.getByTestId("login-provider-feishu")).toHaveAttribute(
    "href",
    "/auth/sso/start/feishu?redirect=%2Fadmin%2Foverview"
  );
  await expect(page.getByTestId("login-username-input")).toBeVisible();
  await expect(page.getByTestId("login-password-input")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();

  await page.getByTestId("login-locale-zh").click();
  await expect(page.getByRole("heading", { name: "账户登录" })).toBeVisible();
  await expect(page.getByRole("button", { name: "登录" })).toBeVisible();
  await expect(page.getByTestId("login-locale-zh")).toHaveAttribute("aria-pressed", "true");
});

test("renders localized login errors after switching the login page to Chinese", async ({ page }) => {
  await page.goto("/login");

  await page.getByTestId("login-locale-zh").click();
  await expect(page.getByRole("heading", { name: "账户登录" })).toBeVisible();
  await page.getByTestId("login-username-input").fill("wrong-user");
  await page.getByTestId("login-password-input").fill("wrong-password");
  const submitButton = page.getByRole("button", { name: "登录" });
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  await expect(page.getByText("用户名或密码错误。")).toBeVisible();
});

test("redirects authenticated viewers away from the login route", async ({ page }) => {
  await loginAsAdmin(page, "/workspace");

  await page.goto("/login");

  await expect(page).toHaveURL(/\/workspace$/);
  await expect(page.getByTestId("workspace-shell")).toBeVisible();
});

test("carries the light marketplace theme into the protected workspace shell", async ({ page }) => {
  await page.goto("/light");
  await expect(page.locator(".marketplace-shell")).toHaveClass(/is-light-theme/);
  await page.evaluate(() => {
    window.localStorage.setItem("skillsindex.theme", "light");
    window.localStorage.setItem("skillsindex.protected.theme", "light");
  });

  await loginAsAdmin(page, "/workspace");

  await expect(page.getByTestId("workspace-shell")).toHaveAttribute("data-protected-theme", "light");
});

test("redirects protected routes to login when the viewer is anonymous", async ({ page }) => {
  await page.goto("/admin/access");

  await expect(page).toHaveURL(/\/login\?redirect=%2Fadmin%2Faccess/);
});

test("redirects workspace routes to login when the viewer is anonymous", async ({ page }) => {
  await page.goto("/workspace/queue");

  await expect(page).toHaveURL(/\/login\?redirect=%2Fworkspace%2Fqueue/);
});

test("redirects account routes to login when the viewer is anonymous", async ({ page }) => {
  await page.goto("/account/profile");

  await expect(page).toHaveURL(/\/login\?redirect=%2Faccount%2Fprofile/);
});

test("renders workspace actions instead of sign-in actions for authenticated viewers on public skill pages", async ({ page }) => {
  await loginAsAdmin(page, "/workspace");

  await page.goto("/skills/101");

  await expect(page.locator('a[href="/workspace"]').first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign In" })).toHaveCount(0);
});

test("returns authenticated viewers to the current public skill page after signing in", async ({ page }) => {
  await page.goto("/skills/101");

  await page.getByRole("link", { name: "Sign In" }).first().click();
  await expect(page).toHaveURL(/\/login\?redirect=%2Fskills%2F101/);

  await page.getByTestId("login-username-input").fill("admin");
  await page.getByTestId("login-password-input").fill("Admin123456!");
  const submitButton = page.locator('form button[type="submit"]');
  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  await expect(page).toHaveURL(/\/skills\/101$/);
  await expect(page.locator('a[href="/workspace"]').first()).toBeVisible();
});
