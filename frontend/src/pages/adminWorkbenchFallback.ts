import { AdminIntegrationsResponse } from "../lib/api";

export type AdminIntegrationWorkbenchMode =
  | "integration_settings"
  | "integration_connector_list"
  | "integration_configuration_form"
  | "webhook_delivery_logs";

export type AdminIncidentWorkbenchMode =
  | "incident_recovery"
  | "incident_management_list"
  | "incident_response_console"
  | "incident_postmortem_detail";

export type AdminAccountRoleWorkbenchMode =
  | "account_management_list"
  | "account_configuration_form"
  | "role_management_list"
  | "role_configuration_form";

export interface SSOProviderPayload {
  items?: Array<Record<string, unknown>>;
  total?: number;
}

export interface OpsMetricsPayload {
  item?: Record<string, unknown>;
}

export interface OpsCollectionPayload {
  items?: Array<Record<string, unknown>>;
  total?: number;
}

export interface AdminAccountItem {
  id: number;
  username: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AdminAccountsPayload {
  items?: AdminAccountItem[];
  total?: number;
}

export interface RegistrationPayload {
  allow_registration?: boolean;
}

export interface AuthProvidersPayload {
  auth_providers?: string[];
}

export function buildIntegrationWorkbenchFallback(
  mode: AdminIntegrationWorkbenchMode
): {
  integrations: AdminIntegrationsResponse;
  ssoProviders: SSOProviderPayload | null;
} {
  const integrations: AdminIntegrationsResponse = {
    items: [
      {
        id: 11,
        name: "GitHub Core",
        provider: "github",
        description: "Primary repository synchronization endpoint.",
        base_url: "https://api.github.com",
        enabled: true,
        updated_at: "2026-03-01T08:40:00Z"
      },
      {
        id: 12,
        name: "GitLab Project",
        provider: "gitlab",
        description: "Enterprise project source integration.",
        base_url: "https://gitlab.example.com/api/v4",
        enabled: true,
        updated_at: "2026-03-01T08:15:00Z"
      },
      {
        id: 13,
        name: "Bitbucket Legacy",
        provider: "bitbucket",
        description: "Legacy migration source with restricted permissions.",
        base_url: "https://api.bitbucket.org",
        enabled: false,
        updated_at: "2026-02-27T02:20:00Z"
      },
      {
        id: 14,
        name: "Webhook Relay",
        provider: "webhook",
        description: "Inbound event relay for operational pipelines.",
        base_url: "https://hooks.skillsindex.local",
        enabled: true,
        updated_at: "2026-03-01T07:50:00Z"
      }
    ],
    total: 4,
    webhook_logs: [
      {
        id: 9001,
        connector_id: 11,
        event_type: "skill.updated",
        outcome: "ok",
        status_code: 200,
        endpoint: "https://hooks.skillsindex.local/events/skill",
        delivered_at: "2026-03-01T09:00:00Z"
      },
      {
        id: 9002,
        connector_id: 12,
        event_type: "sync.completed",
        outcome: "ok",
        status_code: 202,
        endpoint: "https://hooks.skillsindex.local/events/sync",
        delivered_at: "2026-03-01T08:56:00Z"
      },
      {
        id: 9003,
        connector_id: 14,
        event_type: "alert.triggered",
        outcome: "error",
        status_code: 500,
        endpoint: "https://hooks.skillsindex.local/events/alerts",
        delivered_at: "2026-03-01T08:41:00Z"
      }
    ],
    webhook_total: 3
  };

  if (mode !== "integration_configuration_form") {
    return {
      integrations,
      ssoProviders: null
    };
  }

  return {
    integrations,
    ssoProviders: {
      total: 3,
      items: [
        {
          provider_key: "dingtalk",
          display_name: "DingTalk SSO",
          enabled: true,
          callback_url: "https://skillsindex.local/auth/dingtalk/callback",
          updated_at: "2026-03-01T08:10:00Z"
        },
        {
          provider_key: "oidc",
          display_name: "Enterprise OIDC",
          enabled: true,
          callback_url: "https://skillsindex.local/auth/oidc/callback",
          updated_at: "2026-03-01T07:40:00Z"
        },
        {
          provider_key: "saml",
          display_name: "SAML Federation",
          enabled: false,
          callback_url: "https://skillsindex.local/auth/saml/callback",
          updated_at: "2026-02-28T21:15:00Z"
        }
      ]
    }
  };
}

export function buildIncidentWorkbenchFallback(mode: AdminIncidentWorkbenchMode): {
  metrics: OpsMetricsPayload;
  alerts: OpsCollectionPayload;
  recoveryDrills: OpsCollectionPayload;
  releases: OpsCollectionPayload | null;
} {
  const metrics: OpsMetricsPayload = {
    item: {
      open_incidents: 3,
      pending_moderation_cases: 5,
      unresolved_jobs: 4,
      failed_sync_runs_24h: 2,
      disabled_accounts: 1,
      stale_integrations: 2
    }
  };

  const alerts: OpsCollectionPayload = {
    total: 4,
    items: [
      {
        title: "Webhook error ratio threshold",
        severity: "critical",
        status: "open",
        owner: "ops-oncall",
        updated_at: "2026-03-01T08:33:00Z",
        triggered: true
      },
      {
        title: "Sync backlog overflow",
        severity: "high",
        status: "triage",
        owner: "sync-team",
        updated_at: "2026-03-01T08:11:00Z",
        triggered: true
      },
      {
        title: "Policy drift detected",
        severity: "medium",
        status: "acknowledged",
        owner: "governance",
        updated_at: "2026-03-01T07:56:00Z",
        triggered: false
      },
      {
        title: "Credential age warning",
        severity: "low",
        status: "monitoring",
        owner: "security",
        updated_at: "2026-03-01T07:32:00Z",
        triggered: false
      }
    ]
  };

  const recoveryDrills: OpsCollectionPayload = {
    total: 3,
    items: [
      {
        title: "RTO validation drill",
        status: "completed",
        reviewer: "platform-team",
        updated_at: "2026-02-27T10:30:00Z"
      },
      {
        title: "Cross-region failover drill",
        status: "scheduled",
        reviewer: "ops-team",
        updated_at: "2026-02-26T15:00:00Z"
      },
      {
        title: "Backup restore integrity",
        status: "completed",
        reviewer: "security-team",
        updated_at: "2026-02-25T20:20:00Z"
      }
    ]
  };

  const releases: OpsCollectionPayload = {
    total: 3,
    items: [
      {
        name: "release-2026.03.01",
        status: "completed",
        environment: "prod",
        released_at: "2026-03-01T06:05:00Z"
      },
      {
        name: "release-2026.02.28",
        status: "completed",
        environment: "prod",
        released_at: "2026-02-28T05:52:00Z"
      },
      {
        name: "release-2026.02.27",
        status: "rolled_back",
        environment: "staging",
        released_at: "2026-02-27T09:47:00Z"
      }
    ]
  };

  return {
    metrics,
    alerts,
    recoveryDrills,
    releases: mode === "incident_postmortem_detail" ? releases : null
  };
}

export function buildAccountRoleWorkbenchFallback(mode: AdminAccountRoleWorkbenchMode): {
  accounts: AdminAccountsPayload;
  registration: RegistrationPayload;
  authProviders: AuthProvidersPayload | null;
} {
  const accounts: AdminAccountsPayload = {
    total: 8,
    items: [
      {
        id: 101,
        username: "admin.user",
        role: "super_admin",
        status: "active",
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-03-01T08:00:00Z"
      },
      {
        id: 102,
        username: "ops.lead",
        role: "admin",
        status: "active",
        created_at: "2026-01-15T00:00:00Z",
        updated_at: "2026-03-01T07:55:00Z"
      },
      {
        id: 103,
        username: "security.audit",
        role: "auditor",
        status: "active",
        created_at: "2026-01-20T00:00:00Z",
        updated_at: "2026-03-01T07:40:00Z"
      },
      {
        id: 104,
        username: "member.demo",
        role: "member",
        status: "active",
        created_at: "2026-02-01T00:00:00Z",
        updated_at: "2026-03-01T07:20:00Z"
      },
      {
        id: 105,
        username: "readonly.demo",
        role: "viewer",
        status: "disabled",
        created_at: "2026-02-08T00:00:00Z",
        updated_at: "2026-02-28T18:20:00Z"
      }
    ]
  };

  return {
    accounts,
    registration: {
      allow_registration: true
    },
    authProviders:
      mode === "account_configuration_form"
        ? {
            auth_providers: ["password", "dingtalk", "oidc"]
          }
        : null
  };
}
