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

func TestAPIAdminAuthProvidersSettingUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/auth-providers", nil)
	req.Header.Set("X-Request-ID", "req-auth-providers-setting-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProvidersSetting(recorder, req)

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
	if payload["request_id"] != "req-auth-providers-setting-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAuthProvidersSettingForbidden(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/auth-providers", nil)
	req.Header.Set("X-Request-ID", "req-auth-providers-setting-forbidden")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProvidersSetting(recorder, req)

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
	if payload["request_id"] != "req-auth-providers-setting-forbidden" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAuthProvidersSettingServiceUnavailable(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	app.settingsService = nil
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/auth-providers", nil)
	req.Header.Set("X-Request-ID", "req-auth-providers-setting-service-unavailable")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProvidersSetting(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusServiceUnavailable)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "service_unavailable" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Settings service is unavailable" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-auth-providers-setting-service-unavailable" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAuthProvidersSettingSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	if err := app.settingsService.Set(context.Background(), services.SettingAuthEnabledProviders, " google,invalid,github,wecom,github "); err != nil {
		t.Fatalf("failed to seed auth providers setting: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/auth-providers", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProvidersSetting(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if ok, _ := payload["ok"].(bool); !ok {
		t.Fatalf("expected ok=true, got=%#v", payload)
	}
	if got := decodeStringSliceField(t, payload, "auth_providers"); strings.Join(got, ",") != "github,google,wecom" {
		t.Fatalf("unexpected auth_providers: got=%v want=%v", got, []string{"github", "google", "wecom"})
	}
	if got := decodeStringSliceField(t, payload, "available_auth_providers"); strings.Join(got, ",") != "dingtalk,feishu,github,google,wecom,microsoft" {
		t.Fatalf("unexpected available_auth_providers: got=%v", got)
	}
}

func TestAPIAdminAuthProvidersSettingUpdateUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/settings/auth-providers", strings.NewReader(`{"auth_providers":"github"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-auth-providers-update-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProvidersSettingUpdate(recorder, req)

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
	if payload["request_id"] != "req-auth-providers-update-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAuthProvidersSettingUpdateForbidden(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/settings/auth-providers", strings.NewReader(`{"auth_providers":"github"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-auth-providers-update-forbidden")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProvidersSettingUpdate(recorder, req)

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
	if payload["request_id"] != "req-auth-providers-update-forbidden" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAuthProvidersSettingUpdateServiceUnavailable(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	app.settingsService = nil
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/settings/auth-providers", strings.NewReader(`{"auth_providers":"github"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-auth-providers-update-service-unavailable")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProvidersSettingUpdate(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusServiceUnavailable)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "service_unavailable" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Settings service is unavailable" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-auth-providers-update-service-unavailable" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAuthProvidersSettingUpdateSuccessJSONCommaSeparatedString(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := &models.User{ID: 1, Role: models.RoleSuperAdmin}
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/settings/auth-providers", strings.NewReader(`{"auth_providers":"github,google,invalid,google"}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, actor)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProvidersSettingUpdate(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if got := decodeStringSliceField(t, payload, "auth_providers"); strings.Join(got, ",") != "github,google" {
		t.Fatalf("unexpected auth_providers: got=%v", got)
	}
	persisted, err := app.settingsService.Get(context.Background(), services.SettingAuthEnabledProviders, "")
	if err != nil {
		t.Fatalf("failed to read persisted setting: %v", err)
	}
	if persisted != "github,google" {
		t.Fatalf("unexpected persisted setting: got=%s want=github,google", persisted)
	}
	assertLatestAuditAction(t, app, "api_access_auth_providers_update")
}

func TestAPIAdminAuthProvidersSettingUpdateSuccessJSONArray(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/settings/auth-providers", strings.NewReader(`{"auth_providers":["microsoft","github","invalid","microsoft"]}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProvidersSettingUpdate(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if got := decodeStringSliceField(t, payload, "auth_providers"); strings.Join(got, ",") != "github,microsoft" {
		t.Fatalf("unexpected auth_providers: got=%v", got)
	}
}

func TestAPIAdminAuthProvidersSettingUpdateSuccessForm(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	form := strings.NewReader("auth_providers=github&auth_providers=wecom&auth_providers=invalid")
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/settings/auth-providers", form)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProvidersSettingUpdate(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if got := decodeStringSliceField(t, payload, "auth_providers"); strings.Join(got, ",") != "github,wecom" {
		t.Fatalf("unexpected auth_providers: got=%v", got)
	}
}

func TestAPIAdminAuthProvidersSettingUpdateInvalidPayload(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/settings/auth-providers", strings.NewReader(`{"auth_providers":[1,"github"]}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-auth-providers-update-invalid-payload")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProvidersSettingUpdate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "auth_providers[0] must be string" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-auth-providers-update-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func decodeStringSliceField(t *testing.T, payload map[string]any, key string) []string {
	t.Helper()
	raw, ok := payload[key]
	if !ok {
		t.Fatalf("missing %s in payload: %#v", key, payload)
	}
	items, ok := raw.([]any)
	if !ok {
		t.Fatalf("invalid %s type: %#v", key, raw)
	}
	result := make([]string, 0, len(items))
	for _, item := range items {
		value, ok := item.(string)
		if !ok {
			t.Fatalf("invalid %s item type: %#v", key, item)
		}
		result = append(result, value)
	}
	return result
}

func assertLatestAuditAction(t *testing.T, app *App, action string) {
	t.Helper()
	logs, err := app.auditService.ListRecent(context.Background(), services.ListAuditInput{Limit: 5})
	if err != nil {
		t.Fatalf("failed to list audit logs: %v", err)
	}
	if len(logs) == 0 {
		t.Fatalf("expected at least one audit log")
	}
	if logs[0].Action != action {
		t.Fatalf("unexpected latest audit action: got=%s want=%s", logs[0].Action, action)
	}
}
