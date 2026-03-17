package services

import (
	"context"
	"fmt"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupOpsServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.AuditLog{}, &models.SyncJobRun{}, &models.AsyncJob{}); err != nil {
		t.Fatalf("failed to migrate ops models: %v", err)
	}
	return db
}

func TestOpsServiceBuildMetricsAndAlerts(t *testing.T) {
	db := setupOpsServiceTestDB(t)
	svc := NewOpsService(db)

	user := models.User{Username: "ops-user", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	now := time.Now().UTC()

	auditEntries := []models.AuditLog{
		{ActorUserID: &user.ID, Action: "integration_update", TargetType: "setting", Summary: "a", CreatedAt: now.Add(-5 * time.Minute)},
		{ActorUserID: &user.ID, Action: "audit_write_failed", TargetType: "audit", Summary: "b", CreatedAt: now.Add(-4 * time.Minute)},
		{ActorUserID: &user.ID, Action: "role_update", TargetType: "user", Summary: "c", CreatedAt: now.Add(-3 * time.Minute)},
	}
	for _, item := range auditEntries {
		if err := db.Create(&item).Error; err != nil {
			t.Fatalf("failed to create audit log: %v", err)
		}
	}

	syncRuns := []models.SyncJobRun{
		{
			Trigger:    "manual",
			Scope:      "all",
			Status:     "succeeded",
			Candidates: 5,
			Synced:     5,
			Failed:     0,
			StartedAt:  now.Add(-40 * time.Minute),
			FinishedAt: now.Add(-39 * time.Minute),
			DurationMs: 60000,
		},
		{
			Trigger:    "manual",
			Scope:      "all",
			Status:     "partial",
			Candidates: 5,
			Synced:     4,
			Failed:     1,
			StartedAt:  now.Add(-20 * time.Minute),
			FinishedAt: now.Add(-19 * time.Minute),
			DurationMs: 180000,
		},
	}
	for _, item := range syncRuns {
		if err := db.Create(&item).Error; err != nil {
			t.Fatalf("failed to create sync run: %v", err)
		}
	}

	if err := db.Create(&models.AsyncJob{
		JobType:       models.AsyncJobTypeSyncRepository,
		Status:        models.AsyncJobStatusPending,
		Attempt:       1,
		MaxAttempts:   3,
		PayloadDigest: "ops-signal",
		CreatedAt:     now.Add(-2 * time.Minute),
		UpdatedAt:     now.Add(-2 * time.Minute),
	}).Error; err != nil {
		t.Fatalf("failed to create async job: %v", err)
	}

	metrics, err := svc.BuildMetrics(context.Background(), now)
	if err != nil {
		t.Fatalf("failed to build metrics: %v", err)
	}
	if metrics.TotalAuditLogs24h != 3 {
		t.Fatalf("unexpected total audit logs: got=%d want=3", metrics.TotalAuditLogs24h)
	}
	if metrics.TotalSyncRuns24h != 2 {
		t.Fatalf("unexpected total sync runs: got=%d want=2", metrics.TotalSyncRuns24h)
	}
	if metrics.FailedSyncRuns24h != 1 {
		t.Fatalf("unexpected failed sync runs: got=%d want=1", metrics.FailedSyncRuns24h)
	}
	if metrics.SyncSuccessRate <= 0 || metrics.SyncSuccessRate >= 100 {
		t.Fatalf("unexpected sync success rate: %v", metrics.SyncSuccessRate)
	}
	if metrics.LatencyP95Ms <= 0 {
		t.Fatalf("expected positive latency p95")
	}
	if metrics.RequestQPS <= 0 {
		t.Fatalf("expected positive request qps proxy")
	}
	if metrics.AuditWriteFailureRate <= 0 {
		t.Fatalf("expected positive audit write failure rate")
	}

	alerts, err := svc.BuildAlerts(context.Background(), now)
	if err != nil {
		t.Fatalf("failed to build alerts: %v", err)
	}
	if len(alerts) == 0 {
		t.Fatalf("expected baseline alerts")
	}
}

func TestOpsServiceExportAudit(t *testing.T) {
	db := setupOpsServiceTestDB(t)
	svc := NewOpsService(db)

	user := models.User{Username: "audit-exporter", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	now := time.Now().UTC()
	if err := db.Create(&models.AuditLog{
		ActorUserID: &user.ID,
		Action:      "user_update_role",
		TargetType:  "user",
		TargetID:    user.ID,
		RequestID:   "req-export-123",
		Result:      "success",
		Reason:      "role escalation approved",
		SourceIP:    "10.20.30.40",
		Summary:     "role updated",
		Details:     `{"from":"member","to":"admin"}`,
		CreatedAt:   now.Add(-10 * time.Minute),
	}).Error; err != nil {
		t.Fatalf("failed to create audit log: %v", err)
	}

	rawJSON, contentTypeJSON, filenameJSON, err := svc.ExportAudit(context.Background(), AuditExportInput{
		From:   now.Add(-1 * time.Hour),
		To:     now,
		Format: "json",
	})
	if err != nil {
		t.Fatalf("failed to export json audit: %v", err)
	}
	if !strings.Contains(contentTypeJSON, "application/json") {
		t.Fatalf("unexpected json content type: %s", contentTypeJSON)
	}
	if filenameJSON != "audit-export.json" {
		t.Fatalf("unexpected json filename: %s", filenameJSON)
	}
	if !strings.Contains(string(rawJSON), "user_update_role") {
		t.Fatalf("expected action in json export")
	}
	if !strings.Contains(string(rawJSON), "\"request_id\": \"req-export-123\"") {
		t.Fatalf("expected request_id in json export")
	}
	if !strings.Contains(string(rawJSON), "\"result\": \"success\"") {
		t.Fatalf("expected result in json export")
	}
	if !strings.Contains(string(rawJSON), "\"reason\": \"role escalation approved\"") {
		t.Fatalf("expected reason in json export")
	}
	if !strings.Contains(string(rawJSON), "\"source_ip\": \"10.20.30.40\"") {
		t.Fatalf("expected source_ip in json export")
	}

	rawCSV, contentTypeCSV, filenameCSV, err := svc.ExportAudit(context.Background(), AuditExportInput{
		From:   now.Add(-1 * time.Hour),
		To:     now,
		Format: "csv",
	})
	if err != nil {
		t.Fatalf("failed to export csv audit: %v", err)
	}
	if !strings.Contains(contentTypeCSV, "text/csv") {
		t.Fatalf("unexpected csv content type: %s", contentTypeCSV)
	}
	if filenameCSV != "audit-export.csv" {
		t.Fatalf("unexpected csv filename: %s", filenameCSV)
	}
	if !strings.Contains(string(rawCSV), "action") || !strings.Contains(string(rawCSV), "user_update_role") {
		t.Fatalf("expected header and action in csv export")
	}
	if !strings.Contains(string(rawCSV), "request_id") || !strings.Contains(string(rawCSV), "req-export-123") {
		t.Fatalf("expected request_id header and value in csv export")
	}
	if !strings.Contains(string(rawCSV), "result") || !strings.Contains(string(rawCSV), "success") {
		t.Fatalf("expected result header and value in csv export")
	}
	if !strings.Contains(string(rawCSV), "reason") || !strings.Contains(string(rawCSV), "role escalation approved") {
		t.Fatalf("expected reason header and value in csv export")
	}
	if !strings.Contains(string(rawCSV), "source_ip") || !strings.Contains(string(rawCSV), "10.20.30.40") {
		t.Fatalf("expected source_ip header and value in csv export")
	}
}

func TestOpsServiceReleaseGatesAndRecoveryDrills(t *testing.T) {
	db := setupOpsServiceTestDB(t)
	svc := NewOpsService(db)

	user := models.User{Username: "ops-gate-admin", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	now := time.Now().UTC()
	record, err := svc.RecordRecoveryDrill(context.Background(), user.ID, RecordRecoveryDrillInput{
		RPOHours:   0.8,
		RTOHours:   3.2,
		Note:       "monthly recovery drill",
		OccurredAt: now.Add(-2 * time.Hour),
	})
	if err != nil {
		t.Fatalf("failed to record recovery drill: %v", err)
	}
	if !record.Passed {
		t.Fatalf("expected drill record to satisfy SLA")
	}

	drills, err := svc.ListRecoveryDrills(context.Background(), 10)
	if err != nil {
		t.Fatalf("failed to list recovery drills: %v", err)
	}
	if len(drills) != 1 {
		t.Fatalf("unexpected recovery drill count: got=%d want=1", len(drills))
	}
	if drills[0].RPOHours != 0.8 || drills[0].RTOHours != 3.2 {
		t.Fatalf("unexpected recovery drill values: %#v", drills[0])
	}

	gates, err := svc.BuildReleaseGates(context.Background(), now)
	if err != nil {
		t.Fatalf("failed to build release gates: %v", err)
	}
	if !gates.Passed {
		t.Fatalf("expected release gates to pass, got failed: %#v", gates)
	}
	if len(gates.Checks) == 0 {
		t.Fatalf("expected non-empty release gate checks")
	}
}

func TestOpsServiceReleaseGatesFailForStaleRecoveryDrill(t *testing.T) {
	db := setupOpsServiceTestDB(t)
	svc := NewOpsService(db)

	user := models.User{Username: "ops-gate-stale", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	now := time.Now().UTC()
	_, err := svc.RecordRecoveryDrill(context.Background(), user.ID, RecordRecoveryDrillInput{
		RPOHours:   0.5,
		RTOHours:   2.5,
		Note:       "old recovery drill",
		OccurredAt: now.Add(-45 * 24 * time.Hour),
	})
	if err != nil {
		t.Fatalf("failed to record stale recovery drill: %v", err)
	}

	gates, err := svc.BuildReleaseGates(context.Background(), now)
	if err != nil {
		t.Fatalf("failed to build release gates: %v", err)
	}
	if gates.Passed {
		t.Fatalf("expected release gates to fail when drill is stale")
	}

	foundRecovery := false
	for _, check := range gates.Checks {
		if check.Code != "OPS-GATE-RECOVERY-DRILL" {
			continue
		}
		foundRecovery = true
		if check.Passed {
			t.Fatalf("expected recovery drill check to fail for stale record")
		}
	}
	if !foundRecovery {
		t.Fatalf("missing recovery drill gate check")
	}
}

func TestOpsServiceReleaseAndApprovalRecords(t *testing.T) {
	db := setupOpsServiceTestDB(t)
	svc := NewOpsService(db)

	user := models.User{Username: "ops-change-admin", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	now := time.Now().UTC()

	releaseRecord, err := svc.RecordRelease(context.Background(), user.ID, RecordReleaseInput{
		Version:      "v2026.02.25",
		Environment:  "production",
		ChangeTicket: "CHG-20260225",
		Status:       "released",
		Note:         "ops release gate passed",
		ReleasedAt:   now.Add(-30 * time.Minute),
	})
	if err != nil {
		t.Fatalf("failed to record release: %v", err)
	}
	if releaseRecord.Version != "v2026.02.25" {
		t.Fatalf("unexpected release version: %#v", releaseRecord)
	}

	approvalRecord, err := svc.RecordChangeApproval(context.Background(), user.ID, RecordChangeApprovalInput{
		TicketID:   "CHG-20260225",
		Reviewer:   "sec-reviewer",
		Status:     "approved",
		Note:       "security and ops approved",
		OccurredAt: now.Add(-40 * time.Minute),
	})
	if err != nil {
		t.Fatalf("failed to record change approval: %v", err)
	}
	if approvalRecord.Status != "approved" {
		t.Fatalf("unexpected change approval status: %#v", approvalRecord)
	}

	releases, err := svc.ListReleases(context.Background(), 10)
	if err != nil {
		t.Fatalf("failed to list releases: %v", err)
	}
	if len(releases) != 1 {
		t.Fatalf("unexpected release record count: got=%d want=1", len(releases))
	}
	if releases[0].ChangeTicket != "CHG-20260225" {
		t.Fatalf("unexpected release ticket: %#v", releases[0])
	}

	approvals, err := svc.ListChangeApprovals(context.Background(), 10)
	if err != nil {
		t.Fatalf("failed to list change approvals: %v", err)
	}
	if len(approvals) != 1 {
		t.Fatalf("unexpected approval record count: got=%d want=1", len(approvals))
	}
	if approvals[0].TicketID != "CHG-20260225" {
		t.Fatalf("unexpected approval ticket: %#v", approvals[0])
	}
}

func TestOpsServiceBackupPlanAndRunRecords(t *testing.T) {
	db := setupOpsServiceTestDB(t)
	svc := NewOpsService(db)

	user := models.User{Username: "ops-backup-admin", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	now := time.Now().UTC()

	planRecord, err := svc.UpsertBackupPlan(context.Background(), user.ID, UpsertBackupPlanInput{
		PlanKey:       "daily-full",
		BackupType:    "full",
		Schedule:      "0 2 * * *",
		RetentionDays: 30,
		Enabled:       true,
		Note:          "daily full backup at 02:00",
		OccurredAt:    now.Add(-2 * time.Hour),
	})
	if err != nil {
		t.Fatalf("failed to upsert backup plan: %v", err)
	}
	if planRecord.PlanKey != "daily-full" {
		t.Fatalf("unexpected backup plan: %#v", planRecord)
	}

	runRecord, err := svc.RecordBackupRun(context.Background(), user.ID, RecordBackupRunInput{
		PlanKey:         "daily-full",
		Status:          "succeeded",
		SizeMB:          2048.5,
		DurationMinutes: 42.3,
		Note:            "backup run completed",
		OccurredAt:      now.Add(-1 * time.Hour),
	})
	if err != nil {
		t.Fatalf("failed to record backup run: %v", err)
	}
	if runRecord.Status != "succeeded" {
		t.Fatalf("unexpected backup run status: %#v", runRecord)
	}

	plans, err := svc.ListBackupPlans(context.Background(), 10)
	if err != nil {
		t.Fatalf("failed to list backup plans: %v", err)
	}
	if len(plans) != 1 {
		t.Fatalf("unexpected backup plan count: got=%d want=1", len(plans))
	}
	if !plans[0].Enabled {
		t.Fatalf("expected backup plan enabled: %#v", plans[0])
	}

	runs, err := svc.ListBackupRuns(context.Background(), 10)
	if err != nil {
		t.Fatalf("failed to list backup runs: %v", err)
	}
	if len(runs) != 1 {
		t.Fatalf("unexpected backup run count: got=%d want=1", len(runs))
	}
	if runs[0].PlanKey != "daily-full" {
		t.Fatalf("unexpected backup run plan key: %#v", runs[0])
	}
}
