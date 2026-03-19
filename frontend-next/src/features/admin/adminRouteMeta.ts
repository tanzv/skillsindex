import type { AdminNavigationMessages } from "@/src/lib/i18n/protectedMessages";
import { buildAdminNavigationGroups } from "@/src/lib/routing/adminNavigation";

export interface AdminRouteMeta {
  title: string;
  description: string;
  endpoint: string;
}

const adminRouteEndpointMap: Record<string, string> = {
  "/admin/overview": "/api/v1/admin/overview",
  "/admin/ingestion/manual": "/api/v1/admin/ingestion/manual",
  "/admin/ingestion/repository": "/api/v1/admin/ingestion/repository",
  "/admin/records/imports": "/api/v1/admin/records/imports",
  "/admin/skills": "/api/v1/admin/skills",
  "/admin/jobs": "/api/v1/admin/jobs",
  "/admin/sync-jobs": "/api/v1/admin/sync-jobs",
  "/admin/sync-policy/repository": "/api/v1/admin/sync-policy/repository",
  "/admin/integrations": "/api/v1/admin/integrations",
  "/admin/ops/metrics": "/api/v1/admin/ops/metrics",
  "/admin/ops/alerts": "/api/v1/admin/ops/alerts",
  "/admin/ops/audit-export": "/api/v1/admin/ops/audit-export",
  "/admin/ops/release-gates": "/api/v1/admin/ops/release-gates",
  "/admin/ops/recovery-drills": "/api/v1/admin/ops/recovery-drills",
  "/admin/ops/releases": "/api/v1/admin/ops/releases",
  "/admin/ops/change-approvals": "/api/v1/admin/ops/change-approvals",
  "/admin/ops/backup/plans": "/api/v1/admin/ops/backup/plans",
  "/admin/ops/backup/runs": "/api/v1/admin/ops/backup/runs",
  "/admin/accounts": "/api/v1/admin/overview",
  "/admin/roles": "/api/v1/admin/overview",
  "/admin/access": "/api/v1/admin/access",
  "/admin/organizations": "/api/v1/admin/organizations",
  "/admin/apikeys": "/api/v1/admin/apikeys",
  "/admin/moderation": "/api/v1/admin/moderation"
};

export function buildAdminRouteMeta(messages: AdminNavigationMessages): Record<string, AdminRouteMeta> {
  return Object.fromEntries(
    buildAdminNavigationGroups(messages)
      .flatMap((group) => group.items)
      .map((item) => {
        const endpoint = adminRouteEndpointMap[item.href];
        if (!endpoint) {
          return null;
        }

        return [
          item.href,
          {
            title: item.label,
            description: item.description || item.label,
            endpoint
          }
        ] satisfies [string, AdminRouteMeta];
      })
      .filter((entry): entry is [string, AdminRouteMeta] => Boolean(entry))
  );
}
