import { createInitialOpsMockState } from "./mock-backend-ops-data.mjs";

export function createInitialMockState() {
  return {
    profile: {
      user: {
        id: 1,
        username: "admin",
        display_name: "Admin Operator",
        role: "super_admin",
        status: "active"
      },
      profile: {
        display_name: "Admin Operator",
        avatar_url: "https://example.com/avatar.png",
        bio: "Maintains the full control plane."
      }
    },
    sessions: {
      current_session_id: "session-current",
      session_issued_at: "2026-03-14T08:00:00Z",
      session_expires_at: "2026-03-15T08:00:00Z",
      total: 2,
      items: [
        {
          session_id: "session-current",
          user_agent: "Mock Browser",
          issued_ip: "127.0.0.1",
          last_seen: "2026-03-14T10:00:00Z",
          expires_at: "2026-03-15T08:00:00Z",
          is_current: true
        },
        {
          session_id: "session-other",
          user_agent: "CLI Session",
          issued_ip: "127.0.0.2",
          last_seen: "2026-03-14T09:30:00Z",
          expires_at: "2026-03-15T07:00:00Z",
          is_current: false
        }
      ]
    },
    credentials: {
      total: 1,
      supported_scopes: ["skills.search.read", "skills.ai_search.read", "skills.read"],
      default_scopes: ["skills.search.read"],
      items: [
        {
          id: 9001,
          name: "Primary CLI",
          purpose: "Smoke coverage",
          prefix: "sk_live_1234",
          scopes: ["skills.search.read"],
          status: "active",
          created_at: "2026-03-14T08:30:00Z",
          updated_at: "2026-03-14T08:30:00Z",
          last_used_at: "2026-03-14T10:15:00Z"
        }
      ]
    },
    registration: {
      allow_registration: true,
      marketplace_public_access: true
    },
    authProviders: {
      auth_providers: ["password", "github"],
      available_auth_providers: ["password", "github", "google"]
    },
    accounts: {
      total: 3,
      items: [
        { id: 1, username: "admin", role: "super_admin", status: "active", created_at: "2026-03-10T08:00:00Z", updated_at: "2026-03-14T09:00:00Z" },
        { id: 2, username: "operator", role: "admin", status: "active", created_at: "2026-03-11T08:00:00Z", updated_at: "2026-03-14T09:30:00Z" },
        { id: 3, username: "reviewer", role: "auditor", status: "disabled", created_at: "2026-03-12T08:00:00Z", updated_at: "2026-03-14T09:45:00Z", force_logout_at: "2026-03-14T09:50:00Z" }
      ]
    },
    syncPolicy: {
      enabled: true,
      interval: "15m",
      timeout: "5m",
      batch_size: 30
    },
    syncRuns: {
      total: 2,
      items: [
        { id: 71, trigger: "manual", scope: "repository", status: "success", candidates: 12, synced: 12, failed: 0, duration_ms: 8200, started_at: "2026-03-14T08:30:00Z", finished_at: "2026-03-14T08:30:08Z" },
        { id: 72, trigger: "scheduler", scope: "repository", status: "failed", candidates: 8, synced: 5, failed: 3, duration_ms: 9100, started_at: "2026-03-14T09:00:00Z", finished_at: "2026-03-14T09:00:09Z" }
      ]
    },
    jobs: {
      total: 2,
      items: [
        { id: 81, job_type: "import_upload", status: "failed", owner_user_id: 1, actor_user_id: 1, target_skill_id: 301, error_message: "archive parse failed", created_at: "2026-03-14T08:00:00Z", updated_at: "2026-03-14T08:04:00Z" },
        { id: 82, job_type: "import_skillmp", status: "running", owner_user_id: 1, actor_user_id: 1, target_skill_id: 302, error_message: "", created_at: "2026-03-14T09:00:00Z", updated_at: "2026-03-14T09:05:00Z" }
      ]
    },
    opsAuditExport: {
      total: 3,
      items: [
        { id: 1001, occurred_at: "2026-03-14T07:45:00Z", actor_user_id: 1, action: "release.create", target: "production", version: "v3.4.1" },
        { id: 1002, occurred_at: "2026-03-14T08:10:00Z", actor_user_id: 2, action: "backup_run.recorded", target: "warehouse-weekly", status: "success" },
        { id: 1003, occurred_at: "2026-03-14T08:30:00Z", actor_user_id: 1, action: "change_approval.recorded", target: "CHG-903", reviewer: "ops-reviewer" }
      ]
    },
    opsRecoveryDrills: {
      total: 2,
      items: [
        { logged_at: "2026-03-14T07:00:00Z", actor_user_id: 1, rpo_hours: 2, rto_hours: 4, passed: true, note: "Quarterly recovery drill completed within target." },
        { logged_at: "2026-03-13T22:15:00Z", actor_user_id: 2, rpo_hours: 7, rto_hours: 9, passed: false, note: "Cold region replica needed manual intervention." }
      ]
    },
    opsReleases: {
      total: 2,
      items: [
        { released_at: "2026-03-14T06:30:00Z", actor_user_id: 1, version: "v3.4.1", environment: "production", change_ticket: "CHG-903", status: "success", note: "Blue-green cutover completed." },
        { released_at: "2026-03-13T18:10:00Z", actor_user_id: 2, version: "v3.4.0", environment: "staging", change_ticket: "CHG-887", status: "rollback", note: "Rolled back after smoke alert regression." }
      ]
    },
    opsChangeApprovals: {
      total: 2,
      items: [
        { occurred_at: "2026-03-14T05:45:00Z", actor_user_id: 1, ticket_id: "APP-331", reviewer: "ops-reviewer", status: "approved", note: "Production deployment approved after release gate review." },
        { occurred_at: "2026-03-13T20:00:00Z", actor_user_id: 2, ticket_id: "APP-330", reviewer: "security-reviewer", status: "pending", note: "Waiting for vault rotation evidence." }
      ]
    },
    opsBackupPlans: {
      total: 2,
      items: [
        { logged_at: "2026-03-14T04:00:00Z", actor_user_id: 1, plan_key: "warehouse-daily", backup_type: "full", schedule: "0 1 * * *", retention_days: 30, enabled: true, note: "Primary warehouse backup schedule." },
        { logged_at: "2026-03-13T04:00:00Z", actor_user_id: 2, plan_key: "warehouse-weekly", backup_type: "snapshot", schedule: "0 3 * * 0", retention_days: 90, enabled: false, note: "Extended retention for legal hold workflows." }
      ]
    },
    opsBackupRuns: {
      total: 2,
      items: [
        { logged_at: "2026-03-14T03:10:00Z", actor_user_id: 1, plan_key: "warehouse-daily", status: "success", size_mb: 512, duration_minutes: 18, note: "Nightly backup finished before business hours." },
        { logged_at: "2026-03-13T03:10:00Z", actor_user_id: 2, plan_key: "warehouse-weekly", status: "failed", size_mb: 0, duration_minutes: 27, note: "Weekly backup hit object storage throttling." }
      ]
    },
    skills: [
      {
        id: 101,
        name: "Release Readiness Checklist",
        description: "Track release signals before production cutover.",
        category: "operations",
        subcategory: "release",
        tags: ["release", "checklist", "ops"],
        source_type: "manual",
        source_url: "",
        install_command: "npx skillsindex install release-readiness",
        content: "# Release Readiness Checklist\n\nTrack release signals, risks, and cutover notes before production deployment.",
        visibility: "public",
        owner_username: "admin",
        updated_at: "2026-03-14T08:00:00Z",
        star_count: 120,
        quality_score: 9.3
      },
      {
        id: 201,
        name: "Repository Sync Blueprint",
        description: "Repository ingestion and synchronization controls.",
        category: "engineering",
        subcategory: "repository",
        tags: ["repository", "sync", "audit"],
        source_type: "repository",
        source_url: "https://github.com/skillsindex/repository-sync-blueprint",
        install_command: "uvx skillsindex sync-blueprint",
        content: "# Repository Sync Blueprint\n\nReview queue health, mapping drift, and repository sync policy.",
        visibility: "private",
        owner_username: "admin",
        updated_at: "2026-03-14T09:00:00Z",
        star_count: 80,
        quality_score: 9.0
      },
      {
        id: 301,
        name: "Archive Intake Pack",
        description: "Archive based import asset.",
        category: "imports",
        subcategory: "archive",
        tags: ["archive", "intake", "imports"],
        source_type: "upload",
        source_url: "",
        install_command: "npx skillsindex import archive-intake",
        content: "# Archive Intake Pack\n\nValidate uploaded archive contents before import execution.",
        visibility: "private",
        owner_username: "admin",
        updated_at: "2026-03-14T08:20:00Z",
        star_count: 12,
        quality_score: 8.6
      },
      {
        id: 302,
        name: "SkillMP Governance Pack",
        description: "Imported from SkillMP.",
        category: "imports",
        subcategory: "skillmp",
        tags: ["skillmp", "governance", "imports"],
        source_type: "skillmp",
        source_url: "https://example.com/skillmp-governance-pack",
        install_command: "npx skillsindex import skillmp-governance",
        content: "# SkillMP Governance Pack\n\nImported governance references and operating notes.",
        visibility: "public",
        owner_username: "admin",
        updated_at: "2026-03-14T09:10:00Z",
        star_count: 16,
        quality_score: 8.9
      },
      {
        id: 401,
        name: "Recovery Drill Planner",
        description: "Coordinate continuity rehearsals with evidence capture and rollback prompts.",
        category: "operations",
        subcategory: "recovery",
        tags: ["recovery", "drill", "continuity"],
        source_type: "manual",
        source_url: "",
        install_command: "npx skillsindex install recovery-drill-planner",
        content: "# Recovery Drill Planner\n\nCoordinate recovery rehearsal execution with RPO and RTO evidence capture.",
        visibility: "public",
        owner_username: "operator",
        updated_at: "2026-03-14T07:40:00Z",
        star_count: 96,
        quality_score: 8.8
      }
    ],
    skillFeedback: {
      "101": {
        favorite_count: 104,
        rating_count: 89,
        rating_average: 9.3,
        viewer_favorited: false,
        viewer_rating: 0,
        comments: [
          {
            id: 1,
            user_id: 2,
            username: "operator",
            display_name: "Operator",
            content: "Useful baseline for release coordination and evidence capture.",
            created_at: "2026-03-13T09:30:00Z"
          }
        ]
      },
      "302": {
        favorite_count: 18,
        rating_count: 12,
        rating_average: 8.8,
        viewer_favorited: false,
        viewer_rating: 0,
        comments: []
      },
      "401": {
        favorite_count: 44,
        rating_count: 26,
        rating_average: 8.8,
        viewer_favorited: false,
        viewer_rating: 0,
        comments: [
          {
            id: 2,
            user_id: 1,
            username: "admin",
            display_name: "Admin Operator",
            content: "Good template for quarterly continuity exercises.",
            created_at: "2026-03-12T16:00:00Z"
          }
        ]
      }
    },
    adminApiKeys: {
      total: 2,
      items: [
        {
          id: 501,
          user_id: 1,
          created_by: 1,
          owner_username: "admin",
          name: "Release Bot",
          purpose: "Production release automation",
          prefix: "adm_live_0501",
          scopes: ["skills.read", "skills.search.read"],
          status: "active",
          revoked_at: "",
          expires_at: "2026-06-30T08:00:00Z",
          last_rotated_at: "2026-03-10T08:00:00Z",
          last_used_at: "2026-03-14T10:10:00Z",
          created_at: "2026-02-10T08:00:00Z",
          updated_at: "2026-03-14T10:10:00Z"
        },
        {
          id: 502,
          user_id: 2,
          created_by: 1,
          owner_username: "operator",
          name: "Support Console",
          purpose: "Incident triage coverage",
          prefix: "adm_live_0502",
          scopes: ["skills.search.read"],
          status: "active",
          revoked_at: "",
          expires_at: "2026-07-15T09:00:00Z",
          last_rotated_at: "2026-03-08T10:00:00Z",
          last_used_at: "2026-03-14T09:20:00Z",
          created_at: "2026-02-18T09:00:00Z",
          updated_at: "2026-03-14T09:20:00Z"
        }
      ]
    },
    organizations: {
      total: 2,
      items: [
        { id: 11, name: "Core Platform", slug: "core-platform", created_at: "2026-01-10T08:00:00Z", updated_at: "2026-03-14T08:30:00Z" },
        { id: 12, name: "Trust and Safety", slug: "trust-and-safety", created_at: "2026-01-12T08:00:00Z", updated_at: "2026-03-14T09:10:00Z" }
      ]
    },
    organizationMembers: {
      "11": [
        {
          organization_id: 11,
          user_id: 1,
          username: "admin",
          user_role: "super_admin",
          user_status: "active",
          role: "owner",
          created_at: "2026-01-10T08:00:00Z",
          updated_at: "2026-03-14T08:30:00Z"
        },
        {
          organization_id: 11,
          user_id: 2,
          username: "operator",
          user_role: "admin",
          user_status: "active",
          role: "admin",
          created_at: "2026-01-11T08:00:00Z",
          updated_at: "2026-03-14T08:40:00Z"
        }
      ],
      "12": [
        {
          organization_id: 12,
          user_id: 3,
          username: "reviewer",
          user_role: "auditor",
          user_status: "disabled",
          role: "viewer",
          created_at: "2026-01-12T08:00:00Z",
          updated_at: "2026-03-14T09:10:00Z"
        }
      ]
    },
    integrations: {
      total: 2,
      items: [
        {
          id: 21,
          name: "GitHub App",
          provider: "github",
          description: "Repository sync and webhook ingestion.",
          base_url: "https://api.github.com",
          enabled: true,
          updated_at: "2026-03-14T09:15:00Z"
        },
        {
          id: 22,
          name: "Ops Webhook",
          provider: "webhook",
          description: "Outbound operational event delivery.",
          base_url: "https://hooks.example.com",
          enabled: false,
          updated_at: "2026-03-14T09:45:00Z"
        }
      ],
      webhook_total: 3,
      webhook_logs: [
        {
          id: 801,
          connector_id: 21,
          event_type: "repository.sync.completed",
          outcome: "ok",
          status_code: 200,
          endpoint: "https://api.github.com/app/hook",
          delivered_at: "2026-03-14T10:00:00Z"
        },
        {
          id: 802,
          connector_id: 22,
          event_type: "ops.alert.triggered",
          outcome: "failed",
          status_code: 502,
          endpoint: "https://hooks.example.com/ops",
          delivered_at: "2026-03-14T10:05:00Z"
        },
        {
          id: 803,
          connector_id: 21,
          event_type: "repository.sync.failed",
          outcome: "ok",
          status_code: 200,
          endpoint: "https://api.github.com/app/hook",
          delivered_at: "2026-03-14T10:08:00Z"
        }
      ]
    },
    moderationCases: {
      total: 2,
      items: [
        {
          id: 61,
          reporter_user_id: 2,
          resolver_user_id: 0,
          target_type: "skill",
          skill_id: 301,
          comment_id: 0,
          reason_code: "abuse",
          reason_detail: "Possible prompt injection content.",
          status: "open",
          action: "none",
          resolution_note: "",
          resolved_at: "",
          created_at: "2026-03-14T08:20:00Z",
          updated_at: "2026-03-14T08:20:00Z"
        },
        {
          id: 62,
          reporter_user_id: 3,
          resolver_user_id: 1,
          target_type: "comment",
          skill_id: 0,
          comment_id: 910,
          reason_code: "spam",
          reason_detail: "Repeated promotion links.",
          status: "resolved",
          action: "hidden",
          resolution_note: "Hidden and warned.",
          resolved_at: "2026-03-14T09:30:00Z",
          created_at: "2026-03-14T08:40:00Z",
          updated_at: "2026-03-14T09:30:00Z"
        }
      ]
    },
    ...createInitialOpsMockState()
  };
}
