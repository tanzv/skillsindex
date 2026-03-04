import { access, constants, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { buildComparisonSummary } from "./utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendRoot = path.resolve(__dirname, "../..");

const outputDirectory = path.resolve(frontendRoot, "test-results/visual");
const threshold = Number.parseFloat(process.env.VISUAL_MISMATCH_THRESHOLD ?? "0.01");
const host = process.env.VISUAL_HOST ?? "127.0.0.1";
const port = Number.parseInt(process.env.VISUAL_PORT ?? "4217", 10);
const baseUrl = process.env.VISUAL_BASE_URL ?? `http://${host}:${port}`;
const scenarioKey = (process.env.VISUAL_SCENARIO ?? "home").trim().toLowerCase();

const scenarios = {
  home: {
    routePath: "/",
    waitSelector: ".marketplace-home",
    baselineRelativePath: "prototype-baselines/marketplace_home.png",
    outputPrefix: "home",
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
  login: {
    routePath: "/login",
    waitSelector: ".auth-shell.auth-shell-prototype",
    baselineRelativePath: "public/prototypes/previews/login_page_prototype.png",
    outputPrefix: "login",
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
  "skill-detail": {
    routePath: "/skills/1049",
    waitSelector: "[data-testid='skill-detail-page']",
    baselineRelativePath: "public/prototypes/previews/skill_detail.png",
    outputPrefix: "skill-detail",
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
    baselineRelativePath: "prototype-baselines/admin_dashboard.png",
    outputPrefix: "admin-overview",
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

async function readPNG(filePath) {
  const fileBuffer = await readFile(filePath);
  return PNG.sync.read(fileBuffer);
}

function ensureValidThreshold(value) {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new Error(`VISUAL_MISMATCH_THRESHOLD must be between 0 and 1. Received: ${String(value)}`);
  }
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
  ensureValidThreshold(threshold);
  const scenario = resolveScenario();
  const baselineImagePath = process.env.VISUAL_BASELINE_PATH
    ? path.resolve(frontendRoot, process.env.VISUAL_BASELINE_PATH)
    : path.resolve(frontendRoot, scenario.baselineRelativePath);
  const actualImagePath = path.resolve(outputDirectory, `${scenario.outputPrefix}-actual.png`);
  const diffImagePath = path.resolve(outputDirectory, `${scenario.outputPrefix}-diff.png`);
  const summaryPath = path.resolve(outputDirectory, `${scenario.outputPrefix}-result.json`);

  try {
    await access(baselineImagePath, constants.F_OK);
  } catch {
    console.log("[visual-regression] SKIP");
    console.log(`[visual-regression] baseline image not found: ${baselineImagePath}`);
    return;
  }

  await mkdir(outputDirectory, { recursive: true });
  const baselineImage = await readPNG(baselineImagePath);

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
      const page = await browser.newPage({
        viewport: {
          width: baselineImage.width,
          height: baselineImage.height
        }
      });

      await page.addInitScript(() => {
        window.localStorage.removeItem("skillsindex.locale");
      });

      if (scenario.setupRoutes) {
        await scenario.setupRoutes(page);
      }

      await page.goto(`${baseUrl}${scenario.routePath}`, { waitUntil: "networkidle" });
      await page.waitForSelector(scenario.waitSelector, { state: "visible", timeout: 30_000 });
      await page.waitForTimeout(900);
      await page.screenshot({ path: actualImagePath, fullPage: false });
    } finally {
      await browser.close();
    }
  } finally {
    devServer.kill("SIGTERM");
    await delay(500);
  }

  const actualImage = await readPNG(actualImagePath);
  if (actualImage.width !== baselineImage.width || actualImage.height !== baselineImage.height) {
    throw new Error(
      `Image size mismatch. Baseline: ${baselineImage.width}x${baselineImage.height}, Actual: ${actualImage.width}x${actualImage.height}`
    );
  }

  const diffImage = new PNG({ width: baselineImage.width, height: baselineImage.height });
  const diffPixels = pixelmatch(
    baselineImage.data,
    actualImage.data,
    diffImage.data,
    baselineImage.width,
    baselineImage.height,
    {
      threshold: 0.1,
      includeAA: true
    }
  );

  const summary = buildComparisonSummary({
    diffPixels,
    width: baselineImage.width,
    height: baselineImage.height,
    threshold
  });

  await writeFile(diffImagePath, PNG.sync.write(diffImage));
  await writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  const status = summary.passed ? "PASS" : "FAIL";
  console.log(`[visual-regression] ${status}`);
  console.log(`[visual-regression] scenario=${scenarioKey}`);
  console.log(`[visual-regression] mismatchRatio=${summary.mismatchRatio.toFixed(6)} threshold=${summary.threshold}`);
  console.log(`[visual-regression] diffPixels=${summary.diffPixels}/${summary.totalPixels}`);
  console.log(`[visual-regression] actual=${actualImagePath}`);
  console.log(`[visual-regression] diff=${diffImagePath}`);
  console.log(`[visual-regression] summary=${summaryPath}`);

  if (!summary.passed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("[visual-regression] ERROR", error);
  process.exitCode = 1;
});
