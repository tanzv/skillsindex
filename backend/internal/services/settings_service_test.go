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

func TestSettingsServiceGetSetInt(t *testing.T) {
	db := setupSettingsServiceTestDB(t)
	svc := NewSettingsService(db)
	ctx := context.Background()

	current, err := svc.GetInt(ctx, SettingMarketplaceRankingLimit, 12)
	if err != nil {
		t.Fatalf("failed to get default int: %v", err)
	}
	if current != 12 {
		t.Fatalf("unexpected default int value: got=%d want=12", current)
	}

	if err := svc.SetInt(ctx, SettingMarketplaceRankingLimit, 24); err != nil {
		t.Fatalf("failed to set int value: %v", err)
	}

	current, err = svc.GetInt(ctx, SettingMarketplaceRankingLimit, 12)
	if err != nil {
		t.Fatalf("failed to get persisted int: %v", err)
	}
	if current != 24 {
		t.Fatalf("unexpected persisted int value: got=%d want=24", current)
	}
}

func TestSettingsServiceEnsureInt(t *testing.T) {
	db := setupSettingsServiceTestDB(t)
	svc := NewSettingsService(db)
	ctx := context.Background()

	value, err := svc.EnsureInt(ctx, SettingMarketplaceRankingHighlightLimit, 3)
	if err != nil {
		t.Fatalf("failed to ensure int setting: %v", err)
	}
	if value != 3 {
		t.Fatalf("unexpected ensured int value: got=%d want=3", value)
	}

	if err := svc.SetInt(ctx, SettingMarketplaceRankingHighlightLimit, 5); err != nil {
		t.Fatalf("failed to update int setting: %v", err)
	}

	value, err = svc.EnsureInt(ctx, SettingMarketplaceRankingHighlightLimit, 3)
	if err != nil {
		t.Fatalf("failed to ensure existing int setting: %v", err)
	}
	if value != 5 {
		t.Fatalf("expected ensure int to keep existing value: got=%d want=5", value)
	}
}
