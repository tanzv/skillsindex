package services

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAsyncJobServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.SyncJobRun{}, &models.AsyncJob{}); err != nil {
		t.Fatalf("failed to migrate async job models: %v", err)
	}
	return db
}

func TestAsyncJobServiceCreateStartAndComplete(t *testing.T) {
	db := setupAsyncJobServiceTestDB(t)
	svc := NewAsyncJobService(db)

	owner := models.User{Username: "job-owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	actor := models.User{Username: "job-actor", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&actor).Error; err != nil {
		t.Fatalf("failed to create actor: %v", err)
	}

	now := time.Now().UTC()
	created, deduped, err := svc.CreateOrGetActive(context.Background(), CreateAsyncJobInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		OwnerUserID:   &owner.ID,
		ActorUserID:   &actor.ID,
		MaxAttempts:   3,
		PayloadDigest: "digest-sync-owner-1",
	}, now)
	if err != nil {
		t.Fatalf("failed to create async job: %v", err)
	}
	if deduped {
		t.Fatalf("expected first create not to dedupe")
	}
	if created.Status != models.AsyncJobStatusPending {
		t.Fatalf("unexpected status: got=%s want=%s", created.Status, models.AsyncJobStatusPending)
	}
	if created.Attempt != 1 {
		t.Fatalf("unexpected attempt: got=%d want=1", created.Attempt)
	}

	running, err := svc.Start(context.Background(), created.ID, now.Add(2*time.Second))
	if err != nil {
		t.Fatalf("failed to start async job: %v", err)
	}
	if running.Status != models.AsyncJobStatusRunning {
		t.Fatalf("unexpected running status: got=%s want=%s", running.Status, models.AsyncJobStatusRunning)
	}
	if running.StartedAt == nil {
		t.Fatalf("expected started_at to be set")
	}

	succeeded, err := svc.MarkSucceeded(context.Background(), created.ID, now.Add(5*time.Second))
	if err != nil {
		t.Fatalf("failed to mark async job succeeded: %v", err)
	}
	if succeeded.Status != models.AsyncJobStatusSucceeded {
		t.Fatalf("unexpected succeeded status: got=%s want=%s", succeeded.Status, models.AsyncJobStatusSucceeded)
	}
	if succeeded.FinishedAt == nil {
		t.Fatalf("expected finished_at to be set")
	}
	if succeeded.ErrorCode != "" || succeeded.ErrorMessage != "" {
		t.Fatalf("expected success to clear error fields")
	}
}

func TestAsyncJobServiceRetryAndCancel(t *testing.T) {
	db := setupAsyncJobServiceTestDB(t)
	svc := NewAsyncJobService(db)

	owner := models.User{Username: "retry-owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}
	operator := models.User{Username: "retry-operator", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&operator).Error; err != nil {
		t.Fatalf("failed to create operator: %v", err)
	}

	now := time.Now().UTC()
	created, _, err := svc.CreateOrGetActive(context.Background(), CreateAsyncJobInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		OwnerUserID:   &owner.ID,
		ActorUserID:   &operator.ID,
		MaxAttempts:   3,
		PayloadDigest: "digest-retry-owner-1",
	}, now)
	if err != nil {
		t.Fatalf("failed to create async job: %v", err)
	}

	if _, err := svc.Start(context.Background(), created.ID, now.Add(1*time.Second)); err != nil {
		t.Fatalf("failed to start async job: %v", err)
	}
	failed, err := svc.MarkFailed(context.Background(), created.ID, "clone_failed", "clone timeout", now.Add(3*time.Second))
	if err != nil {
		t.Fatalf("failed to mark async job failed: %v", err)
	}
	if failed.Status != models.AsyncJobStatusFailed {
		t.Fatalf("unexpected failed status: got=%s want=%s", failed.Status, models.AsyncJobStatusFailed)
	}

	retried, err := svc.Retry(context.Background(), created.ID, operator.ID, now.Add(5*time.Second))
	if err != nil {
		t.Fatalf("failed to retry async job: %v", err)
	}
	if retried.Status != models.AsyncJobStatusPending {
		t.Fatalf("unexpected retry status: got=%s want=%s", retried.Status, models.AsyncJobStatusPending)
	}
	if retried.Attempt != 2 {
		t.Fatalf("unexpected retry attempt: got=%d want=2", retried.Attempt)
	}

	canceled, err := svc.Cancel(context.Background(), created.ID, operator.ID, now.Add(6*time.Second))
	if err != nil {
		t.Fatalf("failed to cancel async job: %v", err)
	}
	if canceled.Status != models.AsyncJobStatusCanceled {
		t.Fatalf("unexpected canceled status: got=%s want=%s", canceled.Status, models.AsyncJobStatusCanceled)
	}
	if canceled.CanceledByUserID == nil || *canceled.CanceledByUserID != operator.ID {
		t.Fatalf("expected canceled_by_user_id to be operator")
	}
}

