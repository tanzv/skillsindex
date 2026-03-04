package web

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupSSOHandlersTestApp(t *testing.T) (*App, *services.AuthService, *services.IntegrationService, *services.OAuthGrantService, models.User) {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.OAuthGrant{},
		&models.IntegrationConnector{},
		&models.Organization{},
		&models.OrganizationMember{},
	); err != nil {
		t.Fatalf("failed to migrate sso models: %v", err)
	}

	authSvc := services.NewAuthService(db)
	integrationSvc := services.NewIntegrationService(db)
	oauthSvc := services.NewOAuthGrantService(db)

	admin, err := authSvc.Register(context.Background(), "sso-admin", "Admin123!")
	if err != nil {
		t.Fatalf("failed to create admin user: %v", err)
	}
	if err := authSvc.SetUserRole(context.Background(), admin.ID, models.RoleSuperAdmin); err != nil {
		t.Fatalf("failed to set admin role: %v", err)
	}
	admin, err = authSvc.GetUserByID(context.Background(), admin.ID)
	if err != nil {
		t.Fatalf("failed to reload admin user: %v", err)
	}

	app := &App{
		authService:       authSvc,
		sessionService:    services.NewSessionService("test-secret", false),
		oauthGrantService: oauthSvc,
		integrationSvc:    integrationSvc,
		organizationSvc:   services.NewOrganizationService(db),
		cookieSecure:      false,
	}
	return app, authSvc, integrationSvc, oauthSvc, admin
}

func TestHandleSSOStartAndCallbackSuccess(t *testing.T) {
	app, authSvc, integrationSvc, oauthSvc, admin := setupSSOHandlersTestApp(t)

	tokenCode := "code-abc-1"
	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/oauth/token":
			if err := r.ParseForm(); err != nil {
				t.Fatalf("failed to parse token payload: %v", err)
			}
			if r.FormValue("code") != tokenCode {
				t.Fatalf("unexpected code: %s", r.FormValue("code"))
			}
			_ = json.NewEncoder(w).Encode(map[string]any{
				"access_token": "token-123",
				"token_type":   "Bearer",
				"expires_in":   3600,
				"scope":        "openid profile email",
			})
		case "/oauth/userinfo":
			if got := strings.TrimSpace(r.Header.Get("Authorization")); got != "Bearer token-123" {
				t.Fatalf("unexpected authorization header: %s", got)
			}
			_ = json.NewEncoder(w).Encode(map[string]any{
				"sub":                "ext-user-1",
				"preferred_username": "oidc-user",
			})
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	configRaw := fmt.Sprintf(
		`{"protocol":"oidc","authorization_url":"%s/oauth/authorize","token_url":"%s/oauth/token","userinfo_url":"%s/oauth/userinfo","client_id":"client-1","client_secret":"secret-1","scope":"openid profile email","claim_external_id":"sub","claim_username":"preferred_username"}`,
		server.URL,
		server.URL,
		server.URL,
	)
	if _, err := integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:       "Corp OIDC",
		Provider:   "corp-sso",
		ConfigJSON: configRaw,
		Enabled:    true,
		CreatedBy:  admin.ID,
	}); err != nil {
		t.Fatalf("failed to create sso provider connector: %v", err)
	}

	startReq := httptest.NewRequest(http.MethodGet, "/auth/sso/start/corp-sso", nil)
	startReq = withRouteParam(startReq, "provider", "corp-sso")
	startRecorder := httptest.NewRecorder()
	app.handleSSOStart(startRecorder, startReq)

	if startRecorder.Code != http.StatusTemporaryRedirect {
		t.Fatalf("unexpected start status: got=%d want=%d", startRecorder.Code, http.StatusTemporaryRedirect)
	}
	startLocation := startRecorder.Header().Get("Location")
	redirectURL, err := url.Parse(startLocation)
	if err != nil {
		t.Fatalf("failed to parse redirect url: %v", err)
	}
	state := strings.TrimSpace(redirectURL.Query().Get("state"))
	if state == "" {
		t.Fatalf("expected non-empty state")
	}
	cookies := startRecorder.Result().Cookies()
	if len(cookies) == 0 {
		t.Fatalf("expected state cookie from sso start")
	}

	callbackReq := httptest.NewRequest(http.MethodGet, "/auth/sso/callback/corp-sso?state="+url.QueryEscape(state)+"&code="+url.QueryEscape(tokenCode), nil)
	callbackReq = withRouteParam(callbackReq, "provider", "corp-sso")
	for _, cookie := range cookies {
		callbackReq.AddCookie(cookie)
	}
	callbackRecorder := httptest.NewRecorder()

	app.handleSSOCallback(callbackRecorder, callbackReq)
	if callbackRecorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected callback status: got=%d want=%d", callbackRecorder.Code, http.StatusSeeOther)
	}
	if got := callbackRecorder.Header().Get("Location"); !strings.HasPrefix(got, "/admin?msg=") {
		t.Fatalf("unexpected callback redirect: %s", got)
	}

	createdUser, err := oauthSvc.FindUserByExternalID(context.Background(), ssoOAuthProvider("corp-sso"), "ext-user-1")
	if err != nil {
		t.Fatalf("failed to find mapped user by external id: %v", err)
	}
	loaded, err := authSvc.GetUserByID(context.Background(), createdUser.ID)
	if err != nil {
		t.Fatalf("failed to load mapped user: %v", err)
	}
	if !strings.HasPrefix(loaded.Username, "oidc-user") {
		t.Fatalf("unexpected mapped username: %s", loaded.Username)
	}
}

