import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import {
  resolveVisualBaselinePath,
  resolveVisualScenario,
  stabilizeVisualCapture
} from "./scenarios.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDirectExecution = process.argv[1] ? path.resolve(process.argv[1]) === __filename : false;
const frontendRoot = path.resolve(__dirname, "../..");

const host = process.env.VISUAL_HOST ?? "127.0.0.1";
const port = Number.parseInt(process.env.VISUAL_PORT ?? "4217", 10);
const baseUrl = process.env.VISUAL_BASE_URL ?? `http://${host}:${port}`;

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

async function main() {
  const { scenario } = resolveVisualScenario();
  const outputPath = resolveVisualBaselinePath(frontendRoot, scenario, process.env.VISUAL_BASELINE_PATH);

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
      await stabilizeVisualCapture(page);
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

if (isDirectExecution) {
  main().catch((error) => {
  console.error("[visual-regression] ERROR", error);
  process.exitCode = 1;
  });
}
