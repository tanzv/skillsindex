import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { startMockBackend } from "./mock-backend.mjs";
import { shouldRecoverFromNextBuildFailure } from "./run-e2e-build.mjs";
import { terminateWorkspaceConflictingProcesses } from "./run-e2e-process-guard.mjs";
import { resolveE2ERuntimeOptions } from "./run-e2e-runtime.mjs";
import { acquireRunE2ELock, releaseRunE2ELock } from "./run-e2e-lock.mjs";

const startupTimeoutMs = 240_000;
const metadataPath = join(process.cwd(), ".next", "e2e-runtime.json");
const nextBinary = join(process.cwd(), "node_modules", ".bin", "next");
const playwrightBinary = join(process.cwd(), "node_modules", ".bin", "playwright");

function readBuildMetadata() {
  if (!existsSync(metadataPath)) {
    return null;
  }

  try {
    const payload = JSON.parse(readFileSync(metadataPath, "utf8"));
    const backendPort = Number(payload?.backendPort);

    if (!Number.isFinite(backendPort) || backendPort <= 0) {
      return null;
    }

    return { backendPort };
  } catch {
    return null;
  }
}

function writeBuildMetadata(metadata) {
  mkdirSync(join(process.cwd(), ".next"), { recursive: true });
  writeFileSync(metadataPath, JSON.stringify(metadata), "utf8");
}

function createTaggedLogger(tag) {
  return (chunk) => {
    const text = String(chunk || "");
    for (const line of text.split(/\r?\n/)) {
      if (line.trim()) {
        process.stdout.write(`[${tag}] ${line}\n`);
      }
    }
  };
}

function spawnProcess(command, args, options = {}) {
  const child = spawn(command, args, {
    cwd: options.cwd || process.cwd(),
    env: options.env || process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  const logStdout = createTaggedLogger(options.tag || command);
  const logStderr = createTaggedLogger(options.tag || command);

  child.stdout?.on("data", (chunk) => {
    if (typeof options.onOutput === "function") {
      options.onOutput(String(chunk || ""));
    }
    logStdout(chunk);
  });
  child.stderr?.on("data", (chunk) => {
    if (typeof options.onOutput === "function") {
      options.onOutput(String(chunk || ""));
    }
    logStderr(chunk);
  });

  return child;
}

async function waitForHealthyResponse(url, predicate, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = "No response received.";

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      const body = await response.text();

      if (predicate(response, body)) {
        return;
      }

      lastError = `Unexpected response ${response.status} from ${url}.`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown startup error.";
    }

    await delay(500);
  }

  throw new Error(`Timed out waiting for ${url}. Last error: ${lastError}`);
}

function terminateProcess(child, signal = "SIGTERM") {
  if (child.killed || child.exitCode !== null) {
    return;
  }

  child.kill(signal);
}

async function terminateProcessGracefully(child) {
  terminateProcess(child, "SIGTERM");
  const exited = await Promise.race([
    new Promise((resolve) => child.once("exit", () => resolve(true))),
    delay(5_000, false)
  ]);

  if (!exited) {
    terminateProcess(child, "SIGKILL");
  }
}

