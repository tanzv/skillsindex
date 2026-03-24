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
	if err := dbpkg.Migrate(db); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
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

	var operations []models.APIOperation
	if err := db.Where("spec_id = ?", result.Spec.ID).Order("operation_id ASC").Find(&operations).Error; err != nil {
		t.Fatalf("failed to query extracted operations: %v", err)
	}
	if len(operations) < 8 {
		t.Fatalf("expected extracted operations, got=%d", len(operations))
	}
	if operations[0].SpecID != result.Spec.ID {
		t.Fatalf("expected extracted operation spec id to match imported spec")
	}

	operationIDs := make(map[string]struct{}, len(operations))
	for _, operation := range operations {
		operationIDs[operation.OperationID] = struct{}{}
	}
	for _, expected := range []string{
		"getCurrentPublishedSpec",
		"importAPISpecDraft",
		"validateAPISpecDraft",
		"publishAPISpec",
		"listCurrentAPIOperations",
		"upsertCurrentAPIOperationPolicy",
	} {
		if _, ok := operationIDs[expected]; !ok {
			t.Fatalf("expected extracted operation id %s", expected)
		}
	}
}

func TestMigrateIncludesAPISpecModels(t *testing.T) {
	db := setupAPISpecRegistryTestDB(t)

	if err := dbpkg.Migrate(db); err != nil {
		t.Fatalf("expected migrate to succeed: %v", err)
	}

	for _, table := range []string{"api_specs", "api_operations", "api_operation_policies", "api_publish_events"} {
		if !db.Migrator().HasTable(table) {
			t.Fatalf("expected table %s to exist", table)
		}
	}
}
