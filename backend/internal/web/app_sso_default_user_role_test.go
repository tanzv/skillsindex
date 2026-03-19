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
)

func TestHandleSSOCallbackAssignsConfiguredDefaultUserRole(t *testing.T) {
	app, authSvc, integrationSvc, oauthSvc, admin := setupSSOHandlersTestApp(t)

	tokenCode := "code-default-user-role"
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/oauth/token":
			if err := r.ParseForm(); err != nil {
				t.Fatalf("failed to parse token payload: %v", err)
			}
			if r.FormValue("code") != tokenCode {
				t.Fatalf("unexpected code: %s", r.FormValue("code"))
			}
			_ = json.NewEncoder(w).Encode(map[string]any{
				"access_token": "token-user-role",
				"token_type":   "Bearer",
				"expires_in":   3600,
				"scope":        "openid profile email",
			})
		case "/oauth/userinfo":
			if got := strings.TrimSpace(r.Header.Get("Authorization")); got != "Bearer token-user-role" {
				t.Fatalf("unexpected authorization header: %s", got)
			}
			_ = json.NewEncoder(w).Encode(map[string]any{
				"sub":                "ext-user-role-1",
				"preferred_username": "oidc-user-role",
			})
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	configRaw := fmt.Sprintf(
		`{"protocol":"oidc","authorization_url":"%s/oauth/authorize","token_url":"%s/oauth/token","userinfo_url":"%s/oauth/userinfo","client_id":"client-1","client_secret":"secret-1","scope":"openid profile email","claim_external_id":"sub","claim_username":"preferred_username","default_user_role":"viewer"}`,
		server.URL,
		server.URL,
		server.URL,
	)
	if _, err := integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:       "Corp OIDC Role",
		Provider:   "corp-sso-role",
		ConfigJSON: configRaw,
		Enabled:    true,
		CreatedBy:  admin.ID,
	}); err != nil {
		t.Fatalf("failed to create sso provider connector: %v", err)
	}

	startReq := httptest.NewRequest(http.MethodGet, "/auth/sso/start/corp-sso-role", nil)
	startReq = withRouteParam(startReq, "provider", "corp-sso-role")
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
		"/auth/sso/callback/corp-sso-role?state="+url.QueryEscape(state)+"&code="+url.QueryEscape(tokenCode),
		nil,
	)
	callbackReq = withRouteParam(callbackReq, "provider", "corp-sso-role")
	for _, cookie := range cookies {
		callbackReq.AddCookie(cookie)
	}
	callbackRecorder := httptest.NewRecorder()
	app.handleSSOCallback(callbackRecorder, callbackReq)
	if callbackRecorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected callback status: got=%d want=%d", callbackRecorder.Code, http.StatusSeeOther)
	}

	createdUser, err := oauthSvc.FindUserByExternalID(context.Background(), ssoOAuthProvider("corp-sso-role"), "ext-user-role-1")
	if err != nil {
		t.Fatalf("failed to find mapped user by external id: %v", err)
	}
	loaded, err := authSvc.GetUserByID(context.Background(), createdUser.ID)
	if err != nil {
		t.Fatalf("failed to load mapped user: %v", err)
	}
	if loaded.EffectiveRole() != models.RoleViewer {
		t.Fatalf("unexpected role: got=%s want=%s", loaded.EffectiveRole(), models.RoleViewer)
	}
}
