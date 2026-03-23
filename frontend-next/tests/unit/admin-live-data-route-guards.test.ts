import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readSourceFile(relativePath: string) {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

const guardedPageFiles = [
  "src/features/adminOverview/AdminOverviewPage.tsx",
  "src/features/adminCatalog/AdminCatalogPage.tsx",
  "src/features/adminAccess/AdminAccessPage.tsx",
  "src/features/adminGovernance/AdminIntegrationsPage.tsx",
  "src/features/adminGovernance/AdminOrganizationsPage.tsx",
  "src/features/adminGovernance/AdminModerationPage.tsx",
  "src/features/adminAccounts/AdminAccountsPage.tsx",
  "src/features/adminApiKeys/AdminAPIKeysPage.tsx",
  "src/features/adminIngestion/AdminIngestionPage.tsx",
  "src/features/adminOperations/AdminOperationsPage.tsx",
  "src/features/adminOperations/AdminOperationsRecordsPage.tsx"
] as const;

describe("admin live data route guards", () => {
  it.each(guardedPageFiles)("uses the shared load-state guard in %s", (relativePath) => {
    const source = readSourceFile(relativePath);

    expect(source).toContain("resolveAdminPageLoadState");
    expect(source).toContain("AdminPageLoadStateFrame");
  });
});