async function main() {
  const playwrightArgs = process.argv.slice(2);
  const managedChildren = [];
  let mockBackendServer = null;
  let lockAcquired = false;
  const hasBuildOutput = existsSync(".next/BUILD_ID");
  const buildMetadata = readBuildMetadata();
  const runtime = resolveE2ERuntimeOptions({
    env: process.env,
    buildMetadata,
    hasBuildOutput
  });
  const {
    requestedBuildReuse,
    skipFreshBuild,
    backendPort,
    backendBaseURL,
    frontendPort,
    frontendBaseURL,
    shouldStartMockBackend,
    useExternalBackend
  } = runtime;

  const cleanup = async () => {
    if (mockBackendServer) {
      await new Promise((resolve) => mockBackendServer.close(() => resolve(true)));
      mockBackendServer = null;
    }
    await Promise.allSettled(managedChildren.map((child) => terminateProcessGracefully(child)));
    if (lockAcquired) {
      await releaseRunE2ELock({
        projectDirectory: process.cwd()
      });
      lockAcquired = false;
    }
  };

  process.on("SIGINT", async () => {
    await cleanup();
    process.exit(130);
  });

  process.on("SIGTERM", async () => {
    await cleanup();
    process.exit(143);
  });

  try {
    await acquireRunE2ELock({
      projectDirectory: process.cwd()
    });
    lockAcquired = true;

    await terminateWorkspaceConflictingProcesses({
      projectDirectory: process.cwd(),
      log: (message) => {
        process.stdout.write(`[preflight] ${message}\n`);
      }
    });

    if (shouldStartMockBackend) {
      mockBackendServer = await startMockBackend({
        listenPort: backendPort,
        onReady: (address) => {
          process.stdout.write(`[mock-backend] Mock backend listening on ${address}\n`);
        }
      });
    } else {
      process.stdout.write(`[e2e-backend] Using external backend ${backendBaseURL}\n`);
    }

    await waitForHealthyResponse(
      `${backendBaseURL}/api/v1/auth/csrf`,
      (response, body) => response.ok && body.includes("\"csrf_token\""),
      startupTimeoutMs
    );

    if (!skipFreshBuild) {
      if (requestedBuildReuse && hasBuildOutput && buildMetadata === null) {
        process.stdout.write("[next-build] Existing build output found, but no e2e metadata is available. Rebuilding to bind runtime ports safely.\n");
      }
      let buildOutput = "";
      const buildProcess = spawnProcess(nextBinary, ["build", "--webpack"], {
        env: {
          ...process.env,
          SKILLSINDEX_SERVER_API_BASE_URL: backendBaseURL,
          NEXT_PUBLIC_API_BASE_URL: backendBaseURL,
          SKILLSINDEX_ENABLE_DIAGNOSTIC_ROUTES: "1"
        },
        tag: "next-build",
        onOutput: (text) => {
          buildOutput += text;
        }
      });

      const buildExitCode = await new Promise((resolve) => buildProcess.once("exit", resolve));
      const recoveredBuildFailure = await shouldRecoverFromNextBuildFailure({
        exitCode: Number(buildExitCode ?? 1),
        output: buildOutput,
        projectDirectory: process.cwd()
      });

      if (buildExitCode !== 0 && !recoveredBuildFailure) {
        throw new Error(`Next.js production build failed with exit code ${String(buildExitCode)}.`);
      }

      if (recoveredBuildFailure) {
        process.stdout.write(
          "[next-build] Recovered from a known proxy trace artifact build failure and will reuse the generated middleware artifacts.\n"
        );
      }

      if (!useExternalBackend && typeof backendPort === "number" && Number.isFinite(backendPort)) {
        writeBuildMetadata({ backendPort });
      }
    } else {
      const reusedPortMessage = buildMetadata?.backendPort ? ` using backend port ${String(buildMetadata.backendPort)}` : "";
      process.stdout.write(`[next-build] Reusing existing build because PLAYWRIGHT_SKIP_BUILD=1 and .next/BUILD_ID exists${reusedPortMessage}.\n`);
    }

    const nextServer = spawnProcess(nextBinary, ["start", "--hostname", "127.0.0.1", "--port", String(frontendPort)], {
      env: {
        ...process.env,
        SKILLSINDEX_SERVER_API_BASE_URL: backendBaseURL,
        NEXT_PUBLIC_API_BASE_URL: backendBaseURL,
        SKILLSINDEX_ENABLE_DIAGNOSTIC_ROUTES: "1"
      },
      tag: "next-start"
    });
    managedChildren.push(nextServer);

    await waitForHealthyResponse(
      `${frontendBaseURL}/login`,
      (response, body) => response.ok && body.includes('data-testid="login-page"'),
      startupTimeoutMs
    );

    const testProcess = spawn(playwrightBinary, ["test", ...playwrightArgs], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PLAYWRIGHT_FRONTEND_PORT: String(frontendPort),
        ...(typeof backendPort === "number" && Number.isFinite(backendPort)
          ? { PLAYWRIGHT_BACKEND_PORT: String(backendPort) }
          : {})
      },
      stdio: "inherit"
    });

    const testExitCode = await new Promise((resolve) => testProcess.once("exit", resolve));
    await cleanup();
    process.exit(typeof testExitCode === "number" ? testExitCode : 1);
  } catch (error) {
    await cleanup();
    const message = error instanceof Error ? error.message : "Unknown E2E runner failure.";
    process.stderr.write(`${message}\n`);
    process.exit(1);
  }
}

await main();
