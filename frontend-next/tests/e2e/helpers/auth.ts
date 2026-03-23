import { expect, type APIRequestContext, type Page } from "@playwright/test";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Admin123456!";
const LOGIN_RETRY_COUNT = 3;
const NAVIGATION_RETRY_COUNT = 3;
type ProtectedRouteExpectation = string | RegExp;

async function resetMockBackend(page: Page) {
  const backendPort = process.env.PLAYWRIGHT_BACKEND_PORT;
  if (!backendPort) {
    return;
  }

  const response = await page.request.post(`http://127.0.0.1:${backendPort}/__mock/reset`);
  expect(response.ok()).toBe(true);
}

async function delay(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function postLoginRequest(request: APIRequestContext) {
  return request.post("/api/bff/auth/login", {
    data: {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD
    },
    timeout: 15_000
  });
}

function formatExpectedProtectedPath(expectedPath: ProtectedRouteExpectation) {
  return typeof expectedPath === "string" ? `**${expectedPath}` : expectedPath;
}

async function readResponseBody(response: Awaited<ReturnType<typeof postLoginRequest>>) {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

async function establishSession(page: Page) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < LOGIN_RETRY_COUNT; attempt += 1) {
    try {
      const response = await postLoginRequest(page.request);
      if (!response.ok()) {
        const responseBody = await readResponseBody(response);
        throw new Error(
          `Failed to establish an authenticated session. status=${String(response.status())} body=${responseBody || "<empty>"}`
        );
      }
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      await delay(300 * (attempt + 1));
    }
  }

  throw lastError || new Error("Failed to establish an authenticated session.");
}

export async function gotoProtectedRoute(
  page: Page,
  path: string,
  expectedPath: ProtectedRouteExpectation = path
) {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < NAVIGATION_RETRY_COUNT; attempt += 1) {
    try {
      await page.goto(path, {
        waitUntil: "domcontentloaded",
        timeout: 15_000
      });
      await page.waitForURL(formatExpectedProtectedPath(expectedPath), { timeout: 15_000 });
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      await delay(300 * (attempt + 1));
    }
  }

  throw lastError || new Error(`Failed to navigate to ${path}.`);
}

export async function loginAsAdmin(
  page: Page,
  redirect = "/admin/overview",
  expectedPath: ProtectedRouteExpectation = redirect
) {
  await resetMockBackend(page);
  await establishSession(page);
  await gotoProtectedRoute(page, redirect, expectedPath);
}
