import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

const rootDirectory = path.resolve(import.meta.dirname, "../..");
const runtimeModuleURL = pathToFileURL(path.join(rootDirectory, "scripts", "run-e2e-runtime.mjs")).href;

async function importRuntimeModule() {
  return import(runtimeModuleURL);
}

describe("run-e2e runtime configuration", () => {
  it("defaults to the managed mock backend flow", async () => {
    const { resolveE2ERuntimeOptions } = await importRuntimeModule();

    const runtime = resolveE2ERuntimeOptions({
      env: {},
      hasBuildOutput: false,
      buildMetadata: null,
      processId: 123
    });

    expect(runtime.useExternalBackend).toBe(false);
    expect(runtime.shouldStartMockBackend).toBe(true);
    expect(runtime.backendPort).toBe(34323);
    expect(runtime.backendBaseURL).toBe("http://127.0.0.1:34323");
    expect(runtime.frontendPort).toBe(33323);
    expect(runtime.frontendBaseURL).toBe("http://127.0.0.1:33323");
    expect(runtime.skipFreshBuild).toBe(false);
  });

  it("reuses the existing build metadata when build reuse is requested", async () => {
    const { resolveE2ERuntimeOptions } = await importRuntimeModule();

    const runtime = resolveE2ERuntimeOptions({
      env: {
        PLAYWRIGHT_SKIP_BUILD: "1"
      },
      hasBuildOutput: true,
      buildMetadata: {
        backendPort: 34888
      },
      processId: 123
    });

    expect(runtime.skipFreshBuild).toBe(true);
    expect(runtime.backendPort).toBe(34888);
    expect(runtime.backendBaseURL).toBe("http://127.0.0.1:34888");
  });

  it("supports an explicit external backend mode for real backend smoke coverage", async () => {
    const { resolveE2ERuntimeOptions } = await importRuntimeModule();

    const runtime = resolveE2ERuntimeOptions({
      env: {
        PLAYWRIGHT_USE_EXTERNAL_BACKEND: "1",
        PLAYWRIGHT_BACKEND_BASE_URL: "http://127.0.0.1:8080"
      },
      hasBuildOutput: false,
      buildMetadata: null,
      processId: 123
    });

    expect(runtime.useExternalBackend).toBe(true);
    expect(runtime.shouldStartMockBackend).toBe(false);
    expect(runtime.backendPort).toBe(8080);
    expect(runtime.backendBaseURL).toBe("http://127.0.0.1:8080");
  });

  it("fails fast when external backend mode is enabled without a backend base url", async () => {
    const { resolveE2ERuntimeOptions } = await importRuntimeModule();

    expect(() =>
      resolveE2ERuntimeOptions({
        env: {
          PLAYWRIGHT_USE_EXTERNAL_BACKEND: "1"
        },
        hasBuildOutput: false,
        buildMetadata: null,
        processId: 123
      })
    ).toThrow("PLAYWRIGHT_BACKEND_BASE_URL");
  });
});
