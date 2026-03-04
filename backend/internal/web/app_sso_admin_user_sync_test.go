package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestHandleAdminSSOUsersSyncDisablesMappedUsers(t *testing.T) {
	app, authSvc, integrationSvc, oauthSvc, admin := setupSSOHandlersTestApp(t)

	_, err := integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:        "Sync OIDC",
		Provider:    "corp-sso",
		Description: "provider for sync",
		BaseURL:     "https://idp.example.com",
		ConfigJSON:  `{"protocol":"oidc","authorization_url":"https://idp.example.com/oauth/authorize","token_url":"https://idp.example.com/oauth/token","client_id":"client-1","client_secret":"secret-1"}`,
		Enabled:     true,
		CreatedBy:   admin.ID,
	})
	if err != nil {
		t.Fatalf("failed to create provider: %v", err)
	}

	member, err := authSvc.Register(context.Background(), "sync-member", "Member123!")
	if err != nil {
		t.Fatalf("failed to create member: %v", err)
	}
	_, err = oauthSvc.UpsertGrant(context.Background(), services.UpsertOAuthGrantInput{
		UserID:         member.ID,
		Provider:       ssoOAuthProvider("corp-sso"),
		ExternalUserID: "employee-1001",
		AccessToken:    "token",
		Scope:          "openid",
		ExpiresAt:      time.Now().UTC().Add(1 * time.Hour),
	})
	if err != nil {
		t.Fatalf("failed to create oauth grant mapping: %v", err)
	}

	form := url.Values{}
	form.Set("provider", "corp-sso")
	form.Set("disabled_external_ids", "employee-1001")
	form.Set("force_sign_out", "true")
	req := httptest.NewRequest(http.MethodPost, "/admin/sso/users/sync", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &admin)
	recorder := httptest.NewRecorder()

	app.handleAdminSSOUsersSync(recorder, req)
	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected sync status: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if got := recorder.Header().Get("Location"); !strings.Contains(got, "msg=") {
		t.Fatalf("expected success message redirect, got=%s", got)
	}

	updated, err := authSvc.GetUserByID(context.Background(), member.ID)
	if err != nil {
		t.Fatalf("failed to load synced member: %v", err)
	}
	if updated.Status != models.UserStatusDisabled {
		t.Fatalf("expected member disabled after sync, got=%s", updated.Status)
	}
	if updated.ForceLogoutAt == nil {
		t.Fatalf("expected force logout timestamp after sync")
	}
}

func TestHandleAdminSSOUsersSyncProviderNotFound(t *testing.T) {
	app, _, _, _, admin := setupSSOHandlersTestApp(t)

	form := url.Values{}
	form.Set("provider", "missing-sso")
	form.Set("disabled_external_ids", "employee-404")
	req := httptest.NewRequest(http.MethodPost, "/admin/sso/users/sync", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &admin)
	recorder := httptest.NewRecorder()

	app.handleAdminSSOUsersSync(recorder, req)
	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected sync status: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "err=") {
		t.Fatalf("expected error redirect for missing provider, got=%s", location)
	}
}
