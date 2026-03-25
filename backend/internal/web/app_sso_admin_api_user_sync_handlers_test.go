package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/services"
)

func TestAPIAdminSSOUsersSyncSuccess(t *testing.T) {
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

	member, err := authSvc.Register(context.Background(), "api-sync-member", "Member123!")
	if err != nil {
		t.Fatalf("failed to create member: %v", err)
	}
	_, err = oauthSvc.UpsertGrant(context.Background(), services.UpsertOAuthGrantInput{
		UserID:         member.ID,
		Provider:       ssoOAuthProvider("corp-sso"),
		ExternalUserID: "employee-2001",
		AccessToken:    "token",
		Scope:          "openid",
		ExpiresAt:      time.Now().UTC().Add(1 * time.Hour),
	})
	if err != nil {
		t.Fatalf("failed to create oauth mapping: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sso/users/sync",
		strings.NewReader(`{"provider":"corp-sso","disabled_external_ids":["employee-2001"],"force_sign_out":true}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSSOUsersSync(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if got, ok := payload["disabled_count"].(float64); !ok || int(got) != 1 {
		t.Fatalf("unexpected disabled_count: %#v", payload["disabled_count"])
	}

	updated, err := authSvc.GetUserByID(context.Background(), member.ID)
	if err != nil {
		t.Fatalf("failed to load member: %v", err)
	}
	if !strings.EqualFold(string(updated.Status), "disabled") {
		t.Fatalf("expected member to be disabled, got=%s", updated.Status)
	}
	if updated.ForceLogoutAt == nil {
		t.Fatalf("expected force logout timestamp after sync")
	}
}

func TestAPIAdminSSOUsersSyncUsesProviderOffboardingPolicy(t *testing.T) {
	app, authSvc, integrationSvc, oauthSvc, admin := setupSSOHandlersTestApp(t)

	_, err := integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:        "Policy OIDC",
		Provider:    "corp-sso-policy",
		Description: "policy provider",
		BaseURL:     "https://idp.example.com",
		ConfigJSON:  `{"protocol":"oidc","authorization_url":"https://idp.example.com/oauth/authorize","token_url":"https://idp.example.com/oauth/token","client_id":"client-1","client_secret":"secret-1","offboarding_mode":"disable_and_sign_out"}`,
		Enabled:     true,
		CreatedBy:   admin.ID,
	})
	if err != nil {
		t.Fatalf("failed to create provider: %v", err)
	}

	member, err := authSvc.Register(context.Background(), "api-policy-member", "Member123!")
	if err != nil {
		t.Fatalf("failed to create member: %v", err)
	}
	_, err = oauthSvc.UpsertGrant(context.Background(), services.UpsertOAuthGrantInput{
		UserID:         member.ID,
		Provider:       ssoOAuthProvider("corp-sso-policy"),
		ExternalUserID: "employee-3001",
		AccessToken:    "token",
		Scope:          "openid",
		ExpiresAt:      time.Now().UTC().Add(1 * time.Hour),
	})
	if err != nil {
		t.Fatalf("failed to create oauth mapping: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sso/users/sync",
		strings.NewReader(`{"provider":"corp-sso-policy","disabled_external_ids":["employee-3001"]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSSOUsersSync(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if force, ok := payload["force_sign_out"].(bool); !ok || !force {
		t.Fatalf("expected force_sign_out=true by provider policy, got=%#v", payload["force_sign_out"])
	}

	updated, err := authSvc.GetUserByID(context.Background(), member.ID)
	if err != nil {
		t.Fatalf("failed to load member: %v", err)
	}
	if updated.ForceLogoutAt == nil {
		t.Fatalf("expected force logout timestamp by provider policy")
	}
}

func TestAPIAdminSSOUsersSyncProviderNotFound(t *testing.T) {
	app, _, _, _, admin := setupSSOHandlersTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sso/users/sync",
		strings.NewReader(`{"provider":"missing-sso","disabled_external_ids":["employee-404"]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSSOUsersSync(recorder, req)
	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
	payload := decodeBodyMap(t, recorder)
	if got, _ := payload["error"].(string); got != "provider_not_found" {
		t.Fatalf("unexpected error code: %#v", payload["error"])
	}
}

func TestAPIAdminSSOUsersSyncProviderRequired(t *testing.T) {
	app, _, _, _, admin := setupSSOHandlersTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sso/users/sync",
		strings.NewReader(`{"provider":" ","disabled_external_ids":["employee-1"]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-admin-sso-users-sync-provider-required")
	req = withCurrentUser(req, &admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSSOUsersSync(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "provider_required" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Provider is required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-sso-users-sync-provider-required" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
