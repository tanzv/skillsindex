import { execFile } from "node:child_process";
import { access, rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { setTimeout as delay } from "node:timers/promises";

const execFileAsync = promisify(execFile);

function normalizeWhitespace(value) {
  return String(value || "").trim();
}

export function parseProcessTable(output) {
  return normalizeWhitespace(output)
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*(\d+)\s+(.*)$/))
    .filter(Boolean)
    .map((match) => ({
      pid: Number(match[1]),
      command: match[2].trim()
    }));
}

export function parseLsofCwd(output) {
  for (const line of normalizeWhitespace(output).split(/\r?\n/)) {
    if (line.startsWith("n")) {
      return line.slice(1).trim();
    }
  }

  return null;
}

function isConflictingWorkspaceProcess(command) {
  return (
    command.includes("next-server") ||
    command.includes("scripts/run-e2e.mjs") ||
    command.includes("node_modules/.bin/next")
  );
}

export async function removeWorkspaceBuildLock({
  projectDirectory,
  log = () => {}
}) {
  const lockPath = path.join(projectDirectory, ".next", "lock");

  try {
    await access(lockPath);
  } catch {
    return false;
  }

  await rm(lockPath, { force: true });
  log(`removed stale Next.js build lock for ${projectDirectory}`);
  return true;
}

export function selectWorkspaceConflictingPids({ processTable, cwdByPid, projectDirectory, currentPid = process.pid }) {
  return processTable
    .filter((entry) => entry.pid !== currentPid)
    .filter((entry) => isConflictingWorkspaceProcess(entry.command))
    .filter((entry) => cwdByPid.get(entry.pid) === projectDirectory)
    .map((entry) => entry.pid);
}

export async function listWorkspaceConflictingPids({
  projectDirectory,
  currentPid = process.pid,
  execFileImpl = execFileAsync
}) {
  let processTable = [];

  try {
    const { stdout } = await execFileImpl("ps", ["-ax", "-o", "pid=", "-o", "command="]);
    processTable = parseProcessTable(stdout);
  } catch {
    return [];
  }

  const conflictingEntries = processTable.filter((entry) => isConflictingWorkspaceProcess(entry.command));
  if (!conflictingEntries.length) {
    return [];
  }

  const cwdByPid = new Map();
  await Promise.all(
    conflictingEntries.map(async (entry) => {
      try {
        const { stdout } = await execFileImpl("lsof", ["-a", "-p", String(entry.pid), "-d", "cwd", "-Fn"]);
        const cwd = parseLsofCwd(stdout);
        if (cwd) {
          cwdByPid.set(entry.pid, cwd);
        }
      } catch {
        // Ignore inspection failures and keep scanning other processes.
      }
    })
  );

  return selectWorkspaceConflictingPids({
    processTable: conflictingEntries,
    cwdByPid,
    projectDirectory,
    currentPid
  });
}

function isProcessAlive(pid, killImpl) {
  try {
    killImpl(pid, 0);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "EPERM") {
      return true;
    }

    return false;
  }
}

export async function terminatePidGracefully(
  pid,
  {
    killImpl = process.kill,
    delayImpl = delay,
    timeoutMs = 5_000,
    pollIntervalMs = 100
  } = {}
) {
  if (!isProcessAlive(pid, killImpl)) {
    return false;
  }

  try {
    killImpl(pid, "SIGTERM");
  } catch {
    return false;
  }

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await delayImpl(pollIntervalMs);

    if (!isProcessAlive(pid, killImpl)) {
      return true;
    }
  }

  try {
    killImpl(pid, "SIGKILL");
  } catch {
    return false;
  }

  return true;
}

export async function terminateWorkspaceConflictingProcesses({
  projectDirectory,
  currentPid = process.pid,
  execFileImpl = execFileAsync,
  killImpl = process.kill,
  delayImpl = delay,
  log = () => {}
}) {
  const pids = await listWorkspaceConflictingPids({
    projectDirectory,
    currentPid,
    execFileImpl
  });

  if (!pids.length) {
    return [];
  }

  log(`terminating ${String(pids.length)} stale e2e/runtime process(es) for ${projectDirectory}`);

  for (const pid of pids) {
    await terminatePidGracefully(pid, {
      killImpl,
      delayImpl
    });
  }

  if (pids.length > 0) {
    await removeWorkspaceBuildLock({
      projectDirectory,
      log
    });
  }

  return pids;
}
