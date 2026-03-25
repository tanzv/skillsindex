package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPIAdminSSOProviderCreateSuccess(t *testing.T) {
	app, _, integrationSvc, _, admin := setupSSOHandlersTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sso/providers",
		strings.NewReader(`{"name":"Corp OIDC","provider":"corp-sso-api","issuer":"https://idp.example.com","authorization_url":"https://idp.example.com/oauth/authorize","token_url":"https://idp.example.com/oauth/token","userinfo_url":"https://idp.example.com/oauth/userinfo","client_id":"client-1","client_secret":"secret-1","scope":"openid profile email"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSSOProviderCreate(recorder, req)
	if recorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusCreated)
	}
	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	if got, _ := item["provider"].(string); got != "corp-sso-api" {
		t.Fatalf("unexpected provider: %#v", item["provider"])
	}

	created, err := integrationSvc.GetConnectorByProvider(context.Background(), "corp-sso-api", true)
	if err != nil {
		t.Fatalf("failed to load created provider: %v", err)
	}
	if !created.Enabled {
		t.Fatalf("created provider should be enabled")
	}
}

func TestAPIAdminSSOProviderCreateWithDefaultOrganizationConfig(t *testing.T) {
	app, _, integrationSvc, _, admin := setupSSOHandlersTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sso/providers",
		strings.NewReader(`{"name":"Corp OIDC","provider":"corp-sso-default-org","issuer":"https://idp.example.com","authorization_url":"https://idp.example.com/oauth/authorize","token_url":"https://idp.example.com/oauth/token","client_id":"client-1","client_secret":"secret-1","claim_email_verified":"verified_flag","default_org_id":19,"default_org_role":"viewer","default_org_group_rules":"[{\"group\":\"engineering\",\"org_id\":19,\"org_role\":\"viewer\"}]","default_org_email_domains":"corp.example.com,example.org","default_user_role":"viewer"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSSOProviderCreate(recorder, req)
	if recorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusCreated)
	}

	created, err := integrationSvc.GetConnectorByProvider(context.Background(), "corp-sso-default-org", true)
	if err != nil {
		t.Fatalf("failed to load created provider: %v", err)
	}
	cfg, err := parseSSOConnectorConfig(created)
	if err != nil {
		t.Fatalf("failed to parse created provider config: %v", err)
	}
	if cfg.DefaultOrgID != 19 {
		t.Fatalf("unexpected default org id: got=%d want=%d", cfg.DefaultOrgID, 19)
	}
	if cfg.DefaultOrgRole != models.OrganizationRoleViewer {
		t.Fatalf("unexpected default org role: got=%s want=%s", cfg.DefaultOrgRole, models.OrganizationRoleViewer)
	}
	if len(cfg.DefaultOrgDomains) != 2 || cfg.DefaultOrgDomains[0] != "corp.example.com" || cfg.DefaultOrgDomains[1] != "example.org" {
		t.Fatalf("unexpected default org email domains: %#v", cfg.DefaultOrgDomains)
	}
	if len(cfg.DefaultOrgGroupRules) != 1 || cfg.DefaultOrgGroupRules[0].Group != "engineering" {
		t.Fatalf("unexpected default org group rules: %#v", cfg.DefaultOrgGroupRules)
	}
	if cfg.DefaultUserRole != models.RoleViewer {
		t.Fatalf("unexpected default user role: got=%s want=%s", cfg.DefaultUserRole, models.RoleViewer)
	}
	if cfg.ClaimEmailVerified != "verified_flag" {
		t.Fatalf("unexpected claim_email_verified: got=%s want=%s", cfg.ClaimEmailVerified, "verified_flag")
	}
}

