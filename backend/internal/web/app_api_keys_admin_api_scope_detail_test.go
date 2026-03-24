package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"skillsindex/internal/services"
)

func TestAPIAdminAPIKeyDetailByOwnerSuccess(t *testing.T) {
	app, svc, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	key, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: member.ID,
		Name:   "member-detail-key",
		Scopes: []string{services.APIKeyScopeSkillsSearchRead},
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/apikeys/%d", key.ID), nil)
	req = withCurrentUser(req, &member)
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", key.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeyDetail(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	if got, ok := item["id"].(float64); !ok || uint(got) != key.ID {
		t.Fatalf("unexpected key id: %#v", item["id"])
	}
	if got, ok := item["user_id"].(float64); !ok || uint(got) != member.ID {
		t.Fatalf("unexpected owner user id: %#v", item["user_id"])
	}
}

func TestAPIAdminAPIKeyDetailPermissionDenied(t *testing.T) {
	app, svc, _, member, other := setupAdminAPIKeyAPITestApp(t)
	key, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: other.ID,
		Name:   "other-detail-key",
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/apikeys/%d", key.ID), nil)
	req.Header.Set("X-Request-ID", "req-admin-apikey-detail-permission-denied")
	req = withCurrentUser(req, &member)
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", key.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeyDetail(recorder, req)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "permission_denied" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Permission denied" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-apikey-detail-permission-denied" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAPIKeyDetailUnauthorized(t *testing.T) {
	app, svc, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	key, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: member.ID,
		Name:   "member-detail-unauthorized",
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/apikeys/%d", key.ID), nil)
	req.Header.Set("X-Request-ID", "req-admin-apikey-detail-unauthorized")
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", key.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeyDetail(recorder, req)
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
	if payload["request_id"] != "req-admin-apikey-detail-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAPIKeyScopesUpdateByOwnerSuccess(t *testing.T) {
	app, svc, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	key, plaintext, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: member.ID,
		Name:   "member-scope-key",
		Scopes: []string{services.APIKeyScopeSkillsSearchRead},
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		fmt.Sprintf("/api/v1/admin/apikeys/%d/scopes", key.ID),
		strings.NewReader(`{"scopes":["skills.ai_search.read"]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &member)
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", key.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeyScopesUpdate(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	scopes, ok := item["scopes"].([]any)
	if !ok || len(scopes) != 1 || scopes[0] != "skills.ai_search.read" {
		t.Fatalf("unexpected scopes payload: %#v", item["scopes"])
	}

	validated, valid, err := svc.Validate(context.Background(), plaintext)
	if err != nil {
		t.Fatalf("validate updated token failed: %v", err)
	}
	if !valid {
		t.Fatalf("updated key should remain valid")
	}
	if !services.APIKeyHasScope(validated, services.APIKeyScopeSkillsAISearchRead) {
		t.Fatalf("updated key should have ai search scope")
	}
	if services.APIKeyHasScope(validated, services.APIKeyScopeSkillsSearchRead) {
		t.Fatalf("updated key should not keep search scope")
	}
}

func TestAPIAdminAPIKeyScopesUpdateBySuperAdminSuccess(t *testing.T) {
	app, svc, superAdmin, member, _ := setupAdminAPIKeyAPITestApp(t)
	key, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: member.ID,
		Name:   "member-managed-key",
		Scopes: []string{services.APIKeyScopeSkillsSearchRead},
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		fmt.Sprintf("/api/v1/admin/apikeys/%d/scopes", key.ID),
		strings.NewReader(`{"scopes":["skills.search.read"]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &superAdmin)
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", key.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeyScopesUpdate(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	if got, ok := item["user_id"].(float64); !ok || uint(got) != member.ID {
		t.Fatalf("unexpected owner user id: %#v", item["user_id"])
	}
}

func TestAPIAdminAPIKeyScopesUpdatePermissionDenied(t *testing.T) {
	app, svc, _, member, other := setupAdminAPIKeyAPITestApp(t)
	key, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: other.ID,
		Name:   "other-scope-key",
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		fmt.Sprintf("/api/v1/admin/apikeys/%d/scopes", key.ID),
		strings.NewReader(`{"scopes":["skills.search.read"]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-admin-apikey-scopes-permission-denied")
	req = withCurrentUser(req, &member)
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", key.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeyScopesUpdate(recorder, req)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "permission_denied" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Permission denied" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-apikey-scopes-permission-denied" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAPIKeyScopesUpdateInvalidScope(t *testing.T) {
	app, svc, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	key, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: member.ID,
		Name:   "member-invalid-scope-key",
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		fmt.Sprintf("/api/v1/admin/apikeys/%d/scopes", key.ID),
		strings.NewReader(`{"scopes":["invalid.scope"]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-admin-apikey-scopes-invalid-scope")
	req = withCurrentUser(req, &member)
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", key.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeyScopesUpdate(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if got, _ := payload["error"].(string); got != "invalid_scope" {
		t.Fatalf("unexpected error code: %#v", payload["error"])
	}
	message, ok := payload["message"].(string)
	if !ok || !strings.Contains(message, "invalid scope") {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-apikey-scopes-invalid-scope" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAPIKeyScopesUpdateUnauthorized(t *testing.T) {
	app, svc, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	key, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: member.ID,
		Name:   "member-unauthorized-scope-key",
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		fmt.Sprintf("/api/v1/admin/apikeys/%d/scopes", key.ID),
		strings.NewReader(`{"scopes":["skills.search.read"]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-admin-apikey-scopes-unauthorized")
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", key.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeyScopesUpdate(recorder, req)
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
	if payload["request_id"] != "req-admin-apikey-scopes-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