func TestHandleSSOCallbackRejectsInvalidIDToken(t *testing.T) {
	app, _, integrationSvc, _, admin := setupSSOHandlersTestApp(t)

	tokenCode := "code-invalid-id-token"
	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/.well-known/openid-configuration":
			_ = json.NewEncoder(w).Encode(map[string]any{
				"issuer":   server.URL,
				"jwks_uri": server.URL + "/oauth/keys",
			})
		case "/oauth/keys":
			_ = json.NewEncoder(w).Encode(map[string]any{
				"keys": []any{},
			})
		case "/oauth/token":
			if err := r.ParseForm(); err != nil {
				t.Fatalf("failed to parse token payload: %v", err)
			}
			if r.FormValue("code") != tokenCode {
				t.Fatalf("unexpected code: %s", r.FormValue("code"))
			}
			_ = json.NewEncoder(w).Encode(map[string]any{
				"access_token": "token-oidc",
				"token_type":   "Bearer",
				"expires_in":   3600,
				"id_token":     "invalid.id.token",
			})
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	configRaw := fmt.Sprintf(
		`{"protocol":"oidc","issuer":"%s","authorization_url":"%s/oauth/authorize","token_url":"%s/oauth/token","userinfo_url":"%s/oauth/userinfo","client_id":"client-1","client_secret":"secret-1","scope":"openid profile email","claim_external_id":"sub","claim_username":"preferred_username"}`,
		server.URL,
		server.URL,
		server.URL,
		server.URL,
	)
	if _, err := integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:       "Corp OIDC Invalid Token",
		Provider:   "corp-sso-invalid",
		ConfigJSON: configRaw,
		Enabled:    true,
		CreatedBy:  admin.ID,
	}); err != nil {
		t.Fatalf("failed to create sso provider connector: %v", err)
	}

	startReq := httptest.NewRequest(http.MethodGet, "/auth/sso/start/corp-sso-invalid", nil)
	startReq = withRouteParam(startReq, "provider", "corp-sso-invalid")
	startRecorder := httptest.NewRecorder()
	app.handleSSOStart(startRecorder, startReq)

	if startRecorder.Code != http.StatusTemporaryRedirect {
		t.Fatalf("unexpected start status: got=%d want=%d", startRecorder.Code, http.StatusTemporaryRedirect)
	}
	startLocation := startRecorder.Header().Get("Location")
	redirectURL, err := url.Parse(startLocation)
	if err != nil {
		t.Fatalf("failed to parse redirect url: %v", err)
	}
	state := strings.TrimSpace(redirectURL.Query().Get("state"))
	if state == "" {
		t.Fatalf("expected non-empty state")
	}
	cookies := startRecorder.Result().Cookies()
	if len(cookies) == 0 {
		t.Fatalf("expected state cookie from sso start")
	}

	callbackReq := httptest.NewRequest(
		http.MethodGet,
		"/auth/sso/callback/corp-sso-invalid?state="+url.QueryEscape(state)+"&code="+url.QueryEscape(tokenCode),
		nil,
	)
	callbackReq = withRouteParam(callbackReq, "provider", "corp-sso-invalid")
	for _, cookie := range cookies {
		callbackReq.AddCookie(cookie)
	}
	callbackRecorder := httptest.NewRecorder()

	app.handleSSOCallback(callbackRecorder, callbackReq)
	if callbackRecorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected callback status: got=%d want=%d", callbackRecorder.Code, http.StatusSeeOther)
	}
	location := callbackRecorder.Header().Get("Location")
	if !strings.HasPrefix(location, "/login?err=") {
		t.Fatalf("unexpected callback redirect: %s", location)
	}
	if !strings.Contains(location, "Invalid+SSO+identity+token") {
		t.Fatalf("expected id token error redirect, got=%s", location)
	}
}

func TestHandleAdminSSOProviderCreateAndDisable(t *testing.T) {
	app, _, integrationSvc, _, admin := setupSSOHandlersTestApp(t)

	form := url.Values{}
	form.Set("name", "Corp OIDC")
	form.Set("provider", "corp-sso")
	form.Set("authorization_url", "https://idp.example.com/oauth/authorize")
	form.Set("token_url", "https://idp.example.com/oauth/token")
	form.Set("userinfo_url", "https://idp.example.com/oauth/userinfo")
	form.Set("client_id", "client-1")
	form.Set("client_secret", "secret-1")
	form.Set("scope", "openid profile email")

	createReq := httptest.NewRequest(http.MethodPost, "/admin/sso/providers/create", strings.NewReader(form.Encode()))
	createReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	createReq = withCurrentUser(createReq, &admin)
	createRecorder := httptest.NewRecorder()

	app.handleAdminSSOProviderCreate(createRecorder, createReq)
	if createRecorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected create status: got=%d want=%d", createRecorder.Code, http.StatusSeeOther)
	}

	created, err := integrationSvc.GetConnectorByProvider(context.Background(), "corp-sso", true)
	if err != nil {
		t.Fatalf("failed to load created provider: %v", err)
	}
	if !created.Enabled {
		t.Fatalf("expected created provider enabled")
	}

	disableReq := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/admin/sso/providers/%d/disable", created.ID), nil)
	disableReq = withCurrentUser(disableReq, &admin)
	disableReq = withRouteParam(disableReq, "providerID", fmt.Sprintf("%d", created.ID))
	disableRecorder := httptest.NewRecorder()

	app.handleAdminSSOProviderDisable(disableRecorder, disableReq)
	if disableRecorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected disable status: got=%d want=%d", disableRecorder.Code, http.StatusSeeOther)
	}

	disabled, err := integrationSvc.GetConnectorByID(context.Background(), created.ID)
	if err != nil {
		t.Fatalf("failed to load disabled provider: %v", err)
	}
	if disabled.Enabled {
		t.Fatalf("expected provider to be disabled")
	}
}
