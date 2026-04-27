import { access, mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { EventEmitter } from "node:events";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const rootDirectory = path.resolve(import.meta.dirname, "../..");

async function importManagedBuildModule() {
  const moduleURL = pathToFileURL(path.join(rootDirectory, "scripts", "run-managed-build.mjs")).href;
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

function createSpawnStub({
  exitCode,
  stdout = [],
  stderr = [],
}: {
  exitCode: number;
  stdout?: string[];
  stderr?: string[];
}) {
  return () => {
    const processEmitter = new EventEmitter() as EventEmitter & {
      stdout: EventEmitter;
      stderr: EventEmitter;
    };

    processEmitter.stdout = new EventEmitter();
    processEmitter.stderr = new EventEmitter();

    queueMicrotask(() => {
      stdout.forEach((chunk) => processEmitter.stdout.emit("data", Buffer.from(chunk)));
      stderr.forEach((chunk) => processEmitter.stderr.emit("data", Buffer.from(chunk)));
      processEmitter.emit("exit", exitCode);
    });

    return processEmitter;
  };
}

describe("managed build runner", () => {
  const temporaryDirectories: string[] = [];

  afterEach(async () => {
    await Promise.all(
      temporaryDirectories.map(async (directoryPath) => {
        await import("node:fs/promises").then(({ rm }) => rm(directoryPath, { recursive: true, force: true }));
      }),
    );
    temporaryDirectories.length = 0;
  });

  it("recovers from the known proxy trace artifact build failure", async () => {
    const projectDirectory = await mkdtemp(path.join(os.tmpdir(), "skillsindex-managed-build-"));
    temporaryDirectories.push(projectDirectory);
    await createRecoverableBuildArtifacts(projectDirectory);

    const { runManagedBuild } = await importManagedBuildModule();
    const exitCode = await runManagedBuild({
      projectDirectory,
      nextBinary: path.join(projectDirectory, "node_modules", ".bin", "next"),
      cleanOutput: false,
      spawnImpl: createSpawnStub({
        exitCode: 1,
        stderr: [
          "Error: ENOENT: no such file or directory, open '/tmp/project/.next/server/proxy.js.nft.json'",
        ],
      }),
    });

    expect(exitCode).toBe(0);
  });

  it("removes stale build output before starting a new build", async () => {
    const projectDirectory = await mkdtemp(path.join(os.tmpdir(), "skillsindex-managed-build-"));
    temporaryDirectories.push(projectDirectory);

    const staleArtifactPath = path.join(projectDirectory, ".next", "stale.txt");
    await mkdir(path.dirname(staleArtifactPath), { recursive: true });
    await writeFile(staleArtifactPath, "stale", "utf8");

    const { runManagedBuild } = await importManagedBuildModule();
    const exitCode = await runManagedBuild({
      projectDirectory,
      nextBinary: path.join(projectDirectory, "node_modules", ".bin", "next"),
      spawnImpl: createSpawnStub({
        exitCode: 0
      })
    });

    expect(exitCode).toBe(0);
    await expect(access(staleArtifactPath)).rejects.toThrow();
  });

  it("returns the original exit code for unrelated build failures", async () => {
    const projectDirectory = await mkdtemp(path.join(os.tmpdir(), "skillsindex-managed-build-"));
    temporaryDirectories.push(projectDirectory);

    const { runManagedBuild } = await importManagedBuildModule();
    const exitCode = await runManagedBuild({
      projectDirectory,
      nextBinary: path.join(projectDirectory, "node_modules", ".bin", "next"),
      cleanOutput: false,
      spawnImpl: createSpawnStub({
        exitCode: 1,
        stderr: ["Error: Unexpected webpack failure"],
      }),
    });

    expect(exitCode).toBe(1);
  });
});
