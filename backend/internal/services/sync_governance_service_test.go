package services

import (
	"context"
	"fmt"
	"testing"
	"time"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupSyncGovernanceServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.Tag{},
		&models.Skill{},
		&models.SkillTag{},
		&models.SyncPolicy{},
		&models.SyncJobRun{},
		&models.AsyncJob{},
		&models.SkillVersion{},
		&models.AuditLog{},
	); err != nil {
		t.Fatalf("failed to migrate sync governance models: %v", err)
	}
	return db
}

func TestSyncGovernanceServiceStartAndCompleteSuccessCapturesVersionAndAudit(t *testing.T) {
	db := setupSyncGovernanceServiceTestDB(t)
	skillSvc := NewSkillService(db)
	versionSvc := NewSkillVersionService(db)
	asyncSvc := NewAsyncJobService(db)
	runSvc := NewSyncJobService(db)
	auditSvc := NewAuditService(db)
	governanceSvc := NewSyncGovernanceService(asyncSvc, runSvc, versionSvc, auditSvc)

	owner := models.User{Username: "governance-owner", PasswordHash: "hash", Role: models.RoleMember}
	actor := models.User{Username: "governance-actor", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&actor).Error; err != nil {
		t.Fatalf("failed to create actor: %v", err)
	}

	skill, err := skillSvc.CreateSkill(context.Background(), CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Governed Skill",
		Description:  "before sync",
		Content:      "content before",
		Tags:         []string{"governance"},
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	startedAt := time.Now().UTC()
	execution, err := governanceSvc.Start(context.Background(), StartSyncGovernanceInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		Trigger:       "manual",
		TriggerType:   "manual",
		Scope:         "single",
		TargetSkillID: &skill.ID,
		OwnerUserID:   &owner.ID,
		ActorUserID:   &actor.ID,
		PayloadDigest: "governance-success-1",
		StartedAt:     startedAt,
	})
	if err != nil {
		t.Fatalf("failed to start governed execution: %v", err)
	}
	if execution.Deduped {
		t.Fatalf("expected first execution not to be deduped")
	}
	if execution.Job.Status != models.AsyncJobStatusRunning {
		t.Fatalf("unexpected job status: got=%s want=%s", execution.Job.Status, models.AsyncJobStatusRunning)
	}
	if execution.Run.Status != SyncRunStatusRunning {
		t.Fatalf("unexpected run status: got=%s want=%s", execution.Run.Status, SyncRunStatusRunning)
	}
	if execution.Job.SyncRunID == nil || *execution.Job.SyncRunID != execution.Run.ID {
		t.Fatalf("expected job to link sync run")
	}

	completed, err := governanceSvc.Complete(context.Background(), CompleteSyncGovernanceInput{
		RunID:                 execution.Run.ID,
		JobID:                 execution.Job.ID,
		Candidates:            1,
		Synced:                1,
		FinishedAt:            startedAt.Add(5 * time.Second),
		CaptureVersionSkillID: &skill.ID,
		VersionTrigger:        "sync",
		ActorUserID:           &actor.ID,
		AuditAction:           "sync_governance_success",
		AuditTargetType:       "skill",
		AuditTargetID:         skill.ID,
		AuditSummary:          "Completed governed sync",
	})
	if err != nil {
		t.Fatalf("failed to complete governed execution: %v", err)
	}
	if completed.Job.Status != models.AsyncJobStatusSucceeded {
		t.Fatalf("unexpected completed job status: got=%s want=%s", completed.Job.Status, models.AsyncJobStatusSucceeded)
	}
	if completed.Run.Status != SyncRunStatusSucceeded {
		t.Fatalf("unexpected completed run status: got=%s want=%s", completed.Run.Status, SyncRunStatusSucceeded)
	}

	versions, err := versionSvc.ListBySkill(context.Background(), ListSkillVersionsInput{SkillID: skill.ID, Limit: 10})
	if err != nil {
		t.Fatalf("failed to list versions: %v", err)
	}
	if len(versions) == 0 {
		t.Fatalf("expected at least one version snapshot")
	}
	latest := versions[0]
	if latest.RunID == nil || *latest.RunID != execution.Run.ID {
		t.Fatalf("expected latest version to link run id")
	}

	logs, err := auditSvc.ListRecent(context.Background(), ListAuditInput{ActorUserID: actor.ID, Limit: 10})
	if err != nil {
		t.Fatalf("failed to list audit logs: %v", err)
	}
	if len(logs) == 0 {
		t.Fatalf("expected one audit log")
	}
	if logs[0].Action != "sync_governance_success" {
		t.Fatalf("unexpected audit action: %s", logs[0].Action)
	}
}

