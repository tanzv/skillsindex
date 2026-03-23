package services

import (
	"context"
	"fmt"
	"path/filepath"
	"strings"
	"testing"

	dbpkg "skillsindex/internal/db"
	"skillsindex/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAPISpecRegistryTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	return db
}

func TestAPISpecRegistryServiceImportDraftCreatesSpecAndBundle(t *testing.T) {
	db := setupAPISpecRegistryTestDB(t)
	storageDir := t.TempDir()
	service := NewAPISpecRegistryService(db, storageDir)

	result, err := service.ImportDraft(context.Background(), ImportAPISpecDraftInput{
		Name:        "SkillsIndex API",
		Slug:        "skillsindex-api",
		SourcePath:  filepath.Join("..", "..", "api", "openapi", "root.yaml"),
		ActorUserID: 7,
	})
	if err != nil {
		t.Fatalf("expected import to succeed, got %v", err)
	}
	if result.Spec.ID == 0 {
		t.Fatalf("expected persisted spec id")
	}
	if result.Spec.Status != models.APISpecStatusDraft {
		t.Fatalf("unexpected spec status: %s", result.Spec.Status)
	}
	if strings.TrimSpace(result.BundlePath) == "" {
		t.Fatalf("expected bundle path")
	}
}

func TestMigrateIncludesAPISpecModels(t *testing.T) {
	db := setupAPISpecRegistryTestDB(t)

	if err := dbpkg.Migrate(db); err != nil {
		t.Fatalf("expected migrate to succeed: %v", err)
	}

	for _, table := range []string{"api_specs", "api_publish_events"} {
		if !db.Migrator().HasTable(table) {
			t.Fatalf("expected table %s to exist", table)
		}
	}
}
