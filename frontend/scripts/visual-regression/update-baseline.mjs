import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, "../..");

const host = process.env.VISUAL_HOST ?? "127.0.0.1";
const port = Number.parseInt(process.env.VISUAL_PORT ?? "4217", 10);
const baseUrl = process.env.VISUAL_BASE_URL ?? `http://${host}:${port}`;
const scenarioKey = (process.env.VISUAL_SCENARIO ?? "home").trim().toLowerCase();

const scenarios = {
  home: {
    routePath: "/",
    waitSelector: ".marketplace-home",
    outputRelativePath: "prototype-baselines/marketplace_home.png",
    viewport: { width: 512, height: 342 },
    setupRoutes: async (page) => {
      await page.route("**/api/v1/auth/me", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: null
          })
        });
      });

      await page.route("**/api/v1/public/marketplace**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            items: []
          })
        });
      });
    }
  },
  "skill-detail": {
    routePath: "/skills/1049",
    waitSelector: "[data-testid='skill-detail-page']",
    outputRelativePath: "prototype-baselines/skill_detail.png",
    viewport: { width: 512, height: 342 },
    setupRoutes: async (page) => {
      await page.route("**/api/v1/auth/me", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: null
          })
        });
      });
    }
  },
  "admin-overview": {
    routePath: "/admin/overview",
    waitSelector: "[data-testid='admin-overview-stage']",
    outputRelativePath: "prototype-baselines/admin_dashboard.png",
    viewport: { width: 512, height: 342 },
    setupRoutes: async (page) => {
      await page.route("**/api/v1/auth/me", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: {
              id: 101,
              username: "admin.user",
              display_name: "Admin User",
              role: "admin",
              status: "active"
            }
          })
        });
      });

      await page.route("**/api/v1/admin/overview", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: {
              id: 101,
              username: "admin.user",
              role: "admin"
            },
            counts: {
              total: 24,
              public: 9,
              private: 15,
              syncable: 12,
              org_count: 5,
              account_count: 48
            },
            capabilities: {
              can_manage_users: true,
              can_view_all: true
            }
          })
        });
      });
    }
  }
};

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForServer(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok) {
        return;
      }
    } catch {
      // Ignore connection errors while server is still booting.
    }
    await delay(500);
  }
  throw new Error(`Timed out waiting for server: ${url}`);
}

function resolveScenario() {
  const scenario = scenarios[scenarioKey];
  if (!scenario) {
    const supported = Object.keys(scenarios).join(", ");
    throw new Error(`Unknown VISUAL_SCENARIO: ${scenarioKey}. Supported: ${supported}`);
  }
  return scenario;
}

async function main() {
  const scenario = resolveScenario();
  const outputPath = path.resolve(frontendRoot, scenario.outputRelativePath);

  await mkdir(path.dirname(outputPath), { recursive: true });

  const devServer = spawn("npm", ["run", "dev", "--", "--host", host, "--port", String(port)], {
    cwd: frontendRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      VITE_MARKETPLACE_HOME_MODE: "prototype"
    }
  });

  try {
    await waitForServer(baseUrl, 120_000);
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage({ viewport: scenario.viewport });
      await page.addInitScript(() => {
        window.localStorage.removeItem("skillsindex.locale");
      });

      if (scenario.setupRoutes) {
        await scenario.setupRoutes(page);
      }

      await page.goto(`${baseUrl}${scenario.routePath}`, { waitUntil: "networkidle" });
      await page.waitForSelector(scenario.waitSelector, { state: "visible", timeout: 30_000 });
      await page.waitForTimeout(900);
      const screenshotBuffer = await page.screenshot({ fullPage: false });
      await writeFile(outputPath, screenshotBuffer);
    } finally {
      await browser.close();
    }
  } finally {
    devServer.kill("SIGTERM");
    await delay(500);
  }

  console.log(`[visual-regression] baseline updated: ${outputPath}`);
}

main().catch((error) => {
  console.error("[visual-regression] ERROR", error);
  process.exitCode = 1;
});
