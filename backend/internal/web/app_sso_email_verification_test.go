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

	"skillsindex/internal/services"
)

func executeSSOAuthorizationCodeFlow(
	t *testing.T,
	app *App,
	provider string,
	tokenCode string,
) *httptest.ResponseRecorder {
	t.Helper()

	startReq := httptest.NewRequest(http.MethodGet, "/auth/sso/start/"+provider, nil)
	startReq = withRouteParam(startReq, "provider", provider)
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
		"/auth/sso/callback/"+provider+"?state="+url.QueryEscape(state)+"&code="+url.QueryEscape(tokenCode),
		nil,
	)
	callbackReq = withRouteParam(callbackReq, "provider", provider)
	for _, cookie := range cookies {
		callbackReq.AddCookie(cookie)
	}
	callbackRecorder := httptest.NewRecorder()
	app.handleSSOCallback(callbackRecorder, callbackReq)
	return callbackRecorder
}

func TestHandleSSOCallbackSkipsDefaultOrgJoinWhenEmailUnverified(t *testing.T) {
	app, _, integrationSvc, oauthSvc, admin := setupSSOHandlersTestApp(t)

	org, err := app.organizationSvc.CreateOrganization(context.Background(), "Verified Domain Org", admin.ID)
	if err != nil {
		t.Fatalf("failed to create organization: %v", err)
	}

	tokenCode := "code-unverified-domain"
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
				"access_token": "token-unverified-domain",
				"token_type":   "Bearer",
				"expires_in":   3600,
			})
		case "/oauth/userinfo":
			_ = json.NewEncoder(w).Encode(map[string]any{
				"sub":                "ext-unverified-domain-1",
				"preferred_username": "unverified-domain-user",
				"email":              "user@corp.example.com",
				"email_verified":     false,
			})
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	configRaw := fmt.Sprintf(
		`{"protocol":"oidc","authorization_url":"%s/oauth/authorize","token_url":"%s/oauth/token","userinfo_url":"%s/oauth/userinfo","client_id":"client-1","client_secret":"secret-1","scope":"openid profile email","claim_external_id":"sub","claim_username":"preferred_username","claim_email":"email","claim_email_verified":"email_verified","default_org_id":"%d","default_org_role":"viewer","default_org_email_domains":"corp.example.com"}`,
		server.URL,
		server.URL,
		server.URL,
		org.ID,
	)
	if _, err := integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:       "Corp OIDC Verified Email Guard",
		Provider:   "corp-sso-unverified-domain",
		ConfigJSON: configRaw,
		Enabled:    true,
		CreatedBy:  admin.ID,
	}); err != nil {
		t.Fatalf("failed to create sso provider connector: %v", err)
	}

	callbackRecorder := executeSSOAuthorizationCodeFlow(t, app, "corp-sso-unverified-domain", tokenCode)
	if callbackRecorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected callback status: got=%d want=%d", callbackRecorder.Code, http.StatusSeeOther)
	}

	createdUser, err := oauthSvc.FindUserByExternalID(context.Background(), ssoOAuthProvider("corp-sso-unverified-domain"), "ext-unverified-domain-1")
	if err != nil {
		t.Fatalf("failed to find mapped user by external id: %v", err)
	}
	memberships, err := app.organizationSvc.ListMembershipsByUser(context.Background(), createdUser.ID)
	if err != nil {
		t.Fatalf("failed to list memberships: %v", err)
	}
	if len(memberships) != 0 {
		t.Fatalf("expected no membership when email is unverified, got=%d", len(memberships))
	}
}

func TestHandleSSOCallbackSkipsEmailMappingWhenEmailUnverified(t *testing.T) {
	app, authSvc, integrationSvc, oauthSvc, admin := setupSSOHandlersTestApp(t)

	existing, err := authSvc.Register(context.Background(), "mapped@corp.example.com", "Member123!")
	if err != nil {
		t.Fatalf("failed to create existing user: %v", err)
	}

	tokenCode := "code-unverified-mapping"
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
				"access_token": "token-unverified-mapping",
				"token_type":   "Bearer",
				"expires_in":   3600,
			})
		case "/oauth/userinfo":
			_ = json.NewEncoder(w).Encode(map[string]any{
				"sub":                "ext-unverified-mapping-1",
				"preferred_username": "unverified-mapping-user",
				"email":              "mapped@corp.example.com",
				"email_verified":     false,
			})
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	configRaw := fmt.Sprintf(
		`{"protocol":"oidc","authorization_url":"%s/oauth/authorize","token_url":"%s/oauth/token","userinfo_url":"%s/oauth/userinfo","client_id":"client-1","client_secret":"secret-1","scope":"openid profile email","claim_external_id":"sub","claim_username":"preferred_username","claim_email":"email","claim_email_verified":"email_verified","mapping_mode":"external_email"}`,
		server.URL,
		server.URL,
		server.URL,
	)
	if _, err := integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:       "Corp OIDC Verified Mapping",
		Provider:   "corp-sso-unverified-mapping",
		ConfigJSON: configRaw,
		Enabled:    true,
		CreatedBy:  admin.ID,
	}); err != nil {
		t.Fatalf("failed to create sso provider connector: %v", err)
	}

	callbackRecorder := executeSSOAuthorizationCodeFlow(t, app, "corp-sso-unverified-mapping", tokenCode)
	if callbackRecorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected callback status: got=%d want=%d", callbackRecorder.Code, http.StatusSeeOther)
	}

	mappedUser, err := oauthSvc.FindUserByExternalID(context.Background(), ssoOAuthProvider("corp-sso-unverified-mapping"), "ext-unverified-mapping-1")
	if err != nil {
		t.Fatalf("failed to load mapped user: %v", err)
	}
	if mappedUser.ID == existing.ID {
		t.Fatalf("expected unverified email not to map existing local user by email")
	}
	if !strings.HasPrefix(mappedUser.Username, "unverified-mapping-user") {
		t.Fatalf("unexpected mapped username: %s", mappedUser.Username)
	}
}
