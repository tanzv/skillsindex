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

func TestHandleSSOCallbackAutoJoinsDefaultOrganization(t *testing.T) {
	app, authSvc, integrationSvc, oauthSvc, admin := setupSSOHandlersTestApp(t)

	org, err := app.organizationSvc.CreateOrganization(context.Background(), "Default Org", admin.ID)
	if err != nil {
		t.Fatalf("failed to create default organization: %v", err)
	}

	tokenCode := "code-org-join"
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
				"access_token": "token-org-join",
				"token_type":   "Bearer",
				"expires_in":   3600,
				"scope":        "openid profile email",
			})
		case "/oauth/userinfo":
			if got := strings.TrimSpace(r.Header.Get("Authorization")); got != "Bearer token-org-join" {
				t.Fatalf("unexpected authorization header: %s", got)
			}
			_ = json.NewEncoder(w).Encode(map[string]any{
				"sub":                "ext-org-user-1",
				"preferred_username": "oidc-org-user",
			})
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	configRaw := fmt.Sprintf(
		`{"protocol":"oidc","authorization_url":"%s/oauth/authorize","token_url":"%s/oauth/token","userinfo_url":"%s/oauth/userinfo","client_id":"client-1","client_secret":"secret-1","scope":"openid profile email","claim_external_id":"sub","claim_username":"preferred_username","default_org_id":"%d","default_org_role":"viewer"}`,
		server.URL,
		server.URL,
		server.URL,
		org.ID,
	)
	if _, err := integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:       "Corp OIDC Org Join",
		Provider:   "corp-sso-org",
		ConfigJSON: configRaw,
		Enabled:    true,
		CreatedBy:  admin.ID,
	}); err != nil {
		t.Fatalf("failed to create sso provider connector: %v", err)
	}

	startReq := httptest.NewRequest(http.MethodGet, "/auth/sso/start/corp-sso-org", nil)
	startReq = withRouteParam(startReq, "provider", "corp-sso-org")
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
		"/auth/sso/callback/corp-sso-org?state="+url.QueryEscape(state)+"&code="+url.QueryEscape(tokenCode),
		nil,
	)
	callbackReq = withRouteParam(callbackReq, "provider", "corp-sso-org")
	for _, cookie := range cookies {
		callbackReq.AddCookie(cookie)
	}
	callbackRecorder := httptest.NewRecorder()

	app.handleSSOCallback(callbackRecorder, callbackReq)
	if callbackRecorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected callback status: got=%d want=%d", callbackRecorder.Code, http.StatusSeeOther)
	}

	createdUser, err := oauthSvc.FindUserByExternalID(context.Background(), ssoOAuthProvider("corp-sso-org"), "ext-org-user-1")
	if err != nil {
		t.Fatalf("failed to find mapped user by external id: %v", err)
	}
	loaded, err := authSvc.GetUserByID(context.Background(), createdUser.ID)
	if err != nil {
		t.Fatalf("failed to load mapped user: %v", err)
	}
	if !strings.HasPrefix(loaded.Username, "oidc-org-user") {
		t.Fatalf("unexpected mapped username: %s", loaded.Username)
	}

	memberships, err := app.organizationSvc.ListMembershipsByUser(context.Background(), createdUser.ID)
	if err != nil {
		t.Fatalf("failed to list user memberships: %v", err)
	}
	found := false
	for _, membership := range memberships {
		if membership.OrganizationID == org.ID {
			found = true
			if membership.Role != models.OrganizationRoleViewer {
				t.Fatalf("unexpected membership role: got=%s want=%s", membership.Role, models.OrganizationRoleViewer)
			}
		}
	}
	if !found {
		t.Fatalf("expected mapped user to be added into default organization")
	}
}

