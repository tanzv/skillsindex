import type { ActionDefinition, ResourceDefinition, WorkbenchDefinition } from "./types";
import { asNumber, asObject, buildPathWithQuery, parseScopes, requiredID } from "./utils";

import { adminOperationsWorkbenchDefinitions } from "./adminDefinitionsOps";

function buildAccountsSummary(resources: Record<string, unknown>) {
  const payload = asObject(resources.accounts);
  const items = Array.isArray(payload.items) ? payload.items.map((item) => asObject(item)) : [];
  const disabledAccounts = items.filter((item) => String(item.status || "").toLowerCase() === "disabled").length;
  const distinctRoles = new Set(items.map((item) => String(item.role || "").trim()).filter(Boolean)).size;

  return [
    { label: "Total Accounts", value: asNumber(payload.total, items.length) },
    { label: "Disabled Accounts", value: disabledAccounts },
    { label: "Distinct Roles", value: distinctRoles }
  ];
}

function accountDirectoryResource(title = "Account Directory", description = "Current platform accounts with role and status metadata."): ResourceDefinition {
  return {
    key: "accounts",
    title,
    description,
    buildPath: () => "/api/v1/admin/accounts"
  };
}

function registrationPolicyResource(): ResourceDefinition {
  return {
    key: "registration",
    title: "Registration Policy",
    description: "Current self-registration and marketplace access posture.",
    buildPath: () => "/api/v1/admin/settings/registration"
  };
}

function authProvidersResource(): ResourceDefinition {
  return {
    key: "authProviders",
    title: "Auth Providers",
    description: "Enabled and available login providers.",
    buildPath: () => "/api/v1/admin/settings/auth-providers"
  };
}

function updateRegistrationPolicyAction(): ActionDefinition {
  return {
    key: "updateRegistrationPolicy",
    title: "Update Registration Policy",
    submitText: "Save Policy",
    fields: [
      { key: "allow_registration", label: "Allow Registration", type: "switch", defaultValue: false },
      { key: "marketplace_public_access", label: "Marketplace Public Access", type: "switch", defaultValue: true }
    ],
    buildPath: () => "/api/v1/admin/settings/registration",
    refreshResources: ["registration"]
  };
}

function updateAuthProvidersAction(): ActionDefinition {
  return {
    key: "updateAuthProviders",
    title: "Update Auth Providers",
    submitText: "Save Providers",
    fields: [
      { key: "auth_providers", label: "Enabled Providers", type: "textarea", placeholder: "github,google,wecom" }
    ],
    buildPath: () => "/api/v1/admin/settings/auth-providers",
    buildPayload: (values) => ({
      auth_providers: parseScopes(values.auth_providers)
    }),
    refreshResources: ["authProviders"]
  };
}

function updateAccountStatusAction(): ActionDefinition {
  return {
    key: "updateAccountStatus",
    title: "Update Account Status",
    submitText: "Apply Status",
    fields: [
      { key: "user_id", label: "User ID", type: "number", required: true, min: 1 },
      {
        key: "status",
        label: "Status",
        type: "select",
        defaultValue: "active",
        options: [
          { label: "Active", value: "active" },
          { label: "Disabled", value: "disabled" }
        ]
      }
    ],
    buildPath: (values) => {
      const userID = requiredID(values.user_id);
      return userID ? `/api/v1/admin/accounts/${userID}/status` : null;
    },
    buildPayload: (values) => ({
      status: String(values.status || "active").trim()
    }),
    refreshResources: ["accounts"]
  };
}

function forceSignoutAction(): ActionDefinition {
  return {
    key: "forceAccountSignout",
    title: "Force Sign Out",
    fields: [{ key: "user_id", label: "User ID", type: "number", required: true, min: 1 }],
    buildPath: (values) => {
      const userID = requiredID(values.user_id);
      return userID ? `/api/v1/admin/accounts/${userID}/force-signout` : null;
    },
    refreshResources: ["accounts"]
  };
}

