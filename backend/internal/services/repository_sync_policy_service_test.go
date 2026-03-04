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

func setupRepositorySyncPolicyTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.SystemSetting{}); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}
	return db
}

func TestRepositorySyncPolicyServiceEnsureAndGet(t *testing.T) {
	db := setupRepositorySyncPolicyTestDB(t)
	settings := NewSettingsService(db)
	policySvc := NewRepositorySyncPolicyService(settings, RepositorySyncPolicy{
		Enabled:   true,
		Interval:  45 * time.Minute,
		Timeout:   12 * time.Minute,
		BatchSize: 33,
	})

	policy, err := policySvc.Ensure(context.Background())
	if err != nil {
		t.Fatalf("failed to ensure policy: %v", err)
	}
	if !policy.Enabled || policy.Interval != 45*time.Minute || policy.Timeout != 12*time.Minute || policy.BatchSize != 33 {
		t.Fatalf("unexpected ensured policy: %#v", policy)
	}

	loaded, err := policySvc.Get(context.Background())
	if err != nil {
		t.Fatalf("failed to get policy: %v", err)
	}
	if loaded != policy {
		t.Fatalf("unexpected loaded policy: got=%#v want=%#v", loaded, policy)
	}
}

func TestRepositorySyncPolicyServiceUpdate(t *testing.T) {
	db := setupRepositorySyncPolicyTestDB(t)
	settings := NewSettingsService(db)
	policySvc := NewRepositorySyncPolicyService(settings, RepositorySyncPolicy{
		Enabled:   false,
		Interval:  30 * time.Minute,
		Timeout:   10 * time.Minute,
		BatchSize: 20,
	})
	if _, err := policySvc.Ensure(context.Background()); err != nil {
		t.Fatalf("failed to ensure policy: %v", err)
	}

	enabled := true
	interval := 15 * time.Minute
	timeout := 3 * time.Minute
	batchSize := 77
	updated, err := policySvc.Update(context.Background(), UpdateRepositorySyncPolicyInput{
		Enabled:   &enabled,
		Interval:  &interval,
		Timeout:   &timeout,
		BatchSize: &batchSize,
	})
	if err != nil {
		t.Fatalf("failed to update policy: %v", err)
	}
	if !updated.Enabled || updated.Interval != interval || updated.Timeout != timeout || updated.BatchSize != batchSize {
		t.Fatalf("unexpected updated policy: %#v", updated)
	}
}

func TestRepositorySyncPolicyServiceUpdateRejectsInvalidValue(t *testing.T) {
	db := setupRepositorySyncPolicyTestDB(t)
	settings := NewSettingsService(db)
	policySvc := NewRepositorySyncPolicyService(settings, RepositorySyncPolicy{
		Enabled:   true,
		Interval:  30 * time.Minute,
		Timeout:   10 * time.Minute,
		BatchSize: 20,
	})
	if _, err := policySvc.Ensure(context.Background()); err != nil {
		t.Fatalf("failed to ensure policy: %v", err)
	}

	zero := 0 * time.Minute
	if _, err := policySvc.Update(context.Background(), UpdateRepositorySyncPolicyInput{Interval: &zero}); err == nil {
		t.Fatalf("expected invalid interval error")
	}
}
