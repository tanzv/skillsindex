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
	registry := services.NewAPISpecRegistryService(db, storageDir)
	runtimeService := services.NewAPIContractRuntimeService(db)
	policyService := services.NewAPIPolicyService(db)
	policyService.SetRuntimeReloader(runtimeService)
	publishService := services.NewAPIPublishService(db)
	publishService.SetRuntimeReloader(runtimeService)
	mockService := services.NewAPIMockService(db, runtimeService)
	exportService := services.NewAPIExportService(db, storageDir)
	return &App{
		apiSpecRegistrySvc:    registry,
		apiPublishSvc:         publishService,
		apiPolicySvc:          policyService,
		apiMockSvc:            mockService,
		apiExportSvc:          exportService,
		apiContractRuntimeSvc: runtimeService,
		storagePath:           storageDir,
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

func TestHandleAPIAdminCurrentOperationsListsPublishedOperations(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	seedPublishedSpec(t, app, "skillsindex-api")

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/api-management/operations", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminCurrentOperations(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !bytes.Contains(recorder.Body.Bytes(), []byte(`"operation_id":"getCurrentPublishedSpec"`)) {
		t.Fatalf("expected current published spec operation in payload")
	}
	if !bytes.Contains(recorder.Body.Bytes(), []byte(`"operation_id":"upsertCurrentAPIOperationPolicy"`)) {
		t.Fatalf("expected policy upsert operation in payload")
	}
}

func TestHandleAPIAdminCurrentOperationPolicyUpsertAndGet(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	seedPublishedSpec(t, app, "skillsindex-api")

	updateBody, err := json.Marshal(map[string]any{
		"auth_mode":       "session",
		"required_roles":  []string{"super_admin"},
		"required_scopes": []string{},
		"enabled":         false,
		"mock_enabled":    true,
		"export_enabled":  true,
	})
	if err != nil {
		t.Fatalf("failed to marshal policy body: %v", err)
	}

	updateReq := httptest.NewRequest(http.MethodPost, "/api/v1/admin/api-management/operations/getCurrentPublishedSpec/policy", bytes.NewReader(updateBody))
	updateReq.Header.Set("Content-Type", "application/json")
	updateReq = withCurrentUser(updateReq, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	updateReq = withURLParam(updateReq, "operationID", "getCurrentPublishedSpec")
	updateRecorder := httptest.NewRecorder()
	app.handleAPIAdminCurrentOperationPolicyUpsert(updateRecorder, updateReq)

	if updateRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected policy update status: got=%d want=%d", updateRecorder.Code, http.StatusOK)
	}
	if !bytes.Contains(updateRecorder.Body.Bytes(), []byte(`"enabled":false`)) {
		t.Fatalf("expected disabled policy in update payload")
	}

	getReq := httptest.NewRequest(http.MethodGet, "/api/v1/admin/api-management/operations/getCurrentPublishedSpec/policy", nil)
	getReq = withCurrentUser(getReq, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	getReq = withURLParam(getReq, "operationID", "getCurrentPublishedSpec")
	getRecorder := httptest.NewRecorder()
	app.handleAPIAdminCurrentOperationPolicy(getRecorder, getReq)

	if getRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected policy get status: got=%d want=%d", getRecorder.Code, http.StatusOK)
	}
	if !bytes.Contains(getRecorder.Body.Bytes(), []byte(`"required_roles":["super_admin"]`)) {
		t.Fatalf("expected required roles in get payload")
	}
}

func TestHandleAPIAdminCurrentSpecHonorsRuntimeOperationPolicy(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	seedPublishedSpec(t, app, "skillsindex-api")

	_, err := app.apiPolicySvc.UpsertCurrentOperationPolicy(context.Background(), services.UpsertCurrentAPIOperationPolicyInput{
		OperationID:   "getCurrentPublishedSpec",
		AuthMode:      "session",
		RequiredRoles: []string{"super_admin"},
		Enabled:       false,
		MockEnabled:   false,
		ExportEnabled: true,
		ActorUserID:   1,
	})
	if err != nil {
		t.Fatalf("failed to seed current operation policy: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/api-management/specs/current", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminCurrentSpec(recorder, req)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	if !bytes.Contains(recorder.Body.Bytes(), []byte(`"error":"api_operation_disabled"`)) {
		t.Fatalf("expected disabled operation error payload")
	}
}

func TestHandleAPIAdminMockResolveReturnsOverride(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	seedPublishedSpec(t, app, "skillsindex-api")

	if _, err := app.apiPolicySvc.UpsertCurrentOperationPolicy(context.Background(), services.UpsertCurrentAPIOperationPolicyInput{
		OperationID:    "getCurrentPublishedSpec",
		AuthMode:       "session",
		RequiredRoles:  []string{"super_admin"},
		RequiredScopes: []string{},
		Enabled:        true,
		MockEnabled:    true,
		ExportEnabled:  true,
		ActorUserID:    1,
	}); err != nil {
		t.Fatalf("failed to seed mock-enabled policy: %v", err)
	}
	profile, err := app.apiMockSvc.UpsertCurrentProfile(context.Background(), services.UpsertCurrentAPIMockProfileInput{
		Name:        "default",
		Mode:        "inline",
		IsDefault:   true,
		ActorUserID: 1,
	})
	if err != nil {
		t.Fatalf("failed to create mock profile: %v", err)
	}
	if _, err := app.apiMockSvc.UpsertProfileOverride(context.Background(), services.UpsertAPIMockOverrideInput{
		ProfileID:      profile.ID,
		OperationID:    "getCurrentPublishedSpec",
		StatusCode:     202,
		ContentType:    "application/json",
		BodyPayload:    `{"mocked":true}`,
		HeadersPayload: `{"x-mock":"enabled"}`,
		LatencyMS:      20,
		ActorUserID:    1,
	}); err != nil {
		t.Fatalf("failed to create mock override: %v", err)
	}

	body, err := json.Marshal(map[string]any{
		"profile_name": "default",
		"method":       "GET",
		"path":         "/api/v1/admin/api-management/specs/current",
	})
	if err != nil {
		t.Fatalf("failed to marshal mock resolve body: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/api-management/mock/resolve", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminMockResolve(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !bytes.Contains(recorder.Body.Bytes(), []byte(`"status_code":202`)) {
		t.Fatalf("expected mock status code in payload")
	}
	if !bytes.Contains(recorder.Body.Bytes(), []byte(`"operation_id":"getCurrentPublishedSpec"`)) {
		t.Fatalf("expected operation id in mock payload")
	}
}

func TestHandleAPIAdminExportsCreateRecordsArtifact(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	seedPublishedSpec(t, app, "skillsindex-api")

	body, err := json.Marshal(map[string]any{
		"export_type": "public-subset",
		"format":      "yaml",
		"target":      "partner-download",
	})
	if err != nil {
		t.Fatalf("failed to marshal export body: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/api-management/exports", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminExportsCreate(recorder, req)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusCreated)
	}
	if !bytes.Contains(recorder.Body.Bytes(), []byte(`"export_type":"public-subset"`)) {
		t.Fatalf("expected export type in payload")
	}
	if !bytes.Contains(recorder.Body.Bytes(), []byte(`"artifact_raw":"`)) {
		t.Fatalf("expected artifact raw payload")
	}
}
