package services

import (
	"context"
	"fmt"
	"testing"

	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupSettingsServiceTestDB(t *testing.T) *gorm.DB {
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

func TestSettingsServiceGetSetBool(t *testing.T) {
	db := setupSettingsServiceTestDB(t)
	svc := NewSettingsService(db)
	ctx := context.Background()

	current, err := svc.GetBool(ctx, SettingAllowRegistration, true)
	if err != nil {
		t.Fatalf("failed to get default bool: %v", err)
	}
	if !current {
		t.Fatalf("expected default bool value to be true")
	}

	if err := svc.SetBool(ctx, SettingAllowRegistration, false); err != nil {
		t.Fatalf("failed to set bool value: %v", err)
	}

	current, err = svc.GetBool(ctx, SettingAllowRegistration, true)
	if err != nil {
		t.Fatalf("failed to get persisted bool: %v", err)
	}
	if current {
		t.Fatalf("expected persisted bool value to be false")
	}
}

func TestSettingsServiceEnsureBool(t *testing.T) {
	db := setupSettingsServiceTestDB(t)
	svc := NewSettingsService(db)
	ctx := context.Background()

	value, err := svc.EnsureBool(ctx, SettingAllowRegistration, true)
	if err != nil {
		t.Fatalf("failed to ensure bool setting: %v", err)
	}
	if !value {
		t.Fatalf("expected ensured value to be true")
	}

	if err := svc.SetBool(ctx, SettingAllowRegistration, false); err != nil {
		t.Fatalf("failed to update bool setting: %v", err)
	}

	value, err = svc.EnsureBool(ctx, SettingAllowRegistration, true)
	if err != nil {
		t.Fatalf("failed to ensure existing bool setting: %v", err)
	}
	if value {
		t.Fatalf("expected ensure bool to keep existing value")
	}
}
