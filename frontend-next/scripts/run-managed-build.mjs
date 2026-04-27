import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { shouldRecoverFromNextBuildFailure } from "./run-e2e-build.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultProjectDirectory = path.resolve(scriptDirectory, "..");
const defaultNextBinary = path.join(defaultProjectDirectory, "node_modules", ".bin", "next");

function collectProcessOutput(stream, onChunk) {
  stream?.on("data", (chunk) => {
    onChunk(String(chunk ?? ""));
  });
}

function waitForExit(childProcess) {
  return new Promise((resolve, reject) => {
    childProcess.once("error", reject);
    childProcess.once("exit", (code) => {
      resolve(typeof code === "number" ? code : 1);
    });
  });
}

function resolveNextOutputDirectory(projectDirectory) {
  return path.join(projectDirectory, ".next");
}

export async function runManagedBuild({
  projectDirectory = defaultProjectDirectory,
  nextBinary = defaultNextBinary,
  spawnImpl = spawn,
  cleanOutput = true,
  env = process.env,
  stdout = process.stdout,
  stderr = process.stderr
} = {}) {
  if (cleanOutput) {
    await rm(resolveNextOutputDirectory(projectDirectory), { recursive: true, force: true });
  }

  let combinedOutput = "";
  const childProcess = spawnImpl(nextBinary, ["build", "--webpack"], {
    cwd: projectDirectory,
    env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  collectProcessOutput(childProcess.stdout, (chunk) => {
    combinedOutput += chunk;
    stdout?.write(chunk);
  });
  collectProcessOutput(childProcess.stderr, (chunk) => {
    combinedOutput += chunk;
    stderr?.write(chunk);
  });

  const exitCode = await waitForExit(childProcess);
  const shouldRecover = await shouldRecoverFromNextBuildFailure({
    exitCode,
    output: combinedOutput,
    projectDirectory
  });

  if (shouldRecover) {
    stderr?.write(
      "[managed-build] Recovered from a known proxy trace artifact build failure and will keep the generated build output.\n"
    );
    return 0;
  }

  return exitCode;
}

export async function main() {
  try {
    const exitCode = await runManagedBuild();
    process.exit(exitCode);
  } catch (error) {
    const message = error instanceof Error ? error.stack || error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(1);
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";

if (invokedPath === fileURLToPath(import.meta.url)) {
  await main();
}