func TestAPIAdminSSOProvidersListSuccess(t *testing.T) {
	app, _, integrationSvc, _, admin := setupSSOHandlersTestApp(t)

	_, err := integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:        "List OIDC",
		Provider:    "corp-sso-list",
		Description: "oidc provider",
		BaseURL:     "https://idp.example.com",
		ConfigJSON:  `{"protocol":"oidc","authorization_url":"https://idp.example.com/oauth/authorize","token_url":"https://idp.example.com/oauth/token","client_id":"client-1","client_secret":"secret-1","claim_email_verified":"verified_flag","claim_groups":"groups","mapping_mode":"external_only","default_org_id":"42","default_org_role":"viewer","default_org_group_rules":"[{\"group\":\"engineering\",\"org_id\":42,\"org_role\":\"viewer\"}]","default_org_email_domains":"corp.example.com","default_user_role":"viewer"}`,
		Enabled:     true,
		CreatedBy:   admin.ID,
	})
	if err != nil {
		t.Fatalf("failed to create oidc provider: %v", err)
	}
	_, err = integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:        "Generic Webhook",
		Provider:    "generic-webhook",
		Description: "non sso connector",
		BaseURL:     "https://hook.example.com",
		ConfigJSON:  `{"endpoint":"https://hook.example.com/push","secret":"token"}`,
		Enabled:     true,
		CreatedBy:   admin.ID,
	})
	if err != nil {
		t.Fatalf("failed to create generic connector: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sso/providers?include_disabled=true&limit=20", nil)
	req = withCurrentUser(req, &admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSSOProviders(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	payload := decodeBodyMap(t, recorder)
	if got, ok := payload["total"].(float64); !ok || int(got) != 1 {
		t.Fatalf("unexpected total: %#v", payload["total"])
	}
	items, ok := payload["items"].([]any)
	if !ok || len(items) != 1 {
		t.Fatalf("unexpected items payload: %#v", payload["items"])
	}
	item, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected item type: %#v", items[0])
	}
	if got, _ := item["provider"].(string); got != "corp-sso-list" {
		t.Fatalf("unexpected provider: %#v", item["provider"])
	}
	if got, _ := item["mapping_mode"].(string); got != ssoMappingExternalOnly {
		t.Fatalf("unexpected mapping_mode: %#v", item["mapping_mode"])
	}
	if got, _ := item["offboarding_mode"].(string); got != ssoOffboardingDisableOnly {
		t.Fatalf("unexpected offboarding_mode: %#v", item["offboarding_mode"])
	}
	if got, ok := item["default_org_id"].(float64); !ok || int(got) != 42 {
		t.Fatalf("unexpected default_org_id: %#v", item["default_org_id"])
	}
	if got, _ := item["default_org_role"].(string); got != string(models.OrganizationRoleViewer) {
		t.Fatalf("unexpected default_org_role: %#v", item["default_org_role"])
	}
	if got, _ := item["claim_groups"].(string); got != "groups" {
		t.Fatalf("unexpected claim_groups: %#v", item["claim_groups"])
	}
	if got, _ := item["claim_email_verified"].(string); got != "verified_flag" {
		t.Fatalf("unexpected claim_email_verified: %#v", item["claim_email_verified"])
	}
	groupRules, ok := item["default_org_group_rules"].([]any)
	if !ok || len(groupRules) != 1 {
		t.Fatalf("unexpected default_org_group_rules: %#v", item["default_org_group_rules"])
	}
	rule, ok := groupRules[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected rule payload: %#v", groupRules[0])
	}
	if got, _ := rule["group"].(string); got != "engineering" {
		t.Fatalf("unexpected group rule group: %#v", rule["group"])
	}
	domains, ok := item["default_org_email_domains"].([]any)
	if !ok || len(domains) != 1 {
		t.Fatalf("unexpected default_org_email_domains: %#v", item["default_org_email_domains"])
	}
	if got, _ := domains[0].(string); got != "corp.example.com" {
		t.Fatalf("unexpected default org email domain: %#v", domains[0])
	}
	if got, _ := item["default_user_role"].(string); got != string(models.RoleViewer) {
		t.Fatalf("unexpected default_user_role: %#v", item["default_user_role"])
	}
}

func TestAPIAdminSSOProvidersListUnauthorized(t *testing.T) {
	app, _, _, _, _ := setupSSOHandlersTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sso/providers", nil)
	req.Header.Set("X-Request-ID", "req-sso-providers-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSSOProviders(recorder, req)

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
	if payload["request_id"] != "req-sso-providers-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminSSOProvidersListInvalidProvider(t *testing.T) {
	app, _, _, _, admin := setupSSOHandlersTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sso/providers?provider=%21%21%21", nil)
	req.Header.Set("X-Request-ID", "req-sso-providers-invalid-provider")
	req = withCurrentUser(req, &admin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSSOProviders(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_provider" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Invalid provider" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-sso-providers-invalid-provider" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminSSOProviderDisableSuccess(t *testing.T) {
	app, _, integrationSvc, _, admin := setupSSOHandlersTestApp(t)

	created, err := integrationSvc.CreateConnector(context.Background(), services.CreateConnectorInput{
		Name:        "Disable OIDC",
		Provider:    "corp-sso-disable-api",
		Description: "provider to disable",
		BaseURL:     "https://idp.example.com",
		ConfigJSON:  `{"protocol":"oidc","authorization_url":"https://idp.example.com/oauth/authorize","token_url":"https://idp.example.com/oauth/token","client_id":"client-1","client_secret":"secret-1"}`,
		Enabled:     true,
		CreatedBy:   admin.ID,
	})
	if err != nil {
		t.Fatalf("failed to create provider: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/v1/admin/sso/providers/%d/disable", created.ID), nil)
	req = withCurrentUser(req, &admin)
	req = withRouteParam(req, "providerID", fmt.Sprintf("%d", created.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSSOProviderDisable(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	if enabled, ok := item["enabled"].(bool); !ok || enabled {
		t.Fatalf("expected disabled provider in response: %#v", item["enabled"])
	}

	updated, err := integrationSvc.GetConnectorByID(context.Background(), created.ID)
	if err != nil {
		t.Fatalf("failed to load disabled provider: %v", err)
	}
	if updated.Enabled {
		t.Fatalf("provider should be disabled")
	}
}

func TestAPIAdminSSOProviderDisableInvalidProviderID(t *testing.T) {
	app, _, _, _, admin := setupSSOHandlersTestApp(t)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/sso/providers/invalid/disable", nil)
	req.Header.Set("X-Request-ID", "req-admin-sso-provider-disable-invalid-id")
	req = withCurrentUser(req, &admin)
	req = withRouteParam(req, "providerID", "invalid")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSSOProviderDisable(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_provider_id" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-admin-sso-provider-disable-invalid-id" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminSSOProviderCreatePermissionDenied(t *testing.T) {
	app, authSvc, _, _, _ := setupSSOHandlersTestApp(t)
	member, err := authSvc.Register(context.Background(), "api-sso-member", "Member123!")
	if err != nil {
		t.Fatalf("failed to create member: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sso/providers",
		strings.NewReader(`{"provider":"corp-sso"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &member)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSSOProviderCreate(recorder, req)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
}
