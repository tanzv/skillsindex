package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPIAdminRepositorySyncPolicy(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-policy/repository", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRepositorySyncPolicy(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if _, ok := payload["batch_size"].(float64); !ok {
		t.Fatalf("missing batch_size in response: %#v", payload)
	}
}

func TestAPIAdminRepositorySyncPolicyUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-policy/repository", nil)
	req.Header.Set("X-Request-ID", "req-sync-policy-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRepositorySyncPolicy(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error code: %#v", payload)
	}
	if payload["message"] != "Authentication required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-sync-policy-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminRepositorySyncPolicyUpdate(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sync-policy/repository",
		strings.NewReader(`{"enabled":true,"interval":"15m","timeout":"3m","batch_size":42}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRepositorySyncPolicyUpdate(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	enabled, ok := payload["enabled"].(bool)
	if !ok || !enabled {
		t.Fatalf("unexpected enabled in response: %#v", payload)
	}

	items, err := app.syncPolicyRecordSvc.List(context.Background(), services.ListSyncPoliciesInput{
		SourceType: models.SyncPolicySourceRepository,
		Limit:      10,
	})
	if err != nil {
		t.Fatalf("failed to list mirrored sync policies: %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected one mirrored repository policy, got=%d", len(items))
	}
	if items[0].TargetScope != services.RepositorySyncPolicyMirrorTargetScope {
		t.Fatalf("unexpected mirrored target scope: %#v", items[0])
	}
	if !items[0].Enabled || items[0].IntervalMinutes != 15 || items[0].TimeoutMinutes != 3 || items[0].BatchSize != 42 {
		t.Fatalf("unexpected mirrored repository policy: %#v", items[0])
	}
}

func TestAPIAdminRepositorySyncPolicyUpdateEmptyPayload(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sync-policy/repository",
		strings.NewReader(`{}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-sync-policy-empty-payload")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRepositorySyncPolicyUpdate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "empty_payload" {
		t.Fatalf("unexpected error code: %#v", payload)
	}
	if payload["message"] != "At least one repository sync policy field is required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-sync-policy-empty-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
