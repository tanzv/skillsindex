package web

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAdminSSOProviderCreate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanManageUsers() {
		redirectAdminPath(w, r, "/admin/integrations", "", "Permission denied")
		return
	}
	if a.integrationSvc == nil {
		redirectAdminPath(w, r, "/admin/integrations", "", "Integration service unavailable")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminPath(w, r, "/admin/integrations", "", "Invalid form payload")
		return
	}

	provider := normalizeSSOProvider(r.FormValue("provider"))
	if provider == "" {
		redirectAdminPath(w, r, "/admin/integrations", "", "SSO provider key is required")
		return
	}
	if _, err := a.integrationSvc.GetConnectorByProvider(r.Context(), provider, true); err == nil {
		redirectAdminPath(w, r, "/admin/integrations", "", "SSO provider already exists")
		return
	} else if !errors.Is(err, services.ErrIntegrationConnectorNotFound) {
		redirectAdminPath(w, r, "/admin/integrations", "", "Failed to query existing SSO provider")
		return
	}

	config := map[string]string{
		"protocol":                  "oidc",
		"issuer":                    strings.TrimSpace(r.FormValue("issuer")),
		"authorization_url":         strings.TrimSpace(r.FormValue("authorization_url")),
		"token_url":                 strings.TrimSpace(r.FormValue("token_url")),
		"userinfo_url":              strings.TrimSpace(r.FormValue("userinfo_url")),
		"client_id":                 strings.TrimSpace(r.FormValue("client_id")),
		"client_secret":             strings.TrimSpace(r.FormValue("client_secret")),
		"scope":                     defaultString(strings.TrimSpace(r.FormValue("scope")), "openid profile email"),
		"claim_external_id":         defaultString(strings.TrimSpace(r.FormValue("claim_external_id")), "sub"),
		"claim_username":            defaultString(strings.TrimSpace(r.FormValue("claim_username")), "preferred_username"),
		"claim_email":               defaultString(strings.TrimSpace(r.FormValue("claim_email")), "email"),
		"claim_email_verified":      normalizeSSOClaimEmailVerified(r.FormValue("claim_email_verified")),
		"claim_groups":              defaultString(strings.TrimSpace(r.FormValue("claim_groups")), "groups"),
		"offboarding_mode":          normalizeSSOOffboardingMode(r.FormValue("offboarding_mode")),
		"mapping_mode":              normalizeSSOMappingMode(r.FormValue("mapping_mode")),
		"default_org_id":            strconv.FormatUint(uint64(normalizeSSODefaultOrganizationID(r.FormValue("default_org_id"))), 10),
		"default_org_role":          string(normalizeSSODefaultOrganizationRole(r.FormValue("default_org_role"))),
		"default_org_group_rules":   serializeSSODefaultOrganizationGroupRulesJSON(r.FormValue("default_org_group_rules")),
		"default_org_email_domains": serializeSSODomains(normalizeSSODefaultOrganizationEmailDomains(r.FormValue("default_org_email_domains"))),
		"default_user_role":         string(normalizeSSODefaultUserRole(r.FormValue("default_user_role"))),
	}
	rawConfig, err := json.Marshal(config)
	if err != nil {
		redirectAdminPath(w, r, "/admin/integrations", "", "Failed to serialize SSO provider configuration")
		return
	}

	name := strings.TrimSpace(r.FormValue("name"))
	if name == "" {
		name = provider
	}
	created, err := a.integrationSvc.CreateConnector(r.Context(), services.CreateConnectorInput{
		Name:        name,
		Provider:    provider,
		Description: defaultString(strings.TrimSpace(r.FormValue("description")), "Enterprise SSO provider"),
		BaseURL:     strings.TrimSpace(r.FormValue("issuer")),
		ConfigJSON:  string(rawConfig),
		Enabled:     true,
		CreatedBy:   currentUser.ID,
	})
	if err != nil {
		redirectAdminPath(w, r, "/admin/integrations", "", "Failed to create SSO provider")
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "sso_provider_create",
		TargetType: "integration_connector",
		TargetID:   created.ID,
		Summary:    "Created enterprise SSO provider",
		Details: auditDetailsJSON(map[string]string{
			"provider": created.Provider,
			"name":     created.Name,
		}),
	})
	redirectAdminPath(w, r, "/admin/integrations/list", "SSO provider created", "")
}

