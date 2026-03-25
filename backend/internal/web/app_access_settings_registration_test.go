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

func TestAPIAdminRegistrationSettingUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/registration", nil)
	req.Header.Set("X-Request-ID", "req-registration-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRegistrationSetting(recorder, req)

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
	if payload["request_id"] != "req-registration-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
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
	req.Header.Set("X-Request-ID", "req-registration-invalid-payload")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRegistrationSettingUpdate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error code: %#v", payload)
	}
	if payload["message"] != "invalid bool value for allow_registration" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-registration-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAdminAccessRegistrationUpdateForm(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	form := make(map[string]string)
	form["allow_registration"] = "true"
	req := httptest.NewRequest(
		http.MethodPost,
		"/admin/access/registration?section=access",
		strings.NewReader("allow_registration=true"),
	)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	_ = form
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
