package web

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"skillsindex/internal/models"
)

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

func TestHandleAPIAdminCurrentSpecUnauthorized(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/api-management/specs/current", nil)
	req.Header.Set("X-Request-ID", "req-api-management-current-spec-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminCurrentSpec(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Authentication required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-api-management-current-spec-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
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

func TestHandleAPIAdminImportSpecInvalidPayload(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/api-management/specs/import", bytes.NewBufferString(`{"name":`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-api-management-import-invalid-payload")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminImportSpec(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-api-management-import-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
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

func TestHandleAPIAdminCurrentOperationsUnauthorized(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/api-management/operations", nil)
	req.Header.Set("X-Request-ID", "req-api-management-operations-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminCurrentOperations(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Authentication required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-api-management-operations-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
