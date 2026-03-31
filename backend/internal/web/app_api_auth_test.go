package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
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

func TestHandleAPIAuthProvidersReturnsUnifiedManagedProviderStartPath(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	if _, err := app.integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:       "Feishu Workspace",
		Provider:   "feishu",
		BaseURL:    "https://open.feishu.test",
		ConfigJSON: `{"protocol":"oidc","issuer":"https://open.feishu.test","authorization_url":"https://open.feishu.test/oauth/authorize","token_url":"https://open.feishu.test/oauth/token","userinfo_url":"https://open.feishu.test/oauth/userinfo","client_id":"client-feishu","client_secret":"secret-feishu"}`,
		Enabled:    true,
		CreatedBy:  1,
	}); err != nil {
		t.Fatalf("failed to create feishu connector: %v", err)
	}
	if err := app.settingsService.Set(context.Background(), services.SettingAuthEnabledProviders, "feishu"); err != nil {
		t.Fatalf("failed to seed auth provider setting: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/providers", nil)
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9")
	recorder := httptest.NewRecorder()

	app.handleAPIAuthProviders(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	providerKeys := decodeStringSliceField(t, payload, "auth_providers")
	if strings.Join(providerKeys, ",") != "feishu" {
		t.Fatalf("unexpected auth_providers: got=%v want=%v", providerKeys, []string{"feishu"})
	}
	rawItems, ok := payload["items"].([]any)
	if !ok || len(rawItems) != 1 {
		t.Fatalf("unexpected items payload: %#v", payload["items"])
	}
	firstItem, ok := rawItems[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected first provider item type: %#v", rawItems[0])
	}
	if key, _ := firstItem["key"].(string); key != "feishu" {
		t.Fatalf("unexpected provider key: got=%q", key)
	}
	if startPath, _ := firstItem["start_path"].(string); startPath != "/auth/sso/start/feishu" {
		t.Fatalf("unexpected provider start path: got=%q", startPath)
	}
	if label, _ := firstItem["label"].(string); strings.TrimSpace(label) == "" {
		t.Fatalf("expected localized provider label: %#v", firstItem)
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

func TestHandleAPIAuthLoginServiceUnavailableIncludesRequestID(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)
	app.authService = nil

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/login",
		strings.NewReader(`{"username":"account-user","password":"Account123!"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-auth-login-service-unavailable")
	recorder := httptest.NewRecorder()

	app.handleAPIAuthLogin(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusServiceUnavailable)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "service_unavailable" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Authentication service unavailable" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-auth-login-service-unavailable" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIAuthLoginInvalidPayloadIncludesRequestID(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/login",
		strings.NewReader(`{"username":"account-user"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-auth-login-invalid-payload")
	recorder := httptest.NewRecorder()

	app.handleAPIAuthLogin(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Username and password are required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-auth-login-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
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
	req.Header.Set("X-Request-ID", "req-auth-login-invalid-credentials")
	recorder := httptest.NewRecorder()

	app.handleAPIAuthLogin(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	if !strings.Contains(recorder.Body.String(), `"error":"unauthorized"`) {
		t.Fatalf("expected unauthorized error payload")
	}
	payload := decodeBodyMap(t, recorder)
	if payload["request_id"] != "req-auth-login-invalid-credentials" {
		t.Fatalf("unexpected request id: %#v", payload)
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

func TestHandleAPIAuthLoginSessionStartFailedIncludesRequestID(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)
	app.sessionStarter = func(http.ResponseWriter, *http.Request, uint) error {
		return gorm.ErrInvalidDB
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/login",
		strings.NewReader(`{"username":"account-user","password":"Account123!"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-auth-login-session-start-failed")
	recorder := httptest.NewRecorder()

	app.handleAPIAuthLogin(recorder, req)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusInternalServerError)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "session_start_failed" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Failed to start session" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-auth-login-session-start-failed" {
		t.Fatalf("unexpected request id: %#v", payload)
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

func TestHandleAPIAuthMeSettingsQueryFailureIncludesRequestID(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open broken settings db: %v", err)
	}
	app.settingsService = services.NewSettingsService(db)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	req.Header.Set("X-Request-ID", "req-auth-me-settings-query-failed")
	recorder := httptest.NewRecorder()

	app.handleAPIAuthMe(recorder, req)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusInternalServerError)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "settings_query_failed" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Failed to load access settings" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-auth-me-settings-query-failed" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIAuthMeUserNotFoundIncludesRequestID(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)
	if err := app.settingsService.SetBool(context.Background(), services.SettingMarketplacePublicAccess, false); err != nil {
		t.Fatalf("failed to seed marketplace access setting: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	req.Header.Set("X-Request-ID", "req-auth-me-user-not-found")
	req = withCurrentUser(req, &models.User{ID: 999999})
	recorder := httptest.NewRecorder()

	app.handleAPIAuthMe(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "user_not_found" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "User not found" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-auth-me-user-not-found" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestRequireAuthReturnsJSONForAPIRequest(t *testing.T) {
	app := &App{}
	handler := app.requireAuth(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/account/profile", nil)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Request-ID", "req-require-auth-unauthorized")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	if !strings.Contains(recorder.Body.String(), `"error":"unauthorized"`) {
		t.Fatalf("expected unauthorized error payload")
	}
	payload := decodeBodyMap(t, recorder)
	if payload["request_id"] != "req-require-auth-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
