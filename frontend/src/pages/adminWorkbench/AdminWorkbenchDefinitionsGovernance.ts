import { buildPathWithQuery } from "../accountWorkbench/ConsoleWorkbench";
import { parseScopes, requiredID } from "./AdminWorkbenchDefinitionHelpers";
import type { AdminGovernanceRoute } from "./AdminWorkbenchTypes";
import type { WorkbenchDefinition } from "../accountWorkbench/ConsoleWorkbench";

export const adminWorkbenchGovernanceDefinitions: Record<AdminGovernanceRoute, WorkbenchDefinition> = {
  "/admin/apikeys": {
    title: "API Key Management",
    subtitle: "Create, revoke, and rotate API keys for eligible owners.",
    resources: [
      {
        key: "apiKeys",
        title: "API Key List",
        fields: [
          { key: "owner", label: "Owner", type: "text", placeholder: "username or user id" },
          {
            key: "status",
            label: "Status",
            type: "select",
            defaultValue: "all",
            options: [
              { label: "all", value: "all" },
              { label: "active", value: "active" },
              { label: "revoked", value: "revoked" },
              { label: "expired", value: "expired" }
            ]
          },
          { key: "limit", label: "Limit", type: "number", defaultValue: 100, min: 1, max: 1000 }
        ],
        buildPath: (values) => buildPathWithQuery("/api/v1/admin/apikeys", values)
      }
    ],
    actions: [
      {
        key: "createApiKey",
        title: "Create API Key",
        submitText: "Create",
        fields: [
          { key: "name", label: "Name", type: "text", placeholder: "service-key" },
          { key: "expires_in_days", label: "Expires In Days", type: "number", min: 0 },
          { key: "owner_user_id", label: "Owner User ID", type: "number", min: 1 },
          {
            key: "scopes",
            label: "Scopes",
            type: "textarea",
            placeholder: "skills.search.read,skills.ai_search.read"
          }
        ],
        buildPath: () => "/api/v1/admin/apikeys",
        buildPayload: (values) => {
          const payload: Record<string, unknown> = {};
          const name = String(values.name || "").trim();
          if (name) {
            payload.name = name;
          }

          const expires = Number(values.expires_in_days);
          if (Number.isFinite(expires) && expires >= 0) {
            payload.expires_in_days = Math.round(expires);
          }

          const ownerID = requiredID(values.owner_user_id);
          if (ownerID) {
            payload.owner_user_id = ownerID;
          }

          const scopes = parseScopes(values.scopes);
          if (scopes.length > 0) {
            payload.scopes = scopes;
          }

          return payload;
        },
        refreshResources: ["apiKeys"]
      },
      {
        key: "revokeApiKey",
        title: "Revoke API Key",
        fields: [{ key: "key_id", label: "Key ID", type: "number", required: true, min: 1 }],
        buildPath: (values) => {
          const keyID = requiredID(values.key_id);
          if (!keyID) {
            return null;
          }
          return `/api/v1/admin/apikeys/${keyID}/revoke`;
        },
        refreshResources: ["apiKeys"]
      },
      {
        key: "rotateApiKey",
        title: "Rotate API Key",
        fields: [{ key: "key_id", label: "Key ID", type: "number", required: true, min: 1 }],
        buildPath: (values) => {
          const keyID = requiredID(values.key_id);
          if (!keyID) {
            return null;
          }
          return `/api/v1/admin/apikeys/${keyID}/rotate`;
        },
        refreshResources: ["apiKeys"]
      }
    ]
  },
  "/admin/organizations": {
    title: "Organization Governance",
    subtitle: "Create organizations, inspect member lists, and manage member roles.",
    resources: [
      {
        key: "organizations",
        title: "Organization List",
        buildPath: () => "/api/v1/admin/organizations"
      },
      {
        key: "organizationMembers",
        title: "Organization Members",
        autoLoad: false,
        fields: [{ key: "org_id", label: "Organization ID", type: "number", required: true, min: 1 }],
        buildPath: (values) => {
          const orgID = requiredID(values.org_id);
          if (!orgID) {
            return null;
          }
          return `/api/v1/admin/organizations/${orgID}/members`;
        }
      }
    ],
    actions: [
      {
        key: "createOrganization",
        title: "Create Organization",
        fields: [{ key: "name", label: "Name", type: "text", required: true, placeholder: "Platform Engineering" }],
        buildPath: () => "/api/v1/admin/organizations",
        refreshResources: ["organizations"]
      },
      {
        key: "upsertOrganizationMember",
        title: "Add or Update Member",
        fields: [
          { key: "org_id", label: "Organization ID", type: "number", required: true, min: 1 },
          { key: "user_id", label: "User ID", type: "number", required: true, min: 1 },
          {
            key: "role",
            label: "Role",
            type: "select",
            required: true,
            defaultValue: "member",
            options: [
              { label: "owner", value: "owner" },
              { label: "admin", value: "admin" },
              { label: "member", value: "member" }
            ]
          }
        ],
        buildPath: (values) => {
          const orgID = requiredID(values.org_id);
          if (!orgID) {
            return null;
          }
          return `/api/v1/admin/organizations/${orgID}/members`;
        },
        buildPayload: (values) => ({
          user_id: requiredID(values.user_id),
          role: String(values.role || "")
        }),
        refreshResources: ["organizationMembers"]
      },
      {
        key: "updateOrganizationMemberRole",
        title: "Update Member Role",
        fields: [
          { key: "org_id", label: "Organization ID", type: "number", required: true, min: 1 },
          { key: "user_id", label: "User ID", type: "number", required: true, min: 1 },
          {
            key: "role",
            label: "Role",
            type: "select",
            required: true,
            defaultValue: "member",
            options: [
              { label: "owner", value: "owner" },
              { label: "admin", value: "admin" },
              { label: "member", value: "member" }
            ]
          }
        ],
        buildPath: (values) => {
          const orgID = requiredID(values.org_id);
          const userID = requiredID(values.user_id);
          if (!orgID || !userID) {
            return null;
          }
          return `/api/v1/admin/organizations/${orgID}/members/${userID}/role`;
        },
        buildPayload: (values) => ({ role: String(values.role || "") }),
        refreshResources: ["organizationMembers"]
      },
      {
        key: "removeOrganizationMember",
        title: "Remove Member",
        fields: [
          { key: "org_id", label: "Organization ID", type: "number", required: true, min: 1 },
          { key: "user_id", label: "User ID", type: "number", required: true, min: 1 }
        ],
        buildPath: (values) => {
          const orgID = requiredID(values.org_id);
          const userID = requiredID(values.user_id);
          if (!orgID || !userID) {
            return null;
          }
          return `/api/v1/admin/organizations/${orgID}/members/${userID}/remove`;
        },
        refreshResources: ["organizationMembers"]
      }
    ]
  },
  "/admin/moderation": {
    title: "Moderation Workspace",
    subtitle: "Read moderation queue and execute resolve or reject actions.",
    resources: [
      {
        key: "moderationCases",
        title: "Moderation Cases",
        fields: [
          {
            key: "status",
            label: "Status",
            type: "select",
            defaultValue: "",
            options: [
              { label: "all", value: "" },
              { label: "open", value: "open" },
              { label: "resolved", value: "resolved" },
              { label: "rejected", value: "rejected" }
            ]
          },
          { key: "limit", label: "Limit", type: "number", defaultValue: 80, min: 1, max: 200 }
        ],
        buildPath: (values) => buildPathWithQuery("/api/v1/admin/moderation", values)
      }
    ],
    actions: [
      {
        key: "createModerationCase",
        title: "Create Case",
        fields: [
          { key: "reporter_user_id", label: "Reporter User ID", type: "number", min: 1 },
          {
            key: "target_type",
            label: "Target Type",
            type: "select",
            required: true,
            defaultValue: "skill",
            options: [
              { label: "skill", value: "skill" },
              { label: "comment", value: "comment" }
            ]
          },
          { key: "skill_id", label: "Skill ID", type: "number", min: 1 },
          { key: "comment_id", label: "Comment ID", type: "number", min: 1 },
          { key: "reason_code", label: "Reason Code", type: "text", required: true, placeholder: "abuse" },
          { key: "reason_detail", label: "Reason Detail", type: "textarea" }
        ],
        buildPath: () => "/api/v1/admin/moderation",
        buildPayload: (values) => {
          const payload: Record<string, unknown> = {
            target_type: String(values.target_type || ""),
            reason_code: String(values.reason_code || "")
          };

          const reporterUserID = requiredID(values.reporter_user_id);
          if (reporterUserID) {
            payload.reporter_user_id = reporterUserID;
          }
          const skillID = requiredID(values.skill_id);
          if (skillID) {
            payload.skill_id = skillID;
          }
          const commentID = requiredID(values.comment_id);
          if (commentID) {
            payload.comment_id = commentID;
          }

          const reasonDetail = String(values.reason_detail || "").trim();
          if (reasonDetail) {
            payload.reason_detail = reasonDetail;
          }

          return payload;
        },
        refreshResources: ["moderationCases"]
      },
      {
        key: "resolveModerationCase",
        title: "Resolve Case",
        fields: [
          { key: "case_id", label: "Case ID", type: "number", required: true, min: 1 },
          {
            key: "action",
            label: "Action",
            type: "select",
            defaultValue: "none",
            options: [
              { label: "none", value: "none" },
              { label: "flagged", value: "flagged" },
              { label: "hidden", value: "hidden" },
              { label: "deleted", value: "deleted" }
            ]
          },
          { key: "resolution_note", label: "Resolution Note", type: "textarea" }
        ],
        buildPath: (values) => {
          const caseID = requiredID(values.case_id);
          if (!caseID) {
            return null;
          }
          return `/api/v1/admin/moderation/${caseID}/resolve`;
        },
        buildPayload: (values) => ({
          action: String(values.action || "none"),
          resolution_note: String(values.resolution_note || "")
        }),
        refreshResources: ["moderationCases"]
      },
      {
        key: "rejectModerationCase",
        title: "Reject Case",
        fields: [
          { key: "case_id", label: "Case ID", type: "number", required: true, min: 1 },
          { key: "rejection_note", label: "Rejection Note", type: "textarea" }
        ],
        buildPath: (values) => {
          const caseID = requiredID(values.case_id);
          if (!caseID) {
            return null;
          }
          return `/api/v1/admin/moderation/${caseID}/reject`;
        },
        buildPayload: (values) => ({ rejection_note: String(values.rejection_note || "") }),
        refreshResources: ["moderationCases"]
      }
    ]
  }
};
