import { describe, expect, it } from "vitest";

import adminAccountEditorModalSource from "../adminAccountRoleWorkbench/AdminAccountEditorModal.tsx?raw";
import adminAccountRoleWorkbenchPageSource from "../adminAccountRoleWorkbench/AdminAccountRoleWorkbenchPage.tsx?raw";
import adminAccountRoleWorkbenchTableSource from "../adminAccountRoleWorkbench/AdminAccountRoleWorkbenchTable.tsx?raw";
import adminOpsMetricsPageSource from "../adminOps/AdminOpsMetricsPage.tsx?raw";
import adminSecurityPageHelpersSource from "../adminSecurity/AdminSecurityPage.helpers.ts?raw";
import adminSubpageSummaryPanelSource from "./AdminSubpageSummaryPanel.tsx?raw";
import adminIntegrationsPageSource from "../adminWorkbench/AdminIntegrationsPage.tsx?raw";

const tokenGovernedSources = [
  {
    path: "src/pages/adminAccountRoleWorkbench/AdminAccountRoleWorkbenchPage.tsx",
    content: adminAccountRoleWorkbenchPageSource
  },
  {
    path: "src/pages/adminAccountRoleWorkbench/AdminAccountRoleWorkbenchTable.tsx",
    content: adminAccountRoleWorkbenchTableSource
  },
  {
    path: "src/pages/adminAccountRoleWorkbench/AdminAccountEditorModal.tsx",
    content: adminAccountEditorModalSource
  },
  { path: "src/pages/adminWorkbench/AdminIntegrationsPage.tsx", content: adminIntegrationsPageSource },
  { path: "src/pages/adminOps/AdminOpsMetricsPage.tsx", content: adminOpsMetricsPageSource },
  { path: "src/pages/adminSecurity/AdminSecurityPage.helpers.ts", content: adminSecurityPageHelpersSource },
  { path: "src/pages/adminShared/AdminSubpageSummaryPanel.tsx", content: adminSubpageSummaryPanelSource }
];

const prototypeAlignmentExceptions = [
  "src/pages/adminOverview/AdminOverviewPage.tsx",
  "src/pages/adminOverview/AdminOverviewPage.styles.ts"
];

describe("admin style token governance", () => {
  it("keeps documented prototype alignment exceptions explicit", () => {
    expect(prototypeAlignmentExceptions).toEqual([
      "src/pages/adminOverview/AdminOverviewPage.tsx",
      "src/pages/adminOverview/AdminOverviewPage.styles.ts"
    ]);
  });

  it.each(tokenGovernedSources)("avoids literal color values in $path", ({ content }) => {
    expect(content).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(content).not.toMatch(/\brgba?\(/);
  });
});
