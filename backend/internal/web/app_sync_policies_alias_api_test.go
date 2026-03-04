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

func TestAPIAdminSyncPoliciesAliasList(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-policies", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPolicies(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	payload := decodeBodyMap(t, recorder)
	total, ok := payload["total"].(float64)
	if !ok || int(total) != 1 {
		t.Fatalf("unexpected total in payload: %#v", payload)
	}
	items, ok := payload["items"].([]any)
	if !ok || len(items) != 1 {
		t.Fatalf("unexpected items in payload: %#v", payload)
	}
	item, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected first item: %#v", items[0])
	}
	policyID, _ := item["policy_id"].(string)
	if policyID != "repository" {
		t.Fatalf("unexpected policy_id: got=%s want=%s", policyID, "repository")
	}
}

func TestAPIAdminSyncPoliciesAliasUpdate(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sync-policies/repository/update",
		strings.NewReader(`{"enabled":true,"interval":"25m","timeout":"8m","batch_size":31}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	req = withURLParam(req, "policyID", "repository")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPoliciesUpdate(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	payload := decodeBodyMap(t, recorder)
	enabled, ok := payload["enabled"].(bool)
	if !ok || !enabled {
		t.Fatalf("unexpected enabled in payload: %#v", payload)
	}
}

func TestAPIAdminSyncPoliciesAliasCreate(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sync-policies/create",
		strings.NewReader(`{"enabled":true,"interval":"40m","timeout":"12m","batch_size":55}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPoliciesCreate(recorder, req)
	if recorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusCreated)
	}

	payload := decodeBodyMap(t, recorder)
	enabled, ok := payload["enabled"].(bool)
	if !ok || !enabled {
		t.Fatalf("unexpected enabled in payload: %#v", payload)
	}
}

func TestAPIAdminSyncPoliciesAliasToggle(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	enabled := true
	if _, err := app.syncPolicyService.Update(
		context.Background(),
		services.UpdateRepositorySyncPolicyInput{Enabled: &enabled},
	); err != nil {
		t.Fatalf("failed to set up initial policy state: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/sync-policies/repository/toggle", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	req = withURLParam(req, "policyID", "repository")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPoliciesToggle(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	payload := decodeBodyMap(t, recorder)
	value, ok := payload["enabled"].(bool)
	if !ok || value {
		t.Fatalf("unexpected enabled in payload after toggle: %#v", payload)
	}
}

func TestAPIAdminSyncPoliciesAliasDeleteDisablesPolicy(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	enabled := true
	if _, err := app.syncPolicyService.Update(
		context.Background(),
		services.UpdateRepositorySyncPolicyInput{Enabled: &enabled},
	); err != nil {
		t.Fatalf("failed to set up initial policy state: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/sync-policies/repository/delete", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	req = withURLParam(req, "policyID", "repository")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPoliciesDelete(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	loaded, err := app.syncPolicyService.Get(context.Background())
	if err != nil {
		t.Fatalf("failed to load policy after delete alias: %v", err)
	}
	if loaded.Enabled {
		t.Fatalf("expected policy to be disabled after delete alias: %#v", loaded)
	}
}

func TestAPIAdminSyncPoliciesAliasRejectsUnknownPolicyID(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/sync-policies/unknown/update", strings.NewReader(`{}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	req = withURLParam(req, "policyID", "unknown")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncPoliciesUpdate(recorder, req)
	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
}