function resetPasswordAction(): ActionDefinition {
  return {
    key: "resetAccountPassword",
    title: "Reset Password",
    submitText: "Rotate Password",
    fields: [
      { key: "user_id", label: "User ID", type: "number", required: true, min: 1 },
      { key: "new_password", label: "New Password", type: "password", required: true }
    ],
    buildPath: (values) => {
      const userID = requiredID(values.user_id);
      return userID ? `/api/v1/admin/accounts/${userID}/password-reset` : null;
    },
    buildPayload: (values) => ({
      new_password: String(values.new_password || "").trim()
    }),
    refreshResources: ["accounts"]
  };
}

function updateUserRoleAction(): ActionDefinition {
  return {
    key: "updateUserRole",
    title: "Update User Role",
    submitText: "Apply Role",
    fields: [
      { key: "user_id", label: "User ID", type: "number", required: true, min: 1 },
      {
        key: "role",
        label: "Role",
        type: "select",
        defaultValue: "member",
        options: [
          { label: "Super Admin", value: "super_admin" },
          { label: "Admin", value: "admin" },
          { label: "Member", value: "member" },
          { label: "Viewer", value: "viewer" }
        ]
      }
    ],
    buildPath: (values) => {
      const userID = requiredID(values.user_id);
      return userID ? `/api/v1/admin/users/${userID}/role` : null;
    },
    buildPayload: (values) => ({
      role: String(values.role || "member").trim()
    }),
    refreshResources: ["accounts"]
  };
}

function adminSkillListResource(key: string, title: string, defaults: Record<string, unknown> = {}): ResourceDefinition {
  const defaultFields = {
    q: "",
    source: "",
    visibility: "",
    page: 1,
    ...defaults
  };

  return {
    key,
    title,
    fields: [
      { key: "q", label: "Keyword", type: "text", placeholder: "Name, description, owner", defaultValue: defaultFields.q as string },
      { key: "source", label: "Source", type: "text", placeholder: "manual, repository, upload, skillmp", defaultValue: defaultFields.source as string },
      { key: "visibility", label: "Visibility", type: "text", placeholder: "public or private", defaultValue: defaultFields.visibility as string },
      { key: "page", label: "Page", type: "number", defaultValue: defaultFields.page as number, min: 1 }
    ],
    buildPath: (values) => buildPathWithQuery("/api/v1/admin/skills", { ...defaultFields, ...values })
  };
}

function syncPolicyAction(): ActionDefinition {
  return {
    key: "updateSyncPolicy",
    title: "Update Policy",
    submitText: "Update",
    fields: [
      { key: "enabled", label: "Enabled", type: "switch", defaultValue: false },
      { key: "interval", label: "Interval", type: "text", placeholder: "30m" },
      { key: "timeout", label: "Timeout", type: "text", placeholder: "10m" },
      { key: "batch_size", label: "Batch Size", type: "number", min: 1, max: 500 }
    ],
    buildPath: () => "/api/v1/admin/sync-policy/repository",
    refreshResources: ["syncPolicy"]
  };
}

