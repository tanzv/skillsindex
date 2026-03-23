import { mkdtemp, mkdir, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

const rootDirectory = path.resolve(import.meta.dirname, "../..");

async function importProcessGuardModule() {
  const moduleURL = pathToFileURL(path.join(rootDirectory, "scripts", "run-e2e-process-guard.mjs")).href;
  return import(moduleURL);
}

describe("run e2e process guard", () => {
  const temporaryDirectories: string[] = [];

  afterEach(async () => {
    await Promise.all(
      temporaryDirectories.map(async (directoryPath) => {
        await import("node:fs/promises").then(({ rm }) =>
          rm(directoryPath, { recursive: true, force: true }),
        );
      }),
    );
    temporaryDirectories.length = 0;
  });

  it("lists only conflicting e2e runtime processes whose cwd matches the current workspace", async () => {
    const projectDirectory = "/tmp/skillsindex/frontend-next";
    const { listWorkspaceConflictingPids } = await importProcessGuardModule();

    const execFileImpl = vi.fn(async (command, args) => {
      if (command === "ps") {
        expect(args).toEqual(["-ax", "-o", "pid=", "-o", "command="]);
        return {
          stdout: [
            "111 next-server (v16.1.6)",
            "222 node ./scripts/run-e2e.mjs tests/e2e/foo.spec.ts",
            "223 node /tmp/skillsindex/frontend-next/node_modules/.bin/next build --webpack",
            "333 next-server (v16.1.6)",
            "444 node ./scripts/run-e2e.mjs tests/e2e/bar.spec.ts"
          ].join("\n")
        };
      }

      if (command === "lsof" && args[2] === "111") {
        return {
          stdout: ["p111", `n${projectDirectory}`].join("\n")
        };
      }

      if (command === "lsof" && args[2] === "222") {
        return {
          stdout: ["p222", `n${projectDirectory}`].join("\n")
        };
      }

      if (command === "lsof" && args[2] === "223") {
        return {
          stdout: ["p223", `n${projectDirectory}`].join("\n")
        };
      }

      if (command === "lsof" && args[2] === "333") {
        return {
          stdout: ["p333", "n/tmp/other-project/frontend-next"].join("\n")
        };
      }

      throw new Error(`Unexpected command: ${command} ${args.join(" ")}`);
    });

    const result = await listWorkspaceConflictingPids({
      projectDirectory,
      currentPid: 444,
      execFileImpl
    });

    expect(result).toEqual([111, 222, 223]);
  });

  it("terminates each matching runtime conflict before the e2e bootstrap continues", async () => {
    const projectDirectory = "/tmp/skillsindex/frontend-next";
    const { terminateWorkspaceConflictingProcesses } = await importProcessGuardModule();
    const alivePids = new Set([111, 222]);
    const signals = [];

    const execFileImpl = vi.fn(async (command, args) => {
      if (command === "ps") {
        return {
          stdout: ["111 next-server (v16.1.6)", "222 node ./scripts/run-e2e.mjs tests/e2e/foo.spec.ts"].join("\n")
        };
      }

      return {
        stdout: [`p${args[2]}`, `n${projectDirectory}`].join("\n")
      };
    });

    const killImpl = vi.fn((pid, signal) => {
      if (signal === 0) {
        if (!alivePids.has(pid)) {
          const error = Object.assign(new Error("missing"), { code: "ESRCH" });
          throw error;
        }
        return;
      }

      signals.push(`${String(pid)}:${String(signal)}`);
      alivePids.delete(pid);
    });

    const log = vi.fn();

    const result = await terminateWorkspaceConflictingProcesses({
      projectDirectory,
      currentPid: 999,
      execFileImpl,
      killImpl,
      delayImpl: async () => {},
      log
    });

    expect(result).toEqual([111, 222]);
    expect(signals).toEqual(["111:SIGTERM", "222:SIGTERM"]);
    expect(log).toHaveBeenCalledWith(
      `terminating 2 stale e2e/runtime process(es) for ${projectDirectory}`
    );
  });

  it("removes a stale next build lock after terminating conflicting workspace processes", async () => {
    const projectDirectory = await mkdtemp(
      path.join(os.tmpdir(), "skillsindex-run-e2e-guard-"),
    );
    temporaryDirectories.push(projectDirectory);
    await mkdir(path.join(projectDirectory, ".next"), { recursive: true });
    await import("node:fs/promises").then(({ writeFile }) =>
      writeFile(path.join(projectDirectory, ".next", "lock"), "", "utf8"),
    );

    const { terminateWorkspaceConflictingProcesses } =
      await importProcessGuardModule();
    const alivePids = new Set([111]);
    const logs: string[] = [];

    const execFileImpl = vi.fn(async (command, args) => {
      if (command === "ps") {
        return {
          stdout: "111 node /tmp/frontend-next/node_modules/.bin/next build --webpack",
        };
      }

      return {
        stdout: [`p${args[2]}`, `n${projectDirectory}`].join("\n"),
      };
    });

    const killImpl = vi.fn((pid, signal) => {
      if (signal === 0) {
        if (!alivePids.has(pid)) {
          const error = Object.assign(new Error("missing"), { code: "ESRCH" });
          throw error;
        }
        return;
      }

      alivePids.delete(pid);
    });

    await terminateWorkspaceConflictingProcesses({
      projectDirectory,
      currentPid: 999,
      execFileImpl,
      killImpl,
      delayImpl: async () => {},
      log: (message) => {
        logs.push(message);
      },
    });

    await expect(stat(path.join(projectDirectory, ".next", "lock"))).rejects.toThrow();
    expect(logs).toContain(
      `removed stale Next.js build lock for ${projectDirectory}`,
    );
  });
});
