package web

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

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

func TestHandleAPIAdminCurrentOperationPolicyUnauthorized(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/api-management/operations/getCurrentPublishedSpec/policy", nil)
	req.Header.Set("X-Request-ID", "req-api-management-operation-policy-unauthorized")
	req = withURLParam(req, "operationID", "getCurrentPublishedSpec")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminCurrentOperationPolicy(recorder, req)

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
	if payload["request_id"] != "req-api-management-operation-policy-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIAdminCurrentOperationPolicyUpsertInvalidPayload(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/api-management/operations/getCurrentPublishedSpec/policy",
		bytes.NewBufferString(`{"auth_mode":`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-api-management-operation-policy-invalid-payload")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	req = withURLParam(req, "operationID", "getCurrentPublishedSpec")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminCurrentOperationPolicyUpsert(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-api-management-operation-policy-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
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

func TestHandleAPIAdminMockResolveInvalidPayload(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/api-management/mock/resolve", bytes.NewBufferString(`{"profile_name":`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-api-management-mock-resolve-invalid-payload")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminMockResolve(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-api-management-mock-resolve-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIAdminMockProfilesUnauthorized(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/api-management/mock/profiles", nil)
	req.Header.Set("X-Request-ID", "req-api-management-mock-profiles-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminMockProfiles(recorder, req)

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
	if payload["request_id"] != "req-api-management-mock-profiles-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
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

func TestHandleAPIAdminExportsCreateInvalidPayload(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/api-management/exports", bytes.NewBufferString(`{"export_type":`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-api-management-exports-invalid-payload")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminExportsCreate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-api-management-exports-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIAdminExportsUnauthorized(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/api-management/exports", nil)
	req.Header.Set("X-Request-ID", "req-api-management-exports-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminExports(recorder, req)

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
	if payload["request_id"] != "req-api-management-exports-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
