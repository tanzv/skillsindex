package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAuthorizePublishedOperationDisabled(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	seedPublishedSpec(t, app, "skillsindex-api")

	_, err := app.apiPolicySvc.UpsertCurrentOperationPolicy(context.Background(), services.UpsertCurrentAPIOperationPolicyInput{
		OperationID:   "getCurrentPublishedSpec",
		AuthMode:      models.APIAuthModeSession,
		Enabled:       false,
		MockEnabled:   false,
		ExportEnabled: true,
		ActorUserID:   1,
	})
	if err != nil {
		t.Fatalf("failed to seed disabled operation policy: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/api-management/specs/current", nil)
	req.Header.Set("X-Request-ID", "req-api-operation-disabled")
	recorder := httptest.NewRecorder()

	allowed := app.authorizePublishedOperation(recorder, req)

	if allowed {
		t.Fatalf("expected request to be denied")
	}
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "api_operation_disabled" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "API operation is disabled" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-api-operation-disabled" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAuthorizePublishedOperationSessionUnauthorized(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	seedPublishedSpec(t, app, "skillsindex-api")

	_, err := app.apiPolicySvc.UpsertCurrentOperationPolicy(context.Background(), services.UpsertCurrentAPIOperationPolicyInput{
		OperationID:   "getCurrentPublishedSpec",
		AuthMode:      models.APIAuthModeSession,
		Enabled:       true,
		MockEnabled:   false,
		ExportEnabled: true,
		ActorUserID:   1,
	})
	if err != nil {
		t.Fatalf("failed to seed session operation policy: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/api-management/specs/current", nil)
	req.Header.Set("X-Request-ID", "req-api-operation-session-unauthorized")
	recorder := httptest.NewRecorder()

	allowed := app.authorizePublishedOperation(recorder, req)

	if allowed {
		t.Fatalf("expected request to be denied")
	}
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
	if payload["request_id"] != "req-api-operation-session-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAuthorizePublishedOperationAPIKeyInvalid(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	seedPublishedSpec(t, app, "skillsindex-api")

	_, err := app.apiPolicySvc.UpsertCurrentOperationPolicy(context.Background(), services.UpsertCurrentAPIOperationPolicyInput{
		OperationID:    "getCurrentPublishedSpec",
		AuthMode:       models.APIAuthModeAPIKey,
		RequiredScopes: []string{},
		Enabled:        true,
		MockEnabled:    false,
		ExportEnabled:  true,
		ActorUserID:    1,
	})
	if err != nil {
		t.Fatalf("failed to seed api key operation policy: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/api-management/specs/current", nil)
	req.Header.Set("X-Request-ID", "req-api-operation-apikey-invalid")
	recorder := httptest.NewRecorder()

	allowed := app.authorizePublishedOperation(recorder, req)

	if allowed {
		t.Fatalf("expected request to be denied")
	}
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "api_key_invalid" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Invalid API key" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-api-operation-apikey-invalid" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAuthorizePublishedOperationAPIKeyScopeDenied(t *testing.T) {
	app := setupAPIManagementTestApp(t)
	seedPublishedSpec(t, app, "skillsindex-api")
	app.apiKeys = map[string]struct{}{
		"static-test-key": {},
	}

	_, err := app.apiPolicySvc.UpsertCurrentOperationPolicy(context.Background(), services.UpsertCurrentAPIOperationPolicyInput{
		OperationID:    "getCurrentPublishedSpec",
		AuthMode:       models.APIAuthModeAPIKey,
		RequiredScopes: []string{services.APIKeyScopeSkillsSearchRead},
		Enabled:        true,
		MockEnabled:    false,
		ExportEnabled:  true,
		ActorUserID:    1,
	})
	if err != nil {
		t.Fatalf("failed to seed api key scope policy: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/api-management/specs/current?api_key=static-test-key", nil)
	req.Header.Set("X-Request-ID", "req-api-operation-apikey-scope-denied")
	recorder := httptest.NewRecorder()

	allowed := app.authorizePublishedOperation(recorder, req)

	if allowed {
		t.Fatalf("expected request to be denied")
	}
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "api_key_scope_denied" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "API key scope denied" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-api-operation-apikey-scope-denied" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
