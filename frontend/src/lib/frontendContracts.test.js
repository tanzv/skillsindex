import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { findUnexpectedPageRootFiles } from "../../scripts/check-pages-structure.mjs";
import { collectMissingVisualBaselines } from "../../scripts/check-visual-baselines.mjs";
import {
  listVisualScenarioKeys,
  resolveVisualScenario,
  resolveVisualBaselinePath
} from "../../scripts/visual-regression/scenarios.mjs";

const tempDirectories = [];

async function createTempDir() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "skillsindex-frontend-contracts-"));
  tempDirectories.push(directory);
  return directory;
}

afterEach(async () => {
  while (tempDirectories.length > 0) {
    const directory = tempDirectories.pop();
    if (!directory) {
      continue;
    }
    await rm(directory, { recursive: true, force: true });
  }
});

describe("frontend page structure contract", () => {
  it("accepts a pages root that contains folders only", async () => {
    const rootDirectory = await createTempDir();
    const pagesRoot = path.join(rootDirectory, "src/pages");
    await mkdir(path.join(pagesRoot, "marketplaceHome"), { recursive: true });
    await mkdir(path.join(pagesRoot, "workspace"), { recursive: true });

    await expect(findUnexpectedPageRootFiles(pagesRoot)).resolves.toEqual([]);
  });

  it("reports direct files in the pages root in sorted order", async () => {
    const rootDirectory = await createTempDir();
    const pagesRoot = path.join(rootDirectory, "src/pages");
    await mkdir(path.join(pagesRoot, "adminOverview"), { recursive: true });
    await writeFile(path.join(pagesRoot, "B.tsx"), "export {};\n", "utf8");
    await writeFile(path.join(pagesRoot, "A.ts"), "export {};\n", "utf8");

    await expect(findUnexpectedPageRootFiles(pagesRoot)).resolves.toEqual(["A.ts", "B.tsx"]);
  });
});

describe("visual baseline contract", () => {
  it("resolves known scenarios from the shared visual scenario catalog", () => {
    expect(listVisualScenarioKeys()).toContain("home");
    expect(listVisualScenarioKeys()).toContain("workspace-activity");
    expect(resolveVisualScenario("LOGIN")).toMatchObject({ scenarioKey: "login" });
  });

  it("reports no missing baselines when the requested files exist", async () => {
    const rootDirectory = await createTempDir();
    const scenarioKeys = ["home", "login"];

    for (const scenarioKey of scenarioKeys) {
      const { scenario } = resolveVisualScenario(scenarioKey);
      const baselinePath = resolveVisualBaselinePath(rootDirectory, scenario, undefined);
      await mkdir(path.dirname(baselinePath), { recursive: true });
      await writeFile(baselinePath, "placeholder", "utf8");
    }

    await expect(collectMissingVisualBaselines(rootDirectory, scenarioKeys)).resolves.toEqual([]);
  });

  it("reports each requested scenario whose baseline file is missing", async () => {
    const rootDirectory = await createTempDir();
    const scenarioKeys = ["home", "admin-overview"];

    const { scenario } = resolveVisualScenario("home");
    const homeBaselinePath = resolveVisualBaselinePath(rootDirectory, scenario, undefined);
    await mkdir(path.dirname(homeBaselinePath), { recursive: true });
    await writeFile(homeBaselinePath, "placeholder", "utf8");

    await expect(collectMissingVisualBaselines(rootDirectory, scenarioKeys)).resolves.toEqual([
      {
        scenarioKey: "admin-overview",
        baselinePath: path.resolve(rootDirectory, "prototype-baselines/admin_dashboard.png")
      }
    ]);
  });
});