export const adminWorkbenchDefinitions: Record<string, WorkbenchDefinition> = {
  "/admin/access": {
    title: "Access Governance",
    subtitle: "Monitor registration posture, provider visibility, and account control signals from one view.",
    resources: [accountDirectoryResource(), registrationPolicyResource(), authProvidersResource()],
    actions: [updateRegistrationPolicyAction(), updateAuthProvidersAction()],
    summary: (resources) => {
      const registration = asObject(resources.registration);
      const authProviders = asObject(resources.authProviders);
      const enabledProviders = Array.isArray(authProviders.auth_providers) ? authProviders.auth_providers.length : 0;
      return [
        ...buildAccountsSummary(resources),
        { label: "Registration Open", value: String(Boolean(registration.allow_registration)) },
        { label: "Enabled Providers", value: enabledProviders }
      ];
    }
  },
  "/admin/accounts": {
    title: "Account Management",
    subtitle: "Inspect account inventory, disable or re-enable access, force sign-out, and rotate credentials.",
    resources: [accountDirectoryResource()],
    actions: [updateAccountStatusAction(), forceSignoutAction(), resetPasswordAction()],
    summary: buildAccountsSummary
  },
  "/admin/accounts/new": {
    title: "Account Provisioning Policy",
    subtitle: "Configure how new accounts enter the platform and which login providers remain visible.",
    resources: [registrationPolicyResource(), authProvidersResource(), accountDirectoryResource("Recent Accounts", "Current account roster for provisioning context.")],
    actions: [updateRegistrationPolicyAction(), updateAuthProvidersAction()],
    summary: (resources) => {
      const registration = asObject(resources.registration);
      return [
        ...buildAccountsSummary(resources),
        { label: "Registration Open", value: String(Boolean(registration.allow_registration)) }
      ];
    }
  },
  "/admin/roles": {
    title: "Role Management",
    subtitle: "Review role coverage across accounts and apply role changes through the unified admin contract.",
    resources: [accountDirectoryResource("Role Coverage", "Account role assignments sourced from the admin account directory.")],
    actions: [updateUserRoleAction()],
    summary: buildAccountsSummary
  },
  "/admin/roles/new": {
    title: "Role Configuration",
    subtitle: "Stage role changes for existing accounts while keeping directory-wide role distribution visible.",
    resources: [accountDirectoryResource("Assignable Accounts", "Accounts eligible for role review and reassignment.")],
    actions: [updateUserRoleAction()],
    summary: buildAccountsSummary
  },
  "/admin/skills": {
    title: "Skill Governance",
    subtitle: "Query skill inventory with source, owner, and visibility controls.",
    resources: [adminSkillListResource("skills", "Skill List")]
  },
  "/admin/integrations": {
    title: "Integration Operations",
    subtitle: "Connector catalog and webhook delivery telemetry.",
    resources: [
      {
        key: "integrations",
        title: "Connector and Webhook State",
        fields: [
          { key: "provider", label: "Provider", type: "text", placeholder: "github, dingtalk, webhook" },
          { key: "include_disabled", label: "Include Disabled", type: "switch", defaultValue: true }
        ],
        buildPath: (values) => buildPathWithQuery("/api/v1/admin/integrations", values)
      }
    ]
  },
  "/admin/jobs": {
    title: "Asynchronous Jobs",
    subtitle: "Inspect queue status, read job detail, retry failed jobs, or cancel active jobs.",
    resources: [
      {
        key: "jobs",
        title: "Job List",
        fields: [
          { key: "status", label: "Status", type: "text", placeholder: "pending, running, failed" },
          { key: "job_type", label: "Job Type", type: "text", placeholder: "repo_sync, import" }
        ],
        buildPath: (values) => buildPathWithQuery("/api/v1/admin/jobs", values)
      }
    ],
    actions: [
      {
        key: "retryJob",
        title: "Retry Job",
        fields: [{ key: "job_id", label: "Job ID", type: "number", required: true }],
        buildPath: (values) => {
          const jobID = requiredID(values.job_id);
          return jobID ? `/api/v1/admin/jobs/${jobID}/retry` : null;
        },
        refreshResources: ["jobs"]
      },
      {
        key: "cancelJob",
        title: "Cancel Job",
        fields: [{ key: "job_id", label: "Job ID", type: "number", required: true }],
        buildPath: (values) => {
          const jobID = requiredID(values.job_id);
          return jobID ? `/api/v1/admin/jobs/${jobID}/cancel` : null;
        },
        refreshResources: ["jobs"]
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
        buildPath: (values) => buildPathWithQuery("/api/v1/admin/sync-jobs", values)
      }
    ]
  },
  "/admin/sync-policy/repository": {
    title: "Repository Sync Policy",
    subtitle: "Read and update scheduler policy for repository synchronization.",
    resources: [{ key: "syncPolicy", title: "Current Policy", buildPath: () => "/api/v1/admin/sync-policy/repository" }],
    actions: [syncPolicyAction()]
  },
  ...adminOperationsWorkbenchDefinitions
};
