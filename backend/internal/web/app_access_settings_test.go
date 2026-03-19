package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPIAdminRegistrationSettingUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/registration", nil)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRegistrationSetting(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
}

func TestAPIAdminRegistrationSettingForbidden(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/registration", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRegistrationSetting(recorder, req)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
}

func TestAPIAdminRegistrationSettingSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	if err := app.settingsService.SetBool(context.Background(), services.SettingAllowRegistration, false); err != nil {
		t.Fatalf("failed to seed registration setting: %v", err)
	}
	if err := app.settingsService.SetBool(context.Background(), services.SettingMarketplacePublicAccess, false); err != nil {
		t.Fatalf("failed to seed marketplace access setting: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/registration", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRegistrationSetting(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	allowRegistration, ok := payload["allow_registration"].(bool)
	if !ok {
		t.Fatalf("missing allow_registration in response: %#v", payload)
	}
	if allowRegistration {
		t.Fatalf("expected allow_registration=false")
	}
	marketplacePublicAccess, ok := payload["marketplace_public_access"].(bool)
	if !ok {
		t.Fatalf("missing marketplace_public_access in response: %#v", payload)
	}
	if marketplacePublicAccess {
		t.Fatalf("expected marketplace_public_access=false")
	}
}

func TestAPIAdminRegistrationSettingUpdateSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/settings/registration",
		strings.NewReader(`{"allow_registration":false,"marketplace_public_access":false}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRegistrationSettingUpdate(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	allowRegistration, ok := payload["allow_registration"].(bool)
	if !ok {
		t.Fatalf("missing allow_registration in response: %#v", payload)
	}
	if allowRegistration {
		t.Fatalf("expected allow_registration=false")
	}
	marketplacePublicAccess, ok := payload["marketplace_public_access"].(bool)
	if !ok {
		t.Fatalf("missing marketplace_public_access in response: %#v", payload)
	}
	if marketplacePublicAccess {
		t.Fatalf("expected marketplace_public_access=false")
	}

	persisted, err := app.settingsService.GetBool(context.Background(), services.SettingAllowRegistration, true)
	if err != nil {
		t.Fatalf("failed to read persisted setting: %v", err)
	}
	if persisted {
		t.Fatalf("expected persisted allow_registration=false")
	}

	persistedMarketplaceAccess, err := app.settingsService.GetBool(context.Background(), services.SettingMarketplacePublicAccess, true)
	if err != nil {
		t.Fatalf("failed to read persisted marketplace access setting: %v", err)
	}
	if persistedMarketplaceAccess {
		t.Fatalf("expected persisted marketplace_public_access=false")
	}
}

func TestAPIAdminRegistrationSettingUpdateInvalidPayload(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/settings/registration",
		strings.NewReader(`{"allow_registration":"maybe"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRegistrationSettingUpdate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
}

func TestEnsureMarketplaceAccessRedirectsAnonymousHTMLToVariantLoginWithRedirect(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	if err := app.settingsService.SetBool(context.Background(), services.SettingMarketplacePublicAccess, false); err != nil {
		t.Fatalf("failed to seed marketplace access setting: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/light/skills/11?tab=files", nil)
	recorder := httptest.NewRecorder()

	allowed := app.ensureMarketplaceAccess(recorder, req)

	if allowed {
		t.Fatalf("expected marketplace access guard to block anonymous request")
	}
	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if got := recorder.Header().Get("Location"); got != "/light/login?redirect=%2Flight%2Fskills%2F11%3Ftab%3Dfiles" {
		t.Fatalf("unexpected redirect location: got=%s", got)
	}
}

func TestAdminAccessRegistrationUpdateForm(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	form := url.Values{}
	form.Set("allow_registration", "true")
	req := httptest.NewRequest(
		http.MethodPost,
		"/admin/access/registration?section=access",
		strings.NewReader(form.Encode()),
	)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAdminAccessRegistrationUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.HasPrefix(location, "/admin/access?msg=") {
		t.Fatalf("unexpected redirect location: %s", location)
	}

	persisted, err := app.settingsService.GetBool(context.Background(), services.SettingAllowRegistration, false)
	if err != nil {
		t.Fatalf("failed to read persisted setting: %v", err)
	}
	if !persisted {
		t.Fatalf("expected persisted allow_registration=true")
	}
}

func TestAdminAccessRegistrationUpdatePermissionDenied(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/admin/access/registration", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAdminAccessRegistrationUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "err=Permission+denied") {
		t.Fatalf("expected permission denied redirect, got=%s", location)
	}
}

func TestAdminAccessAuthProvidersUpdateForm(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	form := url.Values{}
	form.Add("auth_providers", "github")
	form.Add("auth_providers", "microsoft")
	form.Add("auth_providers", "invalid-provider")
	req := httptest.NewRequest(
		http.MethodPost,
		"/admin/access/auth-providers?section=access",
		strings.NewReader(form.Encode()),
	)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAdminAccessAuthProvidersUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.HasPrefix(location, "/admin/access?msg=") {
		t.Fatalf("unexpected redirect location: %s", location)
	}

	persisted, err := app.settingsService.Get(context.Background(), services.SettingAuthEnabledProviders, "")
	if err != nil {
		t.Fatalf("failed to read persisted auth providers setting: %v", err)
	}
	if persisted != "github,microsoft" {
		t.Fatalf("unexpected persisted auth providers: got=%s want=github,microsoft", persisted)
	}
}

func TestAdminAccessAuthProvidersUpdatePermissionDenied(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/admin/access/auth-providers", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAdminAccessAuthProvidersUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "err=Permission+denied") {
		t.Fatalf("expected permission denied redirect, got=%s", location)
	}
}

func TestAdminAccessAuthProvidersUpdateAllowsEmptySelection(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/admin/access/auth-providers?section=access",
		strings.NewReader(""),
	)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAdminAccessAuthProvidersUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}

	persisted, err := app.settingsService.Get(context.Background(), services.SettingAuthEnabledProviders, "fallback")
	if err != nil {
		t.Fatalf("failed to read persisted auth providers setting: %v", err)
	}
	if persisted != "" {
		t.Fatalf("unexpected persisted auth providers: got=%s want=<empty>", persisted)
	}
}

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
}
