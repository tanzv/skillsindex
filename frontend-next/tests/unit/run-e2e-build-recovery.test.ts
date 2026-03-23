import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const rootDirectory = path.resolve(import.meta.dirname, "../..");

async function importRunE2EBuildModule() {
  const moduleURL = pathToFileURL(path.join(rootDirectory, "scripts", "run-e2e-build.mjs")).href;
  return import(moduleURL);
}

async function createRecoverableBuildArtifacts(projectDirectory: string) {
  const distDirectory = path.join(projectDirectory, ".next");
  const serverDirectory = path.join(distDirectory, "server");

  await mkdir(serverDirectory, { recursive: true });
  await writeFile(path.join(distDirectory, "BUILD_ID"), "test-build-id", "utf8");
  await writeFile(path.join(distDirectory, "required-server-files.json"), "{}", "utf8");
  await writeFile(path.join(serverDirectory, "middleware.js"), "export {};", "utf8");
  await writeFile(path.join(serverDirectory, "middleware.js.nft.json"), JSON.stringify({ version: 1, files: [] }), "utf8");
  await writeFile(path.join(serverDirectory, "pages-manifest.json"), "{}", "utf8");
}

describe("run e2e build recovery", () => {
  const temporaryDirectories: string[] = [];

  afterEach(async () => {
    await Promise.all(
      temporaryDirectories.map(async (directoryPath) => {
        await import("node:fs/promises").then(({ rm }) => rm(directoryPath, { recursive: true, force: true }));
      })
    );
    temporaryDirectories.length = 0;
  });

  it("recovers a failed build when Next only misses proxy trace output after producing middleware artifacts", async () => {
    const projectDirectory = await mkdtemp(path.join(os.tmpdir(), "skillsindex-run-e2e-recovery-"));
    temporaryDirectories.push(projectDirectory);
    await createRecoverableBuildArtifacts(projectDirectory);

    const { shouldRecoverFromNextBuildFailure } = await importRunE2EBuildModule();
    const shouldRecover = await shouldRecoverFromNextBuildFailure({
      exitCode: 1,
      output: "Error: ENOENT: no such file or directory, open '/tmp/project/.next/server/proxy.js.nft.json'",
      projectDirectory
    });

    expect(shouldRecover).toBe(true);
  });

  it("does not recover unrelated build failures", async () => {
    const projectDirectory = await mkdtemp(path.join(os.tmpdir(), "skillsindex-run-e2e-recovery-"));
    temporaryDirectories.push(projectDirectory);
    await createRecoverableBuildArtifacts(projectDirectory);

    const { shouldRecoverFromNextBuildFailure } = await importRunE2EBuildModule();
    const shouldRecover = await shouldRecoverFromNextBuildFailure({
      exitCode: 1,
      output: "Error: Unexpected webpack failure",
      projectDirectory
    });

    expect(shouldRecover).toBe(false);
  });
});
