package web

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	dbpkg "skillsindex/internal/db"
	"skillsindex/internal/models"
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
	return &App{
		apiSpecRegistrySvc: services.NewAPISpecRegistryService(db, storageDir),
		apiPublishSvc:      services.NewAPIPublishService(db),
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

func TestHandleAPIAdminCurrentSpecReturnsPublishedMetadata(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	seedPublishedSpec(t, app, "skillsindex-api")

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/api-management/specs/current", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminCurrentSpec(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !bytes.Contains(recorder.Body.Bytes(), []byte(`"semantic_version":"0.1.0"`)) {
		t.Fatalf("expected semantic version in payload")
	}
}

func TestHandleAPIAdminPublishFlow(t *testing.T) {
	app := setupAPIManagementTestApp(t)

	importBody, err := json.Marshal(map[string]any{
		"name":        "SkillsIndex API",
		"slug":        "skillsindex-api",
		"source_path": "../../api/openapi/root.yaml",
	})
	if err != nil {
		t.Fatalf("failed to marshal import body: %v", err)
	}

	importReq := httptest.NewRequest(http.MethodPost, "/api/v1/admin/api-management/specs/import", bytes.NewReader(importBody))
	importReq.Header.Set("Content-Type", "application/json")
	importReq = withCurrentUser(importReq, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	importRecorder := httptest.NewRecorder()
	app.handleAPIAdminImportSpec(importRecorder, importReq)

	if importRecorder.Code != http.StatusCreated {
		t.Fatalf("unexpected import status: got=%d want=%d", importRecorder.Code, http.StatusCreated)
	}

	var importPayload map[string]any
	if err := json.Unmarshal(importRecorder.Body.Bytes(), &importPayload); err != nil {
		t.Fatalf("failed to decode import payload: %v", err)
	}
	item, ok := importPayload["item"].(map[string]any)
	if !ok {
		t.Fatalf("expected import item payload")
	}
	specID, ok := item["id"].(float64)
	if !ok {
		t.Fatalf("expected imported spec id")
	}

	validateReq := httptest.NewRequest(http.MethodPost, "/api/v1/admin/api-management/specs/1/validate", nil)
	validateReq = withCurrentUser(validateReq, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	validateReq = withURLParam(validateReq, "specID", fmt.Sprintf("%d", int(specID)))
	validateRecorder := httptest.NewRecorder()
	app.handleAPIAdminValidateSpec(validateRecorder, validateReq)
	if validateRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected validate status: got=%d want=%d", validateRecorder.Code, http.StatusOK)
	}

	publishBody, err := json.Marshal(map[string]any{"spec_id": int(specID)})
	if err != nil {
		t.Fatalf("failed to marshal publish body: %v", err)
	}
	publishReq := httptest.NewRequest(http.MethodPost, "/api/v1/admin/api-management/specs/1/publish", bytes.NewReader(publishBody))
	publishReq.Header.Set("Content-Type", "application/json")
	publishReq = withCurrentUser(publishReq, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	publishReq = withURLParam(publishReq, "specID", fmt.Sprintf("%d", int(specID)))
	publishRecorder := httptest.NewRecorder()
	app.handleAPIAdminPublishSpec(publishRecorder, publishReq)
	if publishRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected publish status: got=%d want=%d", publishRecorder.Code, http.StatusOK)
	}
}
