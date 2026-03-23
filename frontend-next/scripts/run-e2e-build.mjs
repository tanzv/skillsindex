import { access } from "node:fs/promises";
import path from "node:path";

const recoverableBuildErrorPattern =
  /ENOENT: no such file or directory, open ['"][^'"]*[\\/]\.next[\\/]server[\\/]proxy\.js\.nft\.json['"]/;

const requiredRecoverableArtifacts = [
  ".next/BUILD_ID",
  ".next/required-server-files.json",
  ".next/server/middleware.js",
  ".next/server/middleware.js.nft.json",
  ".next/server/pages-manifest.json"
];

export function isRecoverableProxyTraceBuildFailure(output) {
  return recoverableBuildErrorPattern.test(output);
}

export async function hasRecoverableBuildArtifacts(projectDirectory) {
  try {
    await Promise.all(
      requiredRecoverableArtifacts.map((relativePath) => access(path.join(projectDirectory, relativePath)))
    );
    return true;
  } catch {
    return false;
  }
}

export async function shouldRecoverFromNextBuildFailure({ exitCode, output, projectDirectory }) {
  if (exitCode === 0) {
    return false;
  }

  if (!isRecoverableProxyTraceBuildFailure(output)) {
    return false;
  }

  return hasRecoverableBuildArtifacts(projectDirectory);
}
