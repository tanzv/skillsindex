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

func TestEnsureMarketplaceAccessBlocksAnonymousJSONWithStructuredError(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	if err := app.settingsService.SetBool(context.Background(), services.SettingMarketplacePublicAccess, false); err != nil {
		t.Fatalf("failed to seed marketplace access setting: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/11", nil)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Request-ID", "req-marketplace-access-unauthorized")
	recorder := httptest.NewRecorder()

	allowed := app.ensureMarketplaceAccess(recorder, req)

	if allowed {
		t.Fatalf("expected marketplace access guard to block anonymous json request")
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
	if payload["request_id"] != "req-marketplace-access-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
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
