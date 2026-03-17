export function createInitialOpsMockState() {
  return {
    opsAuditExport: {
      total: 4,
      items: [
        {
          occurred_at: "2026-03-14T09:45:00Z",
          actor_user_id: 1,
          action: "release.create",
          target_type: "release",
          target_id: "v2.3.0",
          note: "Production release evidence recorded."
        },
        {
          occurred_at: "2026-03-14T09:20:00Z",
          actor_user_id: 1,
          action: "backup_run.create",
          target_type: "backup_run",
          target_id: "daily-core",
          note: "Nightly backup run completed."
        },
        {
          occurred_at: "2026-03-14T08:55:00Z",
          actor_user_id: 2,
          action: "change_approval.create",
          target_type: "change_approval",
          target_id: "CHG-2301",
          note: "Emergency patch approval logged."
        },
        {
          occurred_at: "2026-03-14T08:10:00Z",
          actor_user_id: 1,
          action: "recovery_drill.record",
          target_type: "recovery_drill",
          target_id: "drill-2026-03-14",
          note: "Quarterly recovery drill validated."
        }
      ]
    },
    opsRecoveryDrills: {
      total: 2,
      items: [
        {
          logged_at: "2026-03-14T08:10:00Z",
          actor_user_id: 1,
          rpo_hours: 2,
          rto_hours: 4,
          passed: true,
          note: "Quarterly recovery drill validated."
        },
        {
          logged_at: "2026-03-07T08:10:00Z",
          actor_user_id: 2,
          rpo_hours: 6,
          rto_hours: 9,
          passed: false,
          note: "Storage failover exceeded target."
        }
      ]
    },
    opsReleases: {
      total: 2,
      items: [
        {
          released_at: "2026-03-14T09:45:00Z",
          actor_user_id: 1,
          version: "v2.3.0",
          environment: "production",
          change_ticket: "CHG-2301",
          status: "success",
          note: "Canary rollout promoted to production."
        },
        {
          released_at: "2026-03-10T13:00:00Z",
          actor_user_id: 2,
          version: "v2.2.4",
          environment: "staging",
          change_ticket: "CHG-2284",
          status: "rollback",
          note: "Schema compatibility issue triggered rollback."
        }
      ]
    },
    opsChangeApprovals: {
      total: 2,
      items: [
        {
          occurred_at: "2026-03-14T08:55:00Z",
          actor_user_id: 1,
          ticket_id: "CHG-2301",
          reviewer: "admin",
          status: "approved",
          note: "Approved after queue and backup checks."
        },
        {
          occurred_at: "2026-03-11T10:15:00Z",
          actor_user_id: 2,
          ticket_id: "CHG-2290",
          reviewer: "operator",
          status: "pending",
          note: "Awaiting database review sign-off."
        }
      ]
    },
    opsBackupPlans: {
      total: 2,
      items: [
        {
          logged_at: "2026-03-13T06:00:00Z",
          actor_user_id: 1,
          plan_key: "daily-core",
          backup_type: "full",
          schedule: "0 1 * * *",
          retention_days: 30,
          enabled: true,
          note: "Primary relational data backup."
        },
        {
          logged_at: "2026-03-12T06:00:00Z",
          actor_user_id: 2,
          plan_key: "weekly-archive",
          backup_type: "snapshot",
          schedule: "0 3 * * 0",
          retention_days: 90,
          enabled: false,
          note: "Cold archive snapshot retained for audits."
        }
      ]
    },
    opsBackupRuns: {
      total: 2,
      items: [
        {
          logged_at: "2026-03-14T09:20:00Z",
          actor_user_id: 1,
          plan_key: "daily-core",
          status: "success",
          size_mb: 768,
          duration_minutes: 22,
          note: "Nightly backup run completed."
        },
        {
          logged_at: "2026-03-13T09:20:00Z",
          actor_user_id: 2,
          plan_key: "weekly-archive",
          status: "failed",
          size_mb: 0,
          duration_minutes: 0,
          note: "Destination bucket permissions expired."
        }
      ]
    }
  };
}
