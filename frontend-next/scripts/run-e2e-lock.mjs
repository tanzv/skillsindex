import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const lockDirectoryName = "run-e2e.lock";
const lockMetadataFileName = "owner.json";

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

async function readLockMetadata(lockDirectoryPath, readFileImpl = readFile) {
  const metadataPath = path.join(lockDirectoryPath, lockMetadataFileName);

  try {
    const payload = JSON.parse(await readFileImpl(metadataPath, "utf8"));
    const pid = Number(payload?.pid);
    const startedAt = String(payload?.startedAt || "");

    if (!Number.isFinite(pid) || pid <= 0 || !startedAt) {
      return null;
    }

    return {
      pid,
      startedAt
    };
  } catch {
    return null;
  }
}

export async function acquireRunE2ELock({
  projectDirectory,
  currentPid = process.pid,
  mkdirImpl = mkdir,
  writeFileImpl = writeFile,
  readFileImpl = readFile,
  rmImpl = rm,
  statImpl = stat,
  killImpl = process.kill
}) {
  const lockDirectoryPath = path.join(projectDirectory, ".next", lockDirectoryName);
  const metadataPath = path.join(lockDirectoryPath, lockMetadataFileName);

  try {
    await mkdirImpl(lockDirectoryPath, { recursive: false });
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "EEXIST")) {
      throw error;
    }

    const metadata = await readLockMetadata(lockDirectoryPath, readFileImpl);
    if (metadata && isProcessAlive(metadata.pid, killImpl)) {
      throw new Error(
        `Another run-e2e process is already active for ${projectDirectory}. pid=${String(metadata.pid)} startedAt=${metadata.startedAt}`
      );
    }

    try {
      await statImpl(lockDirectoryPath);
      await rmImpl(lockDirectoryPath, { recursive: true, force: true });
    } catch {
      // Ignore lock disappearance races and retry acquisition below.
    }

    await mkdirImpl(lockDirectoryPath, { recursive: false });
  }

  await writeFileImpl(
    metadataPath,
    JSON.stringify({
      pid: currentPid,
      startedAt: new Date().toISOString()
    }),
    "utf8"
  );

  return lockDirectoryPath;
}

export async function releaseRunE2ELock({
  projectDirectory,
  rmImpl = rm
}) {
  const lockDirectoryPath = path.join(projectDirectory, ".next", lockDirectoryName);
  await rmImpl(lockDirectoryPath, { recursive: true, force: true });
}
