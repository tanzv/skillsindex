import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDirectExecution = process.argv[1] ? path.resolve(process.argv[1]) === __filename : false;
const frontendRoot = path.resolve(__dirname, "..");

export async function findUnexpectedPageRootFiles(pagesRoot, options = {}) {
  const ignoredFileNames = new Set(options.ignoredFileNames || []);
  const entries = await readdir(pagesRoot, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && !ignoredFileNames.has(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

async function main() {
  const pagesRoot = path.resolve(frontendRoot, "src/pages");
  const unexpectedFiles = await findUnexpectedPageRootFiles(pagesRoot);

  if (unexpectedFiles.length === 0) {
    console.log(`[frontend-pages-structure] PASS ${pagesRoot}`);
    return;
  }

  console.error(`[frontend-pages-structure] FAIL ${pagesRoot}`);
  for (const fileName of unexpectedFiles) {
    console.error(`- unexpected root file: ${fileName}`);
  }
  process.exitCode = 1;
}

if (isDirectExecution) {
  main().catch((error) => {
  console.error("[frontend-pages-structure] ERROR", error);
  process.exitCode = 1;
  });
}
