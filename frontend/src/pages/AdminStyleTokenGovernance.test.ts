import { describe, expect, it } from "vitest";

import adminAccountEditorModalSource from "./AdminAccountEditorModal.tsx?raw";
import adminAccountRoleWorkbenchPageSource from "./AdminAccountRoleWorkbenchPage.tsx?raw";
import adminAccountRoleWorkbenchTableSource from "./AdminAccountRoleWorkbenchTable.tsx?raw";
import adminIntegrationsPageSource from "./AdminIntegrationsPage.tsx?raw";
import adminOpsMetricsPageSource from "./AdminOpsMetricsPage.tsx?raw";
import adminSecurityPageHelpersSource from "./AdminSecurityPage.helpers.ts?raw";
import adminSubpageSummaryPanelSource from "./AdminSubpageSummaryPanel.tsx?raw";
import organizationManagementSubpageShellSource from "./OrganizationManagementSubpageShell.tsx?raw";

const tokenGovernedSources = [
  { path: "src/pages/AdminAccountRoleWorkbenchPage.tsx", content: adminAccountRoleWorkbenchPageSource },
  { path: "src/pages/AdminAccountRoleWorkbenchTable.tsx", content: adminAccountRoleWorkbenchTableSource },
  { path: "src/pages/AdminAccountEditorModal.tsx", content: adminAccountEditorModalSource },
  { path: "src/pages/AdminIntegrationsPage.tsx", content: adminIntegrationsPageSource },
  { path: "src/pages/AdminOpsMetricsPage.tsx", content: adminOpsMetricsPageSource },
  { path: "src/pages/AdminSecurityPage.helpers.ts", content: adminSecurityPageHelpersSource },
  { path: "src/pages/AdminSubpageSummaryPanel.tsx", content: adminSubpageSummaryPanelSource },
  { path: "src/pages/OrganizationManagementSubpageShell.tsx", content: organizationManagementSubpageShellSource }
];

const prototypeAlignmentExceptions = [
  "src/pages/AdminOverviewPage.tsx",
  "src/pages/AdminOverviewPage.styles.ts"
];

describe("admin style token governance", () => {
  it("keeps documented prototype alignment exceptions explicit", () => {
    expect(prototypeAlignmentExceptions).toEqual([
      "src/pages/AdminOverviewPage.tsx",
      "src/pages/AdminOverviewPage.styles.ts"
    ]);
  });

  it.each(tokenGovernedSources)("avoids literal color values in $path", ({ content }) => {
    expect(content).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(content).not.toMatch(/\brgba?\(/);
  });
});
