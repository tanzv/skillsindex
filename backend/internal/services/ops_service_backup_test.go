package services

import (
	"context"
	"testing"
	"time"

	"skillsindex/internal/models"
)

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
