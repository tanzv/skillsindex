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

func TestHandleAPIAccountAPIKeysListOwnOnly(t *testing.T) {
	app, svc, _, member, other := setupAdminAPIKeyAPITestApp(t)
	_, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: member.ID,
		Name:   "member-personal",
	})
	if err != nil {
		t.Fatalf("failed to create member key: %v", err)
	}
	_, _, err = svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: other.ID,
		Name:   "other-personal",
	})
	if err != nil {
		t.Fatalf("failed to create other key: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/account/apikeys", nil)
	req = withCurrentUser(req, &member)
	recorder := httptest.NewRecorder()

	app.handleAPIAccountAPIKeys(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if total, ok := payload["total"].(float64); !ok || int(total) != 1 {
		t.Fatalf("unexpected total payload: %#v", payload["total"])
	}
	items, ok := payload["items"].([]any)
	if !ok || len(items) != 1 {
		t.Fatalf("unexpected items payload: %#v", payload["items"])
	}
	if _, ok := payload["supported_scopes"].([]any); !ok {
		t.Fatalf("supported scopes should be included: %#v", payload)
	}
	if _, ok := payload["default_scopes"].([]any); !ok {
		t.Fatalf("default scopes should be included: %#v", payload)
	}
}

func TestHandleAPIAccountAPIKeysUnauthorized(t *testing.T) {
	app, _, _, _, _ := setupAdminAPIKeyAPITestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/account/apikeys", nil)
	req.Header.Set("X-Request-ID", "req-account-apikeys-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAccountAPIKeys(recorder, req)

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
	if payload["request_id"] != "req-account-apikeys-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIAccountAPIKeysCreateSuccess(t *testing.T) {
	app, svc, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/account/apikeys",
		strings.NewReader(`{"name":"CLI credential","purpose":"Local OpenAPI usage","expires_in_days":30,"scopes":["skills.search.read"]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &member)
	recorder := httptest.NewRecorder()

	app.handleAPIAccountAPIKeysCreate(recorder, req)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusCreated)
	}
	payload := decodeBodyMap(t, recorder)
	token, ok := payload["plaintext_key"].(string)
	if !ok || !strings.HasPrefix(token, "sk_live_") {
		t.Fatalf("unexpected plaintext key: %#v", payload["plaintext_key"])
	}
	validated, valid, err := svc.Validate(context.Background(), token)
	if err != nil {
		t.Fatalf("validate new token failed: %v", err)
	}
	if !valid || validated.UserID != member.ID {
		t.Fatalf("validated token mismatch: valid=%v owner=%d", valid, validated.UserID)
	}
}

func TestHandleAPIAccountAPIKeyRotateSuccess(t *testing.T) {
	app, svc, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	created, oldToken, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: member.ID,
		Name:   "rotate-personal",
		Scopes: []string{services.APIKeyScopeSkillsSearchRead},
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/v1/account/apikeys/%d/rotate", created.ID), nil)
	req = withCurrentUser(req, &member)
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", created.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAccountAPIKeyRotate(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	newToken, ok := payload["plaintext_key"].(string)
	if !ok || !strings.HasPrefix(newToken, "sk_live_") {
		t.Fatalf("unexpected plaintext key: %#v", payload["plaintext_key"])
	}
	_, oldValid, err := svc.Validate(context.Background(), oldToken)
	if err != nil {
		t.Fatalf("validate old token failed: %v", err)
	}
	if oldValid {
		t.Fatalf("old token should be invalid after rotate")
	}
	validated, newValid, err := svc.Validate(context.Background(), newToken)
	if err != nil {
		t.Fatalf("validate new token failed: %v", err)
	}
	if !newValid || validated.UserID != member.ID {
		t.Fatalf("validated token mismatch: valid=%v owner=%d", newValid, validated.UserID)
	}
}

func TestHandleAPIAccountAPIKeyScopesUpdateSuccess(t *testing.T) {
	app, svc, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	key, plaintext, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: member.ID,
		Name:   "scope-update",
		Scopes: []string{services.APIKeyScopeSkillsSearchRead},
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		fmt.Sprintf("/api/v1/account/apikeys/%d/scopes", key.ID),
		strings.NewReader(`{"scopes":["skills.ai_search.read"]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &member)
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", key.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAccountAPIKeyScopesUpdate(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	updated, valid, err := svc.Validate(context.Background(), plaintext)
	if err != nil {
		t.Fatalf("validate updated token failed: %v", err)
	}
	if !valid {
		t.Fatalf("updated token should stay valid")
	}
	if !services.APIKeyHasScope(updated, services.APIKeyScopeSkillsAISearchRead) {
		t.Fatalf("updated key should include ai search scope")
	}
	if services.APIKeyHasScope(updated, services.APIKeyScopeSkillsSearchRead) {
		t.Fatalf("updated key should not retain keyword search scope")
	}
}

func TestHandleAPIAccountAPIKeyScopesUpdateInvalidScope(t *testing.T) {
	app, svc, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	key, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: member.ID,
		Name:   "scope-invalid",
		Scopes: []string{services.APIKeyScopeSkillsSearchRead},
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		fmt.Sprintf("/api/v1/account/apikeys/%d/scopes", key.ID),
		strings.NewReader(`{"scopes":["invalid.scope"]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-account-apikeys-invalid-scope")
	req = withCurrentUser(req, &member)
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", key.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAccountAPIKeyScopesUpdate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusBadRequest, recorder.Body.String())
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_scope" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	message, ok := payload["message"].(string)
	if !ok || !strings.Contains(message, "invalid scope") {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-account-apikeys-invalid-scope" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
