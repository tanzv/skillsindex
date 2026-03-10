import { access, constants } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import {
  listVisualScenarioKeys,
  resolveVisualBaselinePath,
  resolveVisualScenario
} from "./visual-regression/scenarios.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDirectExecution = process.argv[1] ? path.resolve(process.argv[1]) === __filename : false;
const frontendRoot = path.resolve(__dirname, "..");

export async function collectMissingVisualBaselines(rootDirectory, scenarioKeys, overrideRelativePath) {
  const missingEntries = [];

  for (const scenarioKey of scenarioKeys) {
    const { scenario } = resolveVisualScenario(scenarioKey);
    const baselinePath = resolveVisualBaselinePath(rootDirectory, scenario, overrideRelativePath);

    try {
      await access(baselinePath, constants.F_OK);
    } catch {
      missingEntries.push({
        scenarioKey,
        baselinePath
      });
    }
  }

  return missingEntries;
}

async function main() {
  const requestedScenario = process.env.VISUAL_SCENARIO?.trim();
  const scenarioKeys = requestedScenario ? [resolveVisualScenario(requestedScenario).scenarioKey] : listVisualScenarioKeys();
  const missingEntries = await collectMissingVisualBaselines(
    frontendRoot,
    scenarioKeys,
    process.env.VISUAL_BASELINE_PATH
  );

  if (missingEntries.length === 0) {
    console.log(`[visual-baselines] PASS ${scenarioKeys.join(", ")}`);
    return;
  }

  console.error(`[visual-baselines] FAIL ${scenarioKeys.join(", ")}`);
  for (const entry of missingEntries) {
    console.error(`- missing baseline for ${entry.scenarioKey}: ${entry.baselinePath}`);
  }
  process.exitCode = 1;
}

if (isDirectExecution) {
  main().catch((error) => {
  console.error("[visual-baselines] ERROR", error);
  process.exitCode = 1;
  });
}