func TestAsyncJobServiceCreateOrGetActiveIdempotent(t *testing.T) {
	db := setupAsyncJobServiceTestDB(t)
	svc := NewAsyncJobService(db)

	owner := models.User{Username: "dedupe-owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}

	now := time.Now().UTC()
	first, deduped, err := svc.CreateOrGetActive(context.Background(), CreateAsyncJobInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		OwnerUserID:   &owner.ID,
		MaxAttempts:   3,
		PayloadDigest: "digest-dedupe-owner-1",
	}, now)
	if err != nil {
		t.Fatalf("failed to create first async job: %v", err)
	}
	if deduped {
		t.Fatalf("expected first creation not deduped")
	}

	second, deduped, err := svc.CreateOrGetActive(context.Background(), CreateAsyncJobInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		OwnerUserID:   &owner.ID,
		MaxAttempts:   3,
		PayloadDigest: "digest-dedupe-owner-1",
	}, now.Add(1*time.Second))
	if err != nil {
		t.Fatalf("failed to create second async job: %v", err)
	}
	if !deduped {
		t.Fatalf("expected second creation to dedupe active job")
	}
	if first.ID != second.ID {
		t.Fatalf("expected deduped job id match: first=%d second=%d", first.ID, second.ID)
	}
}

func TestAsyncJobServiceGetByIDNotFound(t *testing.T) {
	db := setupAsyncJobServiceTestDB(t)
	svc := NewAsyncJobService(db)

	_, err := svc.GetByID(context.Background(), 999)
	if !errors.Is(err, ErrAsyncJobNotFound) {
		t.Fatalf("expected ErrAsyncJobNotFound, got=%v", err)
	}
}

func TestAsyncJobServiceCreatePersistsSyncRunReference(t *testing.T) {
	db := setupAsyncJobServiceTestDB(t)
	svc := NewAsyncJobService(db)

	run := models.SyncJobRun{
		Trigger:     "manual",
		TriggerType: "manual",
		Scope:       "all",
		Status:      "pending",
		StartedAt:   time.Now().UTC(),
		FinishedAt:  time.Now().UTC(),
	}
	if err := db.Create(&run).Error; err != nil {
		t.Fatalf("failed to create sync run: %v", err)
	}

	created, _, err := svc.CreateOrGetActive(context.Background(), CreateAsyncJobInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		SyncRunID:     &run.ID,
		MaxAttempts:   3,
		PayloadDigest: "digest-run-link-1",
	}, time.Now().UTC())
	if err != nil {
		t.Fatalf("failed to create async job: %v", err)
	}
	if created.SyncRunID == nil || *created.SyncRunID != run.ID {
		t.Fatalf("expected sync run id to be persisted")
	}
}

func TestAsyncJobServiceAttachSyncRun(t *testing.T) {
	db := setupAsyncJobServiceTestDB(t)
	svc := NewAsyncJobService(db)

	run := models.SyncJobRun{
		Trigger:     "manual",
		TriggerType: "manual",
		Scope:       "all",
		Status:      SyncRunStatusRunning,
		StartedAt:   time.Now().UTC(),
		FinishedAt:  time.Now().UTC(),
	}
	if err := db.Create(&run).Error; err != nil {
		t.Fatalf("failed to create sync run: %v", err)
	}

	created, _, err := svc.CreateOrGetActive(context.Background(), CreateAsyncJobInput{
		JobType:       models.AsyncJobTypeSyncRepository,
		MaxAttempts:   3,
		PayloadDigest: "digest-attach-run-1",
	}, time.Now().UTC())
	if err != nil {
		t.Fatalf("failed to create async job: %v", err)
	}

	attached, err := svc.AttachSyncRun(context.Background(), created.ID, run.ID)
	if err != nil {
		t.Fatalf("failed to attach sync run: %v", err)
	}
	if attached.SyncRunID == nil || *attached.SyncRunID != run.ID {
		t.Fatalf("expected attached sync run id to be persisted")
	}
}
