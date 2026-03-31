import { mkdir, writeFile } from "node:fs/promises";
import { chromium, devices } from "@playwright/test";

const baseUrl = "http://127.0.0.1:3400";
const backendBaseUrl = "http://127.0.0.1:3301";
const outputDir = "/tmp/skillsindex-ui-audit-20260324";
const credentials = { username: "admin", password: "Admin123456!" };

async function login(page) {
  await page.request.post(`${backendBaseUrl}/__mock/reset`);
  const response = await page.request.post(`${baseUrl}/api/bff/auth/login`, {
    data: credentials,
    timeout: 15000
  });

  if (!response.ok()) {
    throw new Error(`login failed: ${response.status()} ${await response.text()}`);
  }

  await page.goto(`${baseUrl}/workspace`, { waitUntil: "domcontentloaded" });
  await page.waitForURL(/\/workspace(?:$|\?)/, { timeout: 30000 });
  await page.waitForLoadState("networkidle");
}

async function auditScenario(name, options = {}) {
  const browser = await chromium.launch({ headless: true });
  const consoleEntries = [];
  const pageErrors = [];
  const context = await browser.newContext(options.contextOptions || {});
  const page = await context.newPage();

  page.on("console", (message) => {
    consoleEntries.push({ type: message.type(), text: message.text() });
  });
  page.on("pageerror", (error) => {
    pageErrors.push(String(error));
  });

  const result = { name, consoleEntries, pageErrors };

  try {
    await login(page);

    const trigger = page.getByTestId("workspace-topbar-account-trigger");
    const menu = page.getByTestId("workspace-topbar-account-menu");
    await trigger.click();
    await menu.waitFor({ state: "visible", timeout: 10000 });

    if (options.switchToZh) {
      await page.getByTestId("workspace-topbar-locale-zh").click();
      await menu.waitFor({ state: "visible", timeout: 10000 });
    }

    const profileButton = options.switchToZh
      ? menu.getByRole("button", { name: /资料/i })
      : menu.getByRole("button", { name: /Profile/i });
    await profileButton.click();

    const dialogName = options.switchToZh ? "资料" : "Profile";
    const dialog = page.getByRole("dialog", { name: dialogName });
    await dialog.waitFor({ state: "visible", timeout: 10000 });

    result.url = page.url();
    result.triggerTitle = await trigger.getAttribute("title");
    result.menuAriaHidden = await menu.getAttribute("aria-hidden");
    result.dialogVisible = await dialog.isVisible();
    result.dialogHeading = await dialog.getByRole("heading", { name: dialogName }).textContent();
    result.runtimeFaultVisible = await page.getByText(/Runtime Fault/i).count();

    await page.screenshot({ path: `${outputDir}/${name}-workspace.png`, fullPage: true });
    await dialog.screenshot({ path: `${outputDir}/${name}-dialog.png` });
  } catch (error) {
    result.error = String(error);
    await page.screenshot({ path: `${outputDir}/${name}-error.png`, fullPage: true }).catch(() => undefined);
  } finally {
    await context.close();
    await browser.close();
  }

  return result;
}

await mkdir(outputDir, { recursive: true });
const desktopEn = await auditScenario("desktop-en", { contextOptions: { viewport: { width: 1440, height: 1100 } } });
const desktopZh = await auditScenario("desktop-zh", { contextOptions: { viewport: { width: 1440, height: 1100 } }, switchToZh: true });
const mobileZh = await auditScenario("mobile-zh", { contextOptions: { ...devices["iPhone 13"] }, switchToZh: true });
await writeFile(`${outputDir}/audit.json`, JSON.stringify({ desktopEn, desktopZh, mobileZh }, null, 2), "utf8");
console.log(JSON.stringify({ outputDir, desktopEn, desktopZh, mobileZh }, null, 2));
