import { expect, type Page } from "@playwright/test";

async function resetMockBackend(page: Page) {
  const backendPort = process.env.PLAYWRIGHT_BACKEND_PORT;
  if (!backendPort) {
    return;
  }

  const response = await page.request.post(`http://127.0.0.1:${backendPort}/__mock/reset`);
  expect(response.ok()).toBe(true);
}

export async function loginAsAdmin(page: Page, redirect = "/admin/overview") {
  await resetMockBackend(page);
  await page.goto(`/login?redirect=${encodeURIComponent(redirect)}`);
  await page.waitForURL(/\/login(\?|$)/);
  await expect(page.getByRole("heading", { name: "Account Sign In" })).toBeVisible();
  const usernameInput = page.getByTestId("login-username-input");
  const passwordInput = page.getByTestId("login-password-input");
  const submitButton = page.getByRole("button", { name: "Sign In" });

  await expect(usernameInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await usernameInput.fill("admin");
  await passwordInput.fill("Admin123456!");
  await expect(usernameInput).toHaveValue("admin");
  await expect(passwordInput).toHaveValue("Admin123456!");
  await expect(submitButton).toBeEnabled();
  await submitButton.click();
  await page.waitForURL(`**${redirect}`);
}
