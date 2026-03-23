import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

const rootDirectory = path.resolve(import.meta.dirname, "../..");

async function importRunE2ELockModule() {
  const moduleURL = pathToFileURL(path.join(rootDirectory, "scripts", "run-e2e-lock.mjs")).href;
  return import(moduleURL);
}

describe("run e2e lock", () => {
  const temporaryDirectories = [];

  afterEach(async () => {
    await Promise.all(
      temporaryDirectories.map(async (directoryPath) => {
        await rm(directoryPath, { recursive: true, force: true });
      })
    );
    temporaryDirectories.length = 0;
  });

  it("acquires and releases a workspace e2e lock", async () => {
    const projectDirectory = await mkdtemp(path.join(os.tmpdir(), "skillsindex-run-e2e-lock-"));
    temporaryDirectories.push(projectDirectory);
    await mkdir(path.join(projectDirectory, ".next"), { recursive: true });
    const { acquireRunE2ELock, releaseRunE2ELock } = await importRunE2ELockModule();

    const lockPath = await acquireRunE2ELock({
      projectDirectory,
      currentPid: 12345
    });

    expect(path.basename(lockPath)).toBe("run-e2e.lock");

    await releaseRunE2ELock({
      projectDirectory
    });

    await expect(import("node:fs/promises").then(({ stat }) => stat(lockPath))).rejects.toThrow();
  });

  it("rejects when another live run-e2e owner already holds the lock", async () => {
    const projectDirectory = await mkdtemp(path.join(os.tmpdir(), "skillsindex-run-e2e-lock-"));
    temporaryDirectories.push(projectDirectory);
    const lockDirectoryPath = path.join(projectDirectory, ".next", "run-e2e.lock");
    await mkdir(lockDirectoryPath, { recursive: true });
    await writeFile(
      path.join(lockDirectoryPath, "owner.json"),
      JSON.stringify({
        pid: 54321,
        startedAt: "2026-03-24T00:00:00.000Z"
      }),
      "utf8"
    );
    const { acquireRunE2ELock } = await importRunE2ELockModule();
    const killImpl = vi.fn((pid, signal) => {
      expect(pid).toBe(54321);
      expect(signal).toBe(0);
    });

    await expect(
      acquireRunE2ELock({
        projectDirectory,
        currentPid: 12345,
        killImpl
      })
    ).rejects.toThrow(/Another run-e2e process is already active/);
  });

  it("reclaims a stale lock whose owner is no longer running", async () => {
    const projectDirectory = await mkdtemp(path.join(os.tmpdir(), "skillsindex-run-e2e-lock-"));
    temporaryDirectories.push(projectDirectory);
    const lockDirectoryPath = path.join(projectDirectory, ".next", "run-e2e.lock");
    await mkdir(lockDirectoryPath, { recursive: true });
    await writeFile(
      path.join(lockDirectoryPath, "owner.json"),
      JSON.stringify({
        pid: 54321,
        startedAt: "2026-03-24T00:00:00.000Z"
      }),
      "utf8"
    );
    const { acquireRunE2ELock } = await importRunE2ELockModule();
    const killImpl = vi.fn(() => {
      const error = Object.assign(new Error("missing"), { code: "ESRCH" });
      throw error;
    });

    const lockPath = await acquireRunE2ELock({
      projectDirectory,
      currentPid: 12345,
      killImpl
    });

    expect(path.basename(lockPath)).toBe("run-e2e.lock");
  });
});
