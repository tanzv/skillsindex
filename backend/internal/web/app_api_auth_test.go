package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"skillsindex/internal/services"
)

func applyAPITestTranslations(app *App) {
	app.translations = translationCatalog{
		"en": defaultEnglishTranslations(),
		"zh": {
			"api.auth.invalid_credentials":             "localized-auth-invalid-credentials",
			"api.account.password_reset.invalid_token": "localized-reset-invalid-token",
		},
	}
}

func TestHandleAPIAuthLoginSuccess(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/login",
		strings.NewReader(`{"username":"account-user","password":"Account123!"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIAuthLogin(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"ok":true`) {
		t.Fatalf("missing ok marker in response body: %s", body)
	}
	if !strings.Contains(body, `"username":"account-user"`) {
		t.Fatalf("missing user payload in response body: %s", body)
	}
	if !strings.Contains(recorder.Header().Get("Set-Cookie"), "skillsindex_session=") {
		t.Fatalf("expected session cookie in login response")
	}
}

func TestHandleAPIAuthProvidersReturnsConfiguredAndAvailableItems(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	app.dingTalkService = services.NewDingTalkService(services.DingTalkConfig{
		ClientID:     "test-client-id",
		ClientSecret: "test-client-secret",
		RedirectURL:  "https://example.com/auth/dingtalk/callback",
	})
	if err := app.settingsService.Set(context.Background(), services.SettingAuthEnabledProviders, "dingtalk,github"); err != nil {
		t.Fatalf("failed to seed auth provider setting: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/providers", nil)
	recorder := httptest.NewRecorder()

	app.handleAPIAuthProviders(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if ok, _ := payload["ok"].(bool); !ok {
		t.Fatalf("expected ok=true, got=%#v", payload)
	}
	providerKeys := decodeStringSliceField(t, payload, "auth_providers")
	if strings.Join(providerKeys, ",") != "dingtalk" {
		t.Fatalf("unexpected auth_providers: got=%v want=%v", providerKeys, []string{"dingtalk"})
	}
	rawItems, ok := payload["items"].([]any)
	if !ok || len(rawItems) != 1 {
		t.Fatalf("unexpected items payload: %#v", payload["items"])
	}
	firstItem, ok := rawItems[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected first provider item type: %#v", rawItems[0])
	}
	if key, _ := firstItem["key"].(string); key != "dingtalk" {
		t.Fatalf("unexpected provider key: got=%q", key)
	}
	if startPath, _ := firstItem["start_path"].(string); startPath != "/auth/dingtalk/start" {
		t.Fatalf("unexpected provider start path: got=%q", startPath)
	}
}

func TestHandleAPIAuthProvidersRespectsEnabledProviderSetting(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	app.dingTalkService = services.NewDingTalkService(services.DingTalkConfig{
		ClientID:     "test-client-id",
		ClientSecret: "test-client-secret",
		RedirectURL:  "https://example.com/auth/dingtalk/callback",
	})
	if err := app.settingsService.Set(context.Background(), services.SettingAuthEnabledProviders, "github"); err != nil {
		t.Fatalf("failed to seed auth provider setting: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/providers", nil)
	recorder := httptest.NewRecorder()

	app.handleAPIAuthProviders(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	providerKeys := decodeStringSliceField(t, payload, "auth_providers")
	if len(providerKeys) != 0 {
		t.Fatalf("expected empty enabled auth providers for login page, got=%v", providerKeys)
	}
	rawItems, ok := payload["items"].([]any)
	if !ok {
		t.Fatalf("missing items payload: %#v", payload)
	}
	if len(rawItems) != 0 {
		t.Fatalf("expected no provider items, got=%#v", rawItems)
	}
}

func TestHandleAPIAuthCSRFSuccess(t *testing.T) {
	app := &App{}
	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/csrf", nil)
	recorder := httptest.NewRecorder()

	app.handleAPIAuthCSRF(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !strings.Contains(recorder.Body.String(), `"csrf_token":"`) {
		t.Fatalf("missing csrf token payload: %s", recorder.Body.String())
	}
	if !strings.Contains(recorder.Header().Get("Set-Cookie"), "skillsindex_csrf=") {
		t.Fatalf("expected csrf cookie in response headers")
	}
}

func TestHandleAPIAuthLoginInvalidCredentials(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/login",
		strings.NewReader(`{"username":"account-user","password":"wrong-password"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIAuthLogin(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	if !strings.Contains(recorder.Body.String(), `"error":"unauthorized"`) {
		t.Fatalf("expected unauthorized error payload")
	}
}

func TestHandleAPIAuthLoginInvalidCredentialsLocalizedMessage(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)
	applyAPITestTranslations(app)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/login",
		strings.NewReader(`{"username":"account-user","password":"wrong-password"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9")
	recorder := httptest.NewRecorder()

	app.handleAPIAuthLogin(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	message, ok := payload["message"].(string)
	if !ok {
		t.Fatalf("missing message field in response payload: %#v", payload)
	}
	if message != "localized-auth-invalid-credentials" {
		t.Fatalf("unexpected localized message: got=%q", message)
	}
}

func TestHandleAPIAuthMeReturnsCurrentUser(t *testing.T) {
	app, _, _, user := setupAccountHandlersTestApp(t)
	if err := app.settingsService.SetBool(context.Background(), services.SettingMarketplacePublicAccess, false); err != nil {
		t.Fatalf("failed to seed marketplace access setting: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	req.Header.Set("Accept", "application/json")
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleAPIAuthMe(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !strings.Contains(recorder.Body.String(), `"username":"account-user"`) {
		t.Fatalf("missing current user in response body")
	}
	if !strings.Contains(recorder.Body.String(), `"marketplace_public_access":false`) {
		t.Fatalf("missing marketplace_public_access flag in response body: %s", recorder.Body.String())
	}
}

func TestHandleAPIAuthMeReturnsNilForAnonymousSession(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)
	if err := app.settingsService.SetBool(context.Background(), services.SettingMarketplacePublicAccess, false); err != nil {
		t.Fatalf("failed to seed marketplace access setting: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIAuthMe(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !strings.Contains(recorder.Body.String(), `"user":null`) {
		t.Fatalf("expected nil user payload in response body: %s", recorder.Body.String())
	}
	if !strings.Contains(recorder.Body.String(), `"marketplace_public_access":false`) {
		t.Fatalf("missing marketplace_public_access flag in response body: %s", recorder.Body.String())
	}
}

func TestRequireAuthReturnsJSONForAPIRequest(t *testing.T) {
	app := &App{}
	handler := app.requireAuth(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/account/profile", nil)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	if !strings.Contains(recorder.Body.String(), `"error":"unauthorized"`) {
		t.Fatalf("expected unauthorized error payload")
	}
}
