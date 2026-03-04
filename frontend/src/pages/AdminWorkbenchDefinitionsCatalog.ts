import { buildPathWithQuery } from "./ConsoleWorkbench";
import { asNumber, asObject, requiredID } from "./AdminWorkbenchDefinitionHelpers";
import type { AdminCatalogRoute } from "./AdminWorkbenchTypes";
import type { WorkbenchDefinition } from "./ConsoleWorkbench";

export const adminWorkbenchCatalogDefinitions: Record<AdminCatalogRoute, WorkbenchDefinition> = {
  "/admin/overview": {
    title: "Admin Overview",
    subtitle: "Live inventory, organization, and capability posture for the active admin session.",
    resources: [
      {
        key: "overview",
        title: "Overview Snapshot",
        description: "Role context, aggregate counts, and capability flags.",
        buildPath: () => "/api/v1/admin/overview"
      }
    ],
    summary: (resources) => {
      const payload = asObject(resources.overview);
      const counts = asObject(payload.counts);
      const capabilities = asObject(payload.capabilities);
      return [
        { label: "Total Skills", value: asNumber(counts.total) },
        { label: "Public Skills", value: asNumber(counts.public) },
        { label: "Private Skills", value: asNumber(counts.private) },
        { label: "Syncable Skills", value: asNumber(counts.syncable) },
        { label: "Organizations", value: asNumber(counts.org_count) },
        {
          label: "Manage Users",
          value: String(Boolean(capabilities.can_manage_users)),
          help: "Permission capability"
        }
      ];
    }
  },
  "/admin/skills": {
    title: "Skill Governance",
    subtitle: "Query skill inventory with source, owner, and visibility controls.",
    resources: [
      {
        key: "skills",
        title: "Skill List",
        description: "Filter and paginate visible skills.",
        fields: [
          { key: "q", label: "Keyword", type: "text", placeholder: "Name, description, owner" },
          { key: "source", label: "Source", type: "text", placeholder: "manual, repository, archive" },
          { key: "visibility", label: "Visibility", type: "text", placeholder: "public or private" },
          { key: "owner", label: "Owner", type: "text", placeholder: "username or id" },
          { key: "page", label: "Page", type: "number", defaultValue: 1, min: 1 },
          { key: "limit", label: "Limit", type: "number", defaultValue: 20, min: 1, max: 200 }
        ],
        buildPath: (values) => buildPathWithQuery("/api/v1/admin/skills", values)
      }
    ],
    summary: (resources) => {
      const payload = asObject(resources.skills);
      return [
        { label: "Total Matches", value: asNumber(payload.total) },
        { label: "Page", value: asNumber(payload.page, 1) },
        { label: "Page Size", value: asNumber(payload.limit, 20) }
      ];
    }
  },
  "/admin/integrations": {
    title: "Integration Operations",
    subtitle: "Connector catalog and webhook delivery telemetry.",
    resources: [
      {
        key: "integrations",
        title: "Connector and Webhook State",
        description: "Provider-level connector inventory and recent webhook logs.",
        fields: [
          { key: "provider", label: "Provider", type: "text", placeholder: "github, dingtalk, webhook" },
          { key: "include_disabled", label: "Include Disabled", type: "switch", defaultValue: true },
          { key: "limit", label: "Limit", type: "number", defaultValue: 20, min: 1, max: 200 }
        ],
        buildPath: (values) => buildPathWithQuery("/api/v1/admin/integrations", values)
      }
    ],
    summary: (resources) => {
      const payload = asObject(resources.integrations);
      return [
        { label: "Connectors", value: asNumber(payload.total) },
        { label: "Webhook Rows", value: asNumber(payload.webhook_total) }
      ];
    }
  },
  "/admin/jobs": {
    title: "Asynchronous Jobs",
    subtitle: "Inspect queue status, read job detail, retry failed jobs, or cancel active jobs.",
    resources: [
      {
        key: "jobs",
        title: "Job List",
        fields: [
          { key: "owner_id", label: "Owner ID", type: "number", min: 1 },
          { key: "status", label: "Status", type: "text", placeholder: "pending, running, failed" },
          { key: "job_type", label: "Job Type", type: "text", placeholder: "repo_sync, import" },
          { key: "limit", label: "Limit", type: "number", defaultValue: 80, min: 1, max: 200 }
        ],
        buildPath: (values) => buildPathWithQuery("/api/v1/admin/jobs", values)
      },
      {
        key: "jobDetail",
        title: "Job Detail",
        description: "Load one job record by ID.",
        autoLoad: false,
        fields: [{ key: "job_id", label: "Job ID", type: "number", required: true, min: 1 }],
        buildPath: (values) => {
          const jobID = requiredID(values.job_id);
          if (!jobID) {
            return null;
          }
          return `/api/v1/admin/jobs/${jobID}`;
        }
      }
    ],
    actions: [
      {
        key: "retryJob",
        title: "Retry Job",
        fields: [{ key: "job_id", label: "Job ID", type: "number", required: true, min: 1 }],
        buildPath: (values) => {
          const jobID = requiredID(values.job_id);
          if (!jobID) {
            return null;
          }
          return `/api/v1/admin/jobs/${jobID}/retry`;
        },
        refreshResources: ["jobs", "jobDetail"]
      },
      {
        key: "cancelJob",
        title: "Cancel Job",
        fields: [{ key: "job_id", label: "Job ID", type: "number", required: true, min: 1 }],
        buildPath: (values) => {
          const jobID = requiredID(values.job_id);
          if (!jobID) {
            return null;
          }
          return `/api/v1/admin/jobs/${jobID}/cancel`;
        },
        refreshResources: ["jobs", "jobDetail"]
      }
    ]
  },
  "/admin/sync-jobs": {
    title: "Repository Sync Jobs",
    subtitle: "Inspect sync run timeline and query per-run detail.",
    resources: [
      {
        key: "syncJobs",
        title: "Sync Run List",
        fields: [
          { key: "owner_id", label: "Owner ID", type: "number", min: 1 },
          { key: "limit", label: "Limit", type: "number", defaultValue: 80, min: 1, max: 200 }
        ],
        buildPath: (values) => buildPathWithQuery("/api/v1/admin/sync-jobs", values)
      },
      {
        key: "syncJobDetail",
        title: "Sync Run Detail",
        autoLoad: false,
        fields: [{ key: "run_id", label: "Run ID", type: "number", required: true, min: 1 }],
        buildPath: (values) => {
          const runID = requiredID(values.run_id);
          if (!runID) {
            return null;
          }
          return `/api/v1/admin/sync-jobs/${runID}`;
        }
      }
    ]
  },
  "/admin/sync-policy/repository": {
    title: "Repository Sync Policy",
    subtitle: "Read and update scheduler policy for repository synchronization.",
    resources: [
      {
        key: "syncPolicy",
        title: "Current Policy",
        buildPath: () => "/api/v1/admin/sync-policy/repository"
      }
    ],
    actions: [
      {
        key: "updateSyncPolicy",
        title: "Update Policy",
        description: "Only provided fields are sent to backend.",
        submitText: "Update",
        fields: [
          {
            key: "enabled_mode",
            label: "Enabled",
            type: "select",
            defaultValue: "",
            options: [
              { label: "No Change", value: "" },
              { label: "true", value: "true" },
              { label: "false", value: "false" }
            ]
          },
          { key: "interval", label: "Interval", type: "text", placeholder: "30m" },
          { key: "timeout", label: "Timeout", type: "text", placeholder: "10m" },
          { key: "batch_size", label: "Batch Size", type: "number", min: 1, max: 500 }
        ],
        buildPath: () => "/api/v1/admin/sync-policy/repository",
        buildPayload: (values) => {
          const payload: Record<string, unknown> = {};
          const enabledMode = String(values.enabled_mode || "");
          if (enabledMode === "true") {
            payload.enabled = true;
          } else if (enabledMode === "false") {
            payload.enabled = false;
          }

          const interval = String(values.interval || "").trim();
          if (interval) {
            payload.interval = interval;
          }

          const timeout = String(values.timeout || "").trim();
          if (timeout) {
            payload.timeout = timeout;
          }

          const batchSize = requiredID(values.batch_size);
          if (batchSize) {
            payload.batch_size = batchSize;
          }

          return payload;
        },
        refreshResources: ["syncPolicy"]
      }
    ]
  }
};
