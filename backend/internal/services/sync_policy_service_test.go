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

func setupSyncPolicyServiceTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.SyncPolicy{}); err != nil {
		t.Fatalf("failed to migrate sync policy models: %v", err)
	}
	return db
}

func TestSyncPolicyServiceCreateListUpdateAndDelete(t *testing.T) {
	db := setupSyncPolicyServiceTestDB(t)
	svc := NewSyncPolicyService(db)

	actor := models.User{Username: "policy-admin", PasswordHash: "hash", Role: models.RoleAdmin}
	if err := db.Create(&actor).Error; err != nil {
		t.Fatalf("failed to create actor: %v", err)
	}

	created, err := svc.Create(context.Background(), CreateSyncPolicyInput{
		PolicyName:      "Repository Sync Default",
		TargetScope:     "source:repository",
		SourceType:      models.SyncPolicySourceRepository,
		IntervalMinutes: 30,
		TimeoutMinutes:  10,
		BatchSize:       20,
		Timezone:        "Asia/Shanghai",
		Enabled:         true,
		MaxRetry:        3,
		RetryBackoff:    "5s,30s,120s",
		CreatedByUserID: &actor.ID,
	})
	if err != nil {
		t.Fatalf("failed to create sync policy: %v", err)
	}
	if created.PolicyName != "Repository Sync Default" {
		t.Fatalf("unexpected policy name: %s", created.PolicyName)
	}
	if created.SourceType != models.SyncPolicySourceRepository {
		t.Fatalf("unexpected source type: %s", created.SourceType)
	}

	items, err := svc.List(context.Background(), ListSyncPoliciesInput{Limit: 10})
	if err != nil {
		t.Fatalf("failed to list policies: %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("unexpected policy count: got=%d want=1", len(items))
	}

	updatedName := "Repository Sync Hot Path"
	updatedRetry := 5
	updatedEnabled := false
	updatedTimeout := 12
	updatedBatchSize := 44
	updated, err := svc.Update(context.Background(), created.ID, UpdateSyncPolicyInput{
		PolicyName:      &updatedName,
		TimeoutMinutes:  &updatedTimeout,
		BatchSize:       &updatedBatchSize,
		MaxRetry:        &updatedRetry,
		Enabled:         &updatedEnabled,
		UpdatedByUserID: &actor.ID,
	})
	if err != nil {
		t.Fatalf("failed to update policy: %v", err)
	}
	if updated.PolicyName != updatedName || updated.MaxRetry != updatedRetry || updated.Enabled || updated.TimeoutMinutes != updatedTimeout || updated.BatchSize != updatedBatchSize {
		t.Fatalf("unexpected updated policy: %#v", updated)
	}

	deleted, err := svc.SoftDelete(context.Background(), created.ID, &actor.ID)
	if err != nil {
		t.Fatalf("failed to soft delete policy: %v", err)
	}
	if deleted.DeletedAt == nil {
		t.Fatalf("expected deleted_at to be set")
	}
	if deleted.Enabled {
		t.Fatalf("expected deleted policy to be disabled")
	}

	visibleItems, err := svc.List(context.Background(), ListSyncPoliciesInput{Limit: 10})
	if err != nil {
		t.Fatalf("failed to list visible policies: %v", err)
	}
	if len(visibleItems) != 0 {
		t.Fatalf("unexpected visible policy count after delete: got=%d want=0", len(visibleItems))
	}
}

func TestSyncPolicyServiceCreateRejectsInvalidPayload(t *testing.T) {
	db := setupSyncPolicyServiceTestDB(t)
	svc := NewSyncPolicyService(db)

	if _, err := svc.Create(context.Background(), CreateSyncPolicyInput{
		PolicyName:  "",
		TargetScope: "source:repository",
		SourceType:  models.SyncPolicySourceRepository,
	}); err == nil {
		t.Fatalf("expected create to reject empty policy name")
	}

	if _, err := svc.Create(context.Background(), CreateSyncPolicyInput{
		PolicyName:      "Invalid Source",
		TargetScope:     "source:custom",
		SourceType:      models.SyncPolicySourceType("custom"),
		IntervalMinutes: 10,
		Timezone:        "UTC",
	}); err == nil {
		t.Fatalf("expected create to reject invalid source type")
	}
}

func TestSyncPolicyServiceUpsertRepositoryMirror(t *testing.T) {
	db := setupSyncPolicyServiceTestDB(t)
	svc := NewSyncPolicyService(db)

	created, err := svc.UpsertRepositoryMirror(context.Background(), RepositorySyncPolicy{
		Enabled:   true,
		Interval:  45 * time.Minute,
		Timeout:   12 * time.Minute,
		BatchSize: 33,
	}, nil)
	if err != nil {
		t.Fatalf("failed to create repository mirror: %v", err)
	}
	if created.TargetScope != RepositorySyncPolicyMirrorTargetScope {
		t.Fatalf("unexpected mirror target scope: %#v", created)
	}
	if created.IntervalMinutes != 45 || created.TimeoutMinutes != 12 || created.BatchSize != 33 {
		t.Fatalf("unexpected created mirror values: %#v", created)
	}

	updated, err := svc.UpsertRepositoryMirror(context.Background(), RepositorySyncPolicy{
		Enabled:   false,
		Interval:  30 * time.Minute,
		Timeout:   8 * time.Minute,
		BatchSize: 21,
	}, nil)
	if err != nil {
		t.Fatalf("failed to update repository mirror: %v", err)
	}
	if updated.ID != created.ID {
		t.Fatalf("expected mirror upsert to reuse existing record: got=%d want=%d", updated.ID, created.ID)
	}
	if updated.Enabled || updated.IntervalMinutes != 30 || updated.TimeoutMinutes != 8 || updated.BatchSize != 21 {
		t.Fatalf("unexpected updated mirror: %#v", updated)
	}
}

func TestSyncPolicyServiceGetRepositoryMirrorReturnsNotFoundWhenMissing(t *testing.T) {
	db := setupSyncPolicyServiceTestDB(t)
	svc := NewSyncPolicyService(db)

	_, err := svc.GetRepositoryMirror(context.Background(), false)
	if err == nil {
		t.Fatalf("expected missing repository mirror error")
	}
	if err != ErrSyncPolicyNotFound {
		t.Fatalf("unexpected error: %v", err)
	}
}