func TestSyncGovernanceServiceRetryCreatesNewRunAttemptWithoutCapturingVersionOnFailure(t *testing.T) {
	db := setupSyncGovernanceServiceTestDB(t)
	skillSvc := NewSkillService(db)
	versionSvc := NewSkillVersionService(db)
	asyncSvc := NewAsyncJobService(db)
	runSvc := NewSyncJobService(db)
	auditSvc := NewAuditService(db)
	governanceSvc := NewSyncGovernanceService(asyncSvc, runSvc, versionSvc, auditSvc)

	owner := models.User{Username: "retry-owner", PasswordHash: "hash", Role: models.RoleMember}
	actor := models.User{Username: "retry-actor", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	if err := db.Create(&actor).Error; err != nil {
		t.Fatalf("failed to create actor: %v", err)
	}

	skill, err := skillSvc.CreateSkill(context.Background(), CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Retry Skill",
		Description:  "retry flow",
		Content:      "retry content",
		Tags:         []string{"retry"},
		Visibility:   models.VisibilityPrivate,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}
	initialVersions, err := versionSvc.ListBySkill(context.Background(), ListSkillVersionsInput{SkillID: skill.ID, Limit: 10})
	if err != nil {
		t.Fatalf("failed to list initial versions: %v", err)
	}

	started, err := governanceSvc.Start(context.Background(), StartSyncGovernanceInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		Trigger:       "manual",
		TriggerType:   "manual",
		Scope:         "single",
		TargetSkillID: &skill.ID,
		OwnerUserID:   &owner.ID,
		ActorUserID:   &actor.ID,
		PayloadDigest: "governance-retry-1",
		StartedAt:     time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to start execution: %v", err)
	}

	failed, err := governanceSvc.Complete(context.Background(), CompleteSyncGovernanceInput{
		RunID:           started.Run.ID,
		JobID:           started.Job.ID,
		Candidates:      1,
		Failed:          1,
		FinishedAt:      time.Now().UTC().Add(3 * time.Second),
		ErrorCode:       "clone_failed",
		ErrorMessage:    "clone timeout",
		ErrorSummary:    "clone timeout",
		ActorUserID:     &actor.ID,
		AuditAction:     "sync_governance_failed",
		AuditTargetType: "skill",
		AuditTargetID:   skill.ID,
		AuditSummary:    "Governed sync failed",
	})
	if err != nil {
		t.Fatalf("failed to mark execution failed: %v", err)
	}
	if failed.Job.Status != models.AsyncJobStatusFailed {
		t.Fatalf("unexpected failed job status: %s", failed.Job.Status)
	}
	if failed.Run.Status != SyncRunStatusFailed {
		t.Fatalf("unexpected failed run status: %s", failed.Run.Status)
	}

	versionsAfterFailure, err := versionSvc.ListBySkill(context.Background(), ListSkillVersionsInput{SkillID: skill.ID, Limit: 10})
	if err != nil {
		t.Fatalf("failed to list versions after failure: %v", err)
	}
	if len(versionsAfterFailure) != len(initialVersions) {
		t.Fatalf("expected no new version on failure: before=%d after=%d", len(initialVersions), len(versionsAfterFailure))
	}

	retried, err := governanceSvc.Retry(context.Background(), started.Job.ID, RetrySyncGovernanceInput{
		ActorUserID:  actor.ID,
		StartedAt:    time.Now().UTC().Add(5 * time.Second),
		AuditAction:  "sync_governance_retry",
		AuditSummary: "Retried governed sync",
	})
	if err != nil {
		t.Fatalf("failed to retry execution: %v", err)
	}
	if retried.Job.ID != started.Job.ID {
		t.Fatalf("expected retry to keep async job lineage")
	}
	if retried.Job.Attempt != 2 {
		t.Fatalf("unexpected retry attempt: got=%d want=2", retried.Job.Attempt)
	}
	if retried.Run.ID == started.Run.ID {
		t.Fatalf("expected retry to create a new run attempt")
	}
	if retried.Run.Attempt != 2 {
		t.Fatalf("unexpected retry run attempt: got=%d want=2", retried.Run.Attempt)
	}
	if retried.Run.TriggerType != SyncRunTriggerTypeRetry {
		t.Fatalf("unexpected retry trigger type: %s", retried.Run.TriggerType)
	}
	if retried.Job.SyncRunID == nil || *retried.Job.SyncRunID != retried.Run.ID {
		t.Fatalf("expected retry job to point at latest run")
	}
}

func TestSyncGovernanceServiceStartScheduledNormalizesTriggerType(t *testing.T) {
	db := setupSyncGovernanceServiceTestDB(t)
	asyncSvc := NewAsyncJobService(db)
	runSvc := NewSyncJobService(db)
	governanceSvc := NewSyncGovernanceService(asyncSvc, runSvc, nil, nil)

	execution, err := governanceSvc.Start(context.Background(), StartSyncGovernanceInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		Trigger:       "tick",
		Scope:         "all",
		PayloadDigest: "governance-scheduled-1",
		StartedAt:     time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to start scheduled execution: %v", err)
	}
	if execution.Run.TriggerType != SyncRunTriggerTypeScheduled {
		t.Fatalf("unexpected trigger type: got=%s want=%s", execution.Run.TriggerType, SyncRunTriggerTypeScheduled)
	}
}
