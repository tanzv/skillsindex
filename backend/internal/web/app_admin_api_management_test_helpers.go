package web

import (
	"context"
	"fmt"
	"testing"

	dbpkg "skillsindex/internal/db"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAPIManagementTestApp(t *testing.T) *App {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := dbpkg.Migrate(db); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	storageDir := t.TempDir()
	registry := services.NewAPISpecRegistryService(db, storageDir)
	runtimeService := services.NewAPIContractRuntimeService(db)
	policyService := services.NewAPIPolicyService(db)
	policyService.SetRuntimeReloader(runtimeService)
	publishService := services.NewAPIPublishService(db)
	publishService.SetRuntimeReloader(runtimeService)
	mockService := services.NewAPIMockService(db, runtimeService)
	exportService := services.NewAPIExportService(db, storageDir)
	return &App{
		apiRuntimeDependencies: apiRuntimeDependencies{
			apiSpecRegistrySvc:    registry,
			apiPublishSvc:         publishService,
			apiPolicySvc:          policyService,
			apiMockSvc:            mockService,
			apiExportSvc:          exportService,
			apiContractRuntimeSvc: runtimeService,
		},
		storagePath: storageDir,
	}
}

func seedPublishedSpec(t *testing.T, app *App, slug string) {
	t.Helper()

	result, err := app.apiSpecRegistrySvc.ImportDraft(context.Background(), services.ImportAPISpecDraftInput{
		Name:        "SkillsIndex API",
		Slug:        slug,
		SourcePath:  "../../api/openapi/root.yaml",
		ActorUserID: 1,
	})
	if err != nil {
		t.Fatalf("failed to import draft spec: %v", err)
	}

	if _, err := app.apiSpecRegistrySvc.ValidateDraft(context.Background(), result.Spec.ID); err != nil {
		t.Fatalf("failed to validate draft spec: %v", err)
	}

	if _, err := app.apiPublishSvc.Publish(context.Background(), services.PublishAPISpecInput{
		SpecID:      result.Spec.ID,
		ActorUserID: 1,
	}); err != nil {
		t.Fatalf("failed to publish spec: %v", err)
	}
}