func TestHandleSSOCallbackSkipsDefaultOrganizationWhenEmailDomainNotMatched(t *testing.T) {
	app, _, integrationSvc, oauthSvc, admin := setupSSOHandlersTestApp(t)

	org, err := app.organizationSvc.CreateOrganization(context.Background(), "Domain Org", admin.ID)
	if err != nil {
		t.Fatalf("failed to create organization: %v", err)
	}

	tokenCode := "code-org-domain-mismatch"
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
				"access_token": "token-org-domain",
				"token_type":   "Bearer",
				"expires_in":   3600,
				"scope":        "openid profile email",
			})
		case "/oauth/userinfo":
			_ = json.NewEncoder(w).Encode(map[string]any{
				"sub":                "ext-org-domain-1",
				"preferred_username": "oidc-org-domain",
				"email":              "user@external.example.com",
			})
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	configRaw := fmt.Sprintf(
		`{"protocol":"oidc","authorization_url":"%s/oauth/authorize","token_url":"%s/oauth/token","userinfo_url":"%s/oauth/userinfo","client_id":"client-1","client_secret":"secret-1","scope":"openid profile email","claim_external_id":"sub","claim_username":"preferred_username","claim_email":"email","default_org_id":"%d","default_org_role":"viewer","default_org_email_domains":"corp.example.com"}`,
		server.URL,
		server.URL,
		server.URL,
		org.ID,
	)
	if _, err := integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:       "Corp OIDC Domain Guard",
		Provider:   "corp-sso-domain-guard",
		ConfigJSON: configRaw,
		Enabled:    true,
		CreatedBy:  admin.ID,
	}); err != nil {
		t.Fatalf("failed to create sso provider connector: %v", err)
	}

	startReq := httptest.NewRequest(http.MethodGet, "/auth/sso/start/corp-sso-domain-guard", nil)
	startReq = withRouteParam(startReq, "provider", "corp-sso-domain-guard")
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
		"/auth/sso/callback/corp-sso-domain-guard?state="+url.QueryEscape(state)+"&code="+url.QueryEscape(tokenCode),
		nil,
	)
	callbackReq = withRouteParam(callbackReq, "provider", "corp-sso-domain-guard")
	for _, cookie := range cookies {
		callbackReq.AddCookie(cookie)
	}
	callbackRecorder := httptest.NewRecorder()
	app.handleSSOCallback(callbackRecorder, callbackReq)
	if callbackRecorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected callback status: got=%d want=%d", callbackRecorder.Code, http.StatusSeeOther)
	}

	createdUser, err := oauthSvc.FindUserByExternalID(context.Background(), ssoOAuthProvider("corp-sso-domain-guard"), "ext-org-domain-1")
	if err != nil {
		t.Fatalf("failed to find mapped user by external id: %v", err)
	}
	memberships, err := app.organizationSvc.ListMembershipsByUser(context.Background(), createdUser.ID)
	if err != nil {
		t.Fatalf("failed to list user memberships: %v", err)
	}
	if len(memberships) != 0 {
		t.Fatalf("expected no default organization membership for unmatched domain, got=%d", len(memberships))
	}
}

func TestHandleSSOCallbackAutoJoinsOrganizationByGroupRule(t *testing.T) {
	app, _, integrationSvc, oauthSvc, admin := setupSSOHandlersTestApp(t)

	org, err := app.organizationSvc.CreateOrganization(context.Background(), "Engineering Org", admin.ID)
	if err != nil {
		t.Fatalf("failed to create organization: %v", err)
	}

	tokenCode := "code-org-group-rule"
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
				"access_token": "token-org-group",
				"token_type":   "Bearer",
				"expires_in":   3600,
				"scope":        "openid profile email",
			})
		case "/oauth/userinfo":
			_ = json.NewEncoder(w).Encode(map[string]any{
				"sub":                "ext-org-group-1",
				"preferred_username": "oidc-org-group",
				"groups":             []string{"engineering", "staff"},
			})
		default:
			http.NotFound(w, r)
		}
	}))
	defer server.Close()

	configRaw := fmt.Sprintf(
		`{"protocol":"oidc","authorization_url":"%s/oauth/authorize","token_url":"%s/oauth/token","userinfo_url":"%s/oauth/userinfo","client_id":"client-1","client_secret":"secret-1","scope":"openid profile email","claim_external_id":"sub","claim_username":"preferred_username","claim_groups":"groups","default_org_group_rules":"[{\"group\":\"engineering\",\"org_id\":%d,\"org_role\":\"viewer\"}]","default_org_email_domains":"corp.example.com"}`,
		server.URL,
		server.URL,
		server.URL,
		org.ID,
	)
	if _, err := integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:       "Corp OIDC Group Rule",
		Provider:   "corp-sso-group-rule",
		ConfigJSON: configRaw,
		Enabled:    true,
		CreatedBy:  admin.ID,
	}); err != nil {
		t.Fatalf("failed to create sso provider connector: %v", err)
	}

	startReq := httptest.NewRequest(http.MethodGet, "/auth/sso/start/corp-sso-group-rule", nil)
	startReq = withRouteParam(startReq, "provider", "corp-sso-group-rule")
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
		"/auth/sso/callback/corp-sso-group-rule?state="+url.QueryEscape(state)+"&code="+url.QueryEscape(tokenCode),
		nil,
	)
	callbackReq = withRouteParam(callbackReq, "provider", "corp-sso-group-rule")
	for _, cookie := range cookies {
		callbackReq.AddCookie(cookie)
	}
	callbackRecorder := httptest.NewRecorder()
	app.handleSSOCallback(callbackRecorder, callbackReq)
	if callbackRecorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected callback status: got=%d want=%d", callbackRecorder.Code, http.StatusSeeOther)
	}

	createdUser, err := oauthSvc.FindUserByExternalID(context.Background(), ssoOAuthProvider("corp-sso-group-rule"), "ext-org-group-1")
	if err != nil {
		t.Fatalf("failed to find mapped user by external id: %v", err)
	}
	memberships, err := app.organizationSvc.ListMembershipsByUser(context.Background(), createdUser.ID)
	if err != nil {
		t.Fatalf("failed to list user memberships: %v", err)
	}

	found := false
	for _, membership := range memberships {
		if membership.OrganizationID == org.ID {
			found = true
			if membership.Role != models.OrganizationRoleViewer {
				t.Fatalf("unexpected membership role: got=%s want=%s", membership.Role, models.OrganizationRoleViewer)
			}
		}
	}
	if !found {
		t.Fatalf("expected membership created by group rule")
	}
}
