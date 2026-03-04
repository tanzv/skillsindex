import { routeViewBuilders } from "./AdminOpsControlPage.helpers";
import { AdminOpsControlRoute, RouteDefinition } from "./AdminOpsControlPage.types";

export const adminOpsRouteDefinitions: Record<AdminOpsControlRoute, RouteDefinition> = {
  "/admin/ops/alerts": {
    title: "Operations Alerts",
    subtitle: "Monitor severity and trigger states for operational alerts.",
    endpoint: "/api/v1/admin/ops/alerts",
    buildView: routeViewBuilders["/admin/ops/alerts"]
  },
  "/admin/ops/audit-export": {
    title: "Audit Export",
    subtitle: "Review compliance export records in JSON format.",
    endpoint: "/api/v1/admin/ops/audit-export?format=json",
    buildView: routeViewBuilders["/admin/ops/audit-export"]
  },
  "/admin/ops/release-gates": {
    title: "Release Gates",
    subtitle: "Inspect gate checks and trigger an on-demand gate run.",
    endpoint: "/api/v1/admin/ops/release-gates",
    runEndpoint: "/api/v1/admin/ops/release-gates/run",
    buildView: routeViewBuilders["/admin/ops/release-gates"]
  },
  "/admin/ops/recovery-drills": {
    title: "Recovery Drills",
    subtitle: "Track RPO/RTO drill evidence and completion history.",
    endpoint: "/api/v1/admin/ops/recovery-drills",
    buildView: routeViewBuilders["/admin/ops/recovery-drills"]
  },
  "/admin/ops/releases": {
    title: "Release History",
    subtitle: "Review rollout outcomes and release execution records.",
    endpoint: "/api/v1/admin/ops/releases",
    buildView: routeViewBuilders["/admin/ops/releases"]
  },
  "/admin/ops/change-approvals": {
    title: "Change Approvals",
    subtitle: "Track approval workflow state for operational changes.",
    endpoint: "/api/v1/admin/ops/change-approvals",
    buildView: routeViewBuilders["/admin/ops/change-approvals"]
  },
  "/admin/ops/backup/plans": {
    title: "Backup Plans",
    subtitle: "Inspect configured backup plans and scheduling posture.",
    endpoint: "/api/v1/admin/ops/backup/plans",
    buildView: routeViewBuilders["/admin/ops/backup/plans"]
  },
  "/admin/ops/backup/runs": {
    title: "Backup Runs",
    subtitle: "Monitor recent backup execution outcomes and failures.",
    endpoint: "/api/v1/admin/ops/backup/runs",
    buildView: routeViewBuilders["/admin/ops/backup/runs"]
  }
};
