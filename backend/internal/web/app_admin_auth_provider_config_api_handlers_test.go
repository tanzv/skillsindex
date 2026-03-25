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

func TestAPIAdminAuthProviderConfigsServiceUnavailable(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	app.settingsService = nil
	admin := &models.User{ID: 1, Role: models.RoleSuperAdmin}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/auth-provider-configs", nil)
	req.Header.Set("X-Request-ID", "req-admin-auth-provider-configs-service-unavailable")
	req = withCurrentUser(req, admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProviderConfigs(recorder, req)

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
	if payload["request_id"] != "req-admin-auth-provider-configs-service-unavailable" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAuthProviderConfigsListIncludesConfiguredProviders(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	admin := &models.User{ID: 1, Role: models.RoleSuperAdmin}

	if _, err := app.integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:       "Feishu SSO",
		Provider:   "feishu",
		BaseURL:    "https://open.feishu.test",
		ConfigJSON: `{"protocol":"oidc","issuer":"https://open.feishu.test","authorization_url":"https://open.feishu.test/oauth/authorize","token_url":"https://open.feishu.test/oauth/token","userinfo_url":"https://open.feishu.test/oauth/userinfo","client_id":"client-feishu","client_secret":"secret-feishu"}`,
		Enabled:    true,
		CreatedBy:  admin.ID,
	}); err != nil {
		t.Fatalf("failed to create feishu connector: %v", err)
	}
	if err := app.settingsService.Set(context.Background(), services.SettingAuthEnabledProviders, "feishu"); err != nil {
		t.Fatalf("failed to seed auth provider setting: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/auth-provider-configs", nil)
	req = withCurrentUser(req, admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProviderConfigs(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	payload := decodeBodyMap(t, recorder)
	items, ok := payload["items"].([]any)
	if !ok || len(items) == 0 {
		t.Fatalf("expected non-empty items payload: %#v", payload)
	}

	var feishu map[string]any
	for _, rawItem := range items {
		item, ok := rawItem.(map[string]any)
		if !ok {
			t.Fatalf("unexpected item payload: %#v", rawItem)
		}
		if key, _ := item["key"].(string); key == "feishu" {
			feishu = item
			break
		}
	}
	if feishu == nil {
		t.Fatalf("expected feishu provider in payload: %#v", items)
	}
	if enabled, _ := feishu["enabled"].(bool); !enabled {
		t.Fatalf("expected feishu provider to be enabled: %#v", feishu)
	}
	if connected, _ := feishu["connected"].(bool); !connected {
		t.Fatalf("expected feishu provider to be connected: %#v", feishu)
	}
	if startPath, _ := feishu["start_path"].(string); startPath != "/auth/sso/start/feishu" {
		t.Fatalf("unexpected start path: got=%q want=%q", startPath, "/auth/sso/start/feishu")
	}
}

func TestAPIAdminAuthProviderConfigUpsertCreatesConnectorAndEnablesProvider(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	admin := &models.User{ID: 1, Role: models.RoleSuperAdmin}
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/auth-provider-configs", strings.NewReader(`{
		"provider":"feishu",
		"name":"Feishu Workspace",
		"description":"Primary workspace login",
		"issuer":"https://open.feishu.test",
		"authorization_url":"https://open.feishu.test/oauth/authorize",
		"token_url":"https://open.feishu.test/oauth/token",
		"userinfo_url":"https://open.feishu.test/oauth/userinfo",
		"client_id":"client-feishu",
		"client_secret":"secret-feishu"
	}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProviderConfigUpsert(recorder, req)

	if recorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusCreated, recorder.Body.String())
	}

	connector, err := app.integrationSvc.GetConnectorByProvider(context.Background(), "feishu", true)
	if err != nil {
		t.Fatalf("failed to load created connector: %v", err)
	}
	if !connector.Enabled {
		t.Fatalf("expected created connector to be enabled")
	}

	persisted, err := app.settingsService.Get(context.Background(), services.SettingAuthEnabledProviders, "")
	if err != nil {
		t.Fatalf("failed to read persisted setting: %v", err)
	}
	if persisted != "feishu" {
		t.Fatalf("unexpected persisted setting: got=%q want=%q", persisted, "feishu")
	}
}

func TestAPIAdminAuthProviderConfigUpsertInvalidPayload(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	admin := &models.User{ID: 1, Role: models.RoleSuperAdmin}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/auth-provider-configs", strings.NewReader(`{"provider":`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-admin-auth-provider-config-upsert-invalid-payload")
	req = withCurrentUser(req, admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProviderConfigUpsert(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-admin-auth-provider-config-upsert-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAuthProviderConfigUpsertProviderRequired(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	admin := &models.User{ID: 1, Role: models.RoleSuperAdmin}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/auth-provider-configs", strings.NewReader(`{"provider":"  "}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-admin-auth-provider-config-upsert-provider-required")
	req = withCurrentUser(req, admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProviderConfigUpsert(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "provider_required" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Provider is required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-auth-provider-config-upsert-provider-required" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAuthProviderConfigDisableTurnsOffConnectorAndVisibility(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	admin := &models.User{ID: 1, Role: models.RoleSuperAdmin}

	created, err := app.integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:       "Feishu SSO",
		Provider:   "feishu",
		BaseURL:    "https://open.feishu.test",
		ConfigJSON: `{"protocol":"oidc","issuer":"https://open.feishu.test","authorization_url":"https://open.feishu.test/oauth/authorize","token_url":"https://open.feishu.test/oauth/token","userinfo_url":"https://open.feishu.test/oauth/userinfo","client_id":"client-feishu","client_secret":"secret-feishu"}`,
		Enabled:    true,
		CreatedBy:  admin.ID,
	})
	if err != nil {
		t.Fatalf("failed to create feishu connector: %v", err)
	}
	if err := app.settingsService.Set(context.Background(), services.SettingAuthEnabledProviders, "feishu,github"); err != nil {
		t.Fatalf("failed to seed auth provider setting: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/auth-provider-configs/feishu/disable", nil)
	req = withURLParam(req, "provider", "feishu")
	req = withCurrentUser(req, admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProviderConfigDisable(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	disabled, err := app.integrationSvc.GetConnectorByID(context.Background(), created.ID)
	if err != nil {
		t.Fatalf("failed to load disabled connector: %v", err)
	}
	if disabled.Enabled {
		t.Fatalf("expected connector to be disabled")
	}

	persisted, err := app.settingsService.Get(context.Background(), services.SettingAuthEnabledProviders, "")
	if err != nil {
		t.Fatalf("failed to read persisted setting: %v", err)
	}
	if persisted != "github" {
		t.Fatalf("unexpected persisted setting: got=%q want=%q", persisted, "github")
	}
}

func TestAPIAdminAuthProviderConfigDisableProviderNotFound(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	admin := &models.User{ID: 1, Role: models.RoleSuperAdmin}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/auth-provider-configs/unknown/disable", nil)
	req.Header.Set("X-Request-ID", "req-admin-auth-provider-config-disable-provider-not-found")
	req = withURLParam(req, "provider", "unknown")
	req = withCurrentUser(req, admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAuthProviderConfigDisable(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "provider_not_found" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Provider not found" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-auth-provider-config-disable-provider-not-found" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