func (a *App) handleAdminSSOProviderDisable(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanManageUsers() {
		redirectAdminPath(w, r, "/admin/integrations", "", "Permission denied")
		return
	}
	if a.integrationSvc == nil {
		redirectAdminPath(w, r, "/admin/integrations", "", "Integration service unavailable")
		return
	}

	providerID, err := parseUintURLParam(r, "providerID")
	if err != nil {
		redirectAdminPath(w, r, "/admin/integrations", "", "Invalid provider id")
		return
	}
	updated, err := a.integrationSvc.SetConnectorEnabled(r.Context(), providerID, false)
	if err != nil {
		if errors.Is(err, services.ErrIntegrationConnectorNotFound) {
			redirectAdminPath(w, r, "/admin/integrations", "", "SSO provider not found")
			return
		}
		redirectAdminPath(w, r, "/admin/integrations", "", "Failed to disable SSO provider")
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "sso_provider_disable",
		TargetType: "integration_connector",
		TargetID:   updated.ID,
		Summary:    "Disabled enterprise SSO provider",
		Details: auditDetailsJSON(map[string]string{
			"provider": updated.Provider,
		}),
	})
	redirectAdminPath(w, r, "/admin/integrations/list", "SSO provider disabled", "")
}

func (a *App) handleAdminSSOUsersSync(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanManageUsers() {
		redirectAdminPath(w, r, "/admin/access", "", "Permission denied")
		return
	}
	if a.authService == nil || a.oauthGrantService == nil {
		redirectAdminPath(w, r, "/admin/access", "", "SSO sync services unavailable")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminPath(w, r, "/admin/access", "", "Invalid form payload")
		return
	}

	provider := normalizeSSOProvider(r.FormValue("provider"))
	if provider == "" {
		redirectAdminPath(w, r, "/admin/access", "", "SSO provider is required")
		return
	}
	externalIDs := parseSSOExternalIDList(r.FormValue("disabled_external_ids"))
	if len(externalIDs) == 0 {
		redirectAdminPath(w, r, "/admin/access", "", "No external identities were provided")
		return
	}
	forceSignOut, err := a.resolveSSOProviderDefaultForceSignOut(r.Context(), provider)
	if err != nil {
		if errors.Is(err, services.ErrIntegrationConnectorNotFound) {
			redirectAdminPath(w, r, "/admin/access", "", "SSO provider not found")
			return
		}
		redirectAdminPath(w, r, "/admin/access", "", "Failed to load SSO offboarding policy")
		return
	}
	rawForceSignOut := strings.TrimSpace(r.FormValue("force_sign_out"))
	if rawForceSignOut != "" {
		forceSignOut = parseBoolFlag(rawForceSignOut, forceSignOut)
	}

	disabledCount := 0
	for _, externalID := range externalIDs {
		targetUser, err := a.oauthGrantService.FindUserByExternalID(r.Context(), ssoOAuthProvider(provider), externalID)
		if errors.Is(err, services.ErrOAuthGrantNotFound) {
			continue
		}
		if err != nil {
			redirectAdminPath(w, r, "/admin/access", "", "Failed to resolve SSO identity mapping")
			return
		}
		if err := a.authService.SetUserStatus(r.Context(), targetUser.ID, models.UserStatusDisabled); err != nil {
			redirectAdminPath(w, r, "/admin/access", "", "Failed to disable mapped user")
			return
		}
		if forceSignOut {
			_ = a.authService.ForceSignOutUser(r.Context(), targetUser.ID)
		}
		disabledCount++
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "sso_users_sync",
		TargetType: "user",
		TargetID:   0,
		Summary:    "Synchronized disabled users from enterprise SSO",
		Details: auditDetailsJSON(map[string]string{
			"provider":       provider,
			"disabled_count": strconv.Itoa(disabledCount),
			"force_sign_out": strconv.FormatBool(forceSignOut),
		}),
	})
	redirectAdminPath(w, r, "/admin/access", fmt.Sprintf("SSO user sync finished: disabled=%d", disabledCount), "")
}
