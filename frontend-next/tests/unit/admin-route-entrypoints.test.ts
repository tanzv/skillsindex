import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function readAppFile(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8");
}

describe("admin route entrypoints", () => {
  it("routes admin pages through the shared admin route helper", () => {
    const routeFiles = [
      "app/(admin)/admin/access/page.tsx",
      "app/(admin)/admin/accounts/new/page.tsx",
      "app/(admin)/admin/accounts/page.tsx",
      "app/(admin)/admin/audit/page.tsx",
      "app/(admin)/admin/apikeys/page.tsx",
      "app/(admin)/admin/ingestion/manual/page.tsx",
      "app/(admin)/admin/ingestion/repository/page.tsx",
      "app/(admin)/admin/integrations/page.tsx",
      "app/(admin)/admin/jobs/page.tsx",
      "app/(admin)/admin/moderation/page.tsx",
      "app/(admin)/admin/ops/alerts/page.tsx",
      "app/(admin)/admin/ops/audit-export/page.tsx",
      "app/(admin)/admin/ops/backup/plans/page.tsx",
      "app/(admin)/admin/ops/backup/runs/page.tsx",
      "app/(admin)/admin/ops/change-approvals/page.tsx",
      "app/(admin)/admin/ops/metrics/page.tsx",
      "app/(admin)/admin/ops/recovery-drills/page.tsx",
      "app/(admin)/admin/ops/release-gates/page.tsx",
      "app/(admin)/admin/ops/releases/page.tsx",
      "app/(admin)/admin/organizations/page.tsx",
      "app/(admin)/admin/overview/page.tsx",
      "app/(admin)/admin/records/imports/page.tsx",
      "app/(admin)/admin/roles/new/page.tsx",
      "app/(admin)/admin/roles/page.tsx",
      "app/(admin)/admin/skills/page.tsx",
      "app/(admin)/admin/sync-jobs/page.tsx",
      "app/(admin)/admin/sync-policy/repository/page.tsx"
    ];

    for (const routeFile of routeFiles) {
      const routeSource = readAppFile(routeFile);

      expect(routeSource).toContain('from "@/src/features/admin/adminRouteEntry"');
      expect(routeSource).not.toContain('from "@/src/features/admin/renderAdminRoute"');
      expect(routeSource).not.toContain("renderAdminRoute(");
    }
  });
});
