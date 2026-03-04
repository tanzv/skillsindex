package web

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

type apiAdminSSOProviderItem struct {
	ID                     uint              `json:"id"`
	Name                   string            `json:"name"`
	Provider               string            `json:"provider"`
	Description            string            `json:"description"`
	BaseURL                string            `json:"base_url"`
	Enabled                bool              `json:"enabled"`
	OffboardingMode        string            `json:"offboarding_mode"`
	MappingMode            string            `json:"mapping_mode"`
	ClaimEmailVerified     string            `json:"claim_email_verified"`
	ClaimGroups            string            `json:"claim_groups"`
	DefaultOrgID           uint              `json:"default_org_id"`
	DefaultOrgRole         string            `json:"default_org_role"`
	DefaultOrgGroupRules   []ssoOrgGroupRule `json:"default_org_group_rules"`
	DefaultOrgEmailDomains []string          `json:"default_org_email_domains"`
	DefaultUserRole        string            `json:"default_user_role"`
	CreatedBy              uint              `json:"created_by"`
	CreatedAt              time.Time         `json:"created_at"`
	UpdatedAt              time.Time         `json:"updated_at"`
}

type apiAdminSSOProviderCreateInput struct {
	Name                   string
	Provider               string
	Description            string
	Issuer                 string
	AuthorizationURL       string
	TokenURL               string
	UserInfoURL            string
	ClientID               string
	ClientSecret           string
	Scope                  string
	ClaimExternalID        string
	ClaimUsername          string
	ClaimEmail             string
	ClaimEmailVerified     string
	ClaimGroups            string
	OffboardingMode        string
	MappingMode            string
	DefaultOrgID           uint
	DefaultOrgRole         string
	DefaultOrgGroupRules   string
	DefaultOrgEmailDomains string
	DefaultUserRole        string
}

type apiAdminSSOUsersSyncInput struct {
	Provider            string
	DisabledExternalIDs []string
	ForceSignOut        *bool
}

func resultToAPIAdminSSOProviderItem(item models.IntegrationConnector) apiAdminSSOProviderItem {
	cfg, err := parseSSOConnectorConfig(item)
	offboardingMode := ssoOffboardingDisableOnly
	mappingMode := ssoMappingExternalEmailUsername
	claimEmailVerified := "email_verified"
	claimGroups := "groups"
	defaultOrgID := uint(0)
	defaultOrgRole := string(models.OrganizationRoleMember)
	defaultOrgGroupRules := make([]ssoOrgGroupRule, 0)
	defaultOrgEmailDomains := make([]string, 0)
	defaultUserRole := string(models.RoleMember)
	if err == nil {
		offboardingMode = cfg.OffboardingMode
		mappingMode = cfg.MappingMode
		claimEmailVerified = cfg.ClaimEmailVerified
		claimGroups = cfg.ClaimGroups
		defaultOrgID = cfg.DefaultOrgID
		defaultOrgRole = string(cfg.DefaultOrgRole)
		defaultOrgGroupRules = cfg.DefaultOrgGroupRules
		defaultOrgEmailDomains = cfg.DefaultOrgDomains
		defaultUserRole = string(cfg.DefaultUserRole)
	}

	return apiAdminSSOProviderItem{
		ID:                     item.ID,
		Name:                   item.Name,
		Provider:               item.Provider,
		Description:            item.Description,
		BaseURL:                item.BaseURL,
		Enabled:                item.Enabled,
		OffboardingMode:        offboardingMode,
		MappingMode:            mappingMode,
		ClaimEmailVerified:     claimEmailVerified,
		ClaimGroups:            claimGroups,
		DefaultOrgID:           defaultOrgID,
		DefaultOrgRole:         defaultOrgRole,
		DefaultOrgGroupRules:   defaultOrgGroupRules,
		DefaultOrgEmailDomains: defaultOrgEmailDomains,
		DefaultUserRole:        defaultUserRole,
		CreatedBy:              item.CreatedBy,
		CreatedAt:              item.CreatedAt,
		UpdatedAt:              item.UpdatedAt,
	}
}

func (a *App) handleAPIAdminSSOProviderCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.integrationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	input, err := readAPIAdminSSOProviderCreateInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	provider := normalizeSSOProvider(input.Provider)
	if provider == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "provider_required"})
		return
	}

	if _, err := a.integrationSvc.GetConnectorByProvider(r.Context(), provider, true); err == nil {
		writeJSON(w, http.StatusConflict, map[string]any{"error": "provider_exists"})
		return
	} else if !errors.Is(err, services.ErrIntegrationConnectorNotFound) {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "provider_query_failed", "message": err.Error()})
		return
	}

	config := map[string]string{
		"protocol":                  "oidc",
		"issuer":                    strings.TrimSpace(input.Issuer),
		"authorization_url":         strings.TrimSpace(input.AuthorizationURL),
		"token_url":                 strings.TrimSpace(input.TokenURL),
		"userinfo_url":              strings.TrimSpace(input.UserInfoURL),
		"client_id":                 strings.TrimSpace(input.ClientID),
		"client_secret":             strings.TrimSpace(input.ClientSecret),
		"scope":                     defaultString(strings.TrimSpace(input.Scope), "openid profile email"),
		"claim_external_id":         defaultString(strings.TrimSpace(input.ClaimExternalID), "sub"),
		"claim_username":            defaultString(strings.TrimSpace(input.ClaimUsername), "preferred_username"),
		"claim_email":               defaultString(strings.TrimSpace(input.ClaimEmail), "email"),
		"claim_email_verified":      normalizeSSOClaimEmailVerified(input.ClaimEmailVerified),
		"claim_groups":              normalizeSSOClaimGroups(input.ClaimGroups),
		"offboarding_mode":          normalizeSSOOffboardingMode(input.OffboardingMode),
		"mapping_mode":              normalizeSSOMappingMode(input.MappingMode),
		"default_org_id":            strconv.FormatUint(uint64(input.DefaultOrgID), 10),
		"default_org_role":          string(normalizeSSODefaultOrganizationRole(input.DefaultOrgRole)),
		"default_org_group_rules":   serializeSSODefaultOrganizationGroupRulesJSON(input.DefaultOrgGroupRules),
		"default_org_email_domains": serializeSSODomains(normalizeSSODefaultOrganizationEmailDomains(input.DefaultOrgEmailDomains)),
		"default_user_role":         string(normalizeSSODefaultUserRole(input.DefaultUserRole)),
	}
	rawConfig, err := json.Marshal(config)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "config_serialize_failed", "message": err.Error()})
		return
	}

	name := strings.TrimSpace(input.Name)
	if name == "" {
		name = provider
	}
	created, err := a.integrationSvc.CreateConnector(r.Context(), services.CreateConnectorInput{
		Name:        name,
		Provider:    provider,
		Description: defaultString(strings.TrimSpace(input.Description), "Enterprise SSO provider"),
		BaseURL:     strings.TrimSpace(input.Issuer),
		ConfigJSON:  string(rawConfig),
		Enabled:     true,
		CreatedBy:   user.ID,
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "create_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_sso_provider_create",
		TargetType: "integration_connector",
		TargetID:   created.ID,
		Summary:    "Created enterprise SSO provider through admin api",
		Details: auditDetailsJSON(map[string]string{
			"provider": created.Provider,
			"name":     created.Name,
		}),
	})

	writeJSON(w, http.StatusCreated, map[string]any{
		"item": resultToAPIAdminSSOProviderItem(created),
	})
}

func (a *App) handleAPIAdminSSOProviderDisable(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.integrationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	providerID, err := parseUintURLParam(r, "providerID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_provider_id"})
		return
	}
	updated, err := a.integrationSvc.SetConnectorEnabled(r.Context(), providerID, false)
	if err != nil {
		if errors.Is(err, services.ErrIntegrationConnectorNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "provider_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "disable_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_sso_provider_disable",
		TargetType: "integration_connector",
		TargetID:   updated.ID,
		Summary:    "Disabled enterprise SSO provider through admin api",
		Details: auditDetailsJSON(map[string]string{
			"provider": updated.Provider,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"item": resultToAPIAdminSSOProviderItem(updated),
	})
}

func (a *App) handleAPIAdminSSOUsersSync(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.authService == nil || a.oauthGrantService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	input, err := readAPIAdminSSOUsersSyncInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	if input.Provider == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "provider_required"})
		return
	}
	if len(input.DisabledExternalIDs) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "disabled_external_ids_required"})
		return
	}
	forceSignOut, err := a.resolveSSOProviderDefaultForceSignOut(r.Context(), input.Provider)
	if err != nil {
		if errors.Is(err, services.ErrIntegrationConnectorNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "provider_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "policy_query_failed", "message": err.Error()})
		return
	}
	if input.ForceSignOut != nil {
		forceSignOut = *input.ForceSignOut
	}

	disabledCount := 0
	for _, externalID := range input.DisabledExternalIDs {
		targetUser, findErr := a.oauthGrantService.FindUserByExternalID(r.Context(), ssoOAuthProvider(input.Provider), externalID)
		if errors.Is(findErr, services.ErrOAuthGrantNotFound) {
			continue
		}
		if findErr != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "mapping_query_failed", "message": findErr.Error()})
			return
		}
		if statusErr := a.authService.SetUserStatus(r.Context(), targetUser.ID, models.UserStatusDisabled); statusErr != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "disable_user_failed", "message": statusErr.Error()})
			return
		}
		if forceSignOut {
			_ = a.authService.ForceSignOutUser(r.Context(), targetUser.ID)
		}
		disabledCount++
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_sso_users_sync",
		TargetType: "user",
		TargetID:   0,
		Summary:    "Synchronized disabled users from enterprise SSO through admin api",
		Details: auditDetailsJSON(map[string]string{
			"provider":       input.Provider,
			"disabled_count": strconv.Itoa(disabledCount),
			"force_sign_out": strconv.FormatBool(forceSignOut),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                   true,
		"provider":             input.Provider,
		"disabled_count":       disabledCount,
		"requested_identities": len(input.DisabledExternalIDs),
		"force_sign_out":       forceSignOut,
	})
}

func readAPIAdminSSOUsersSyncInput(r *http.Request) (apiAdminSSOUsersSyncInput, error) {
	input := apiAdminSSOUsersSyncInput{}
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		var payload struct {
			Provider            string          `json:"provider"`
			DisabledExternalIDs json.RawMessage `json:"disabled_external_ids"`
			ForceSignOut        *bool           `json:"force_sign_out"`
		}
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return input, fmt.Errorf("invalid json payload: %w", err)
		}
		externalIDs, err := decodeAPIAdminSSODisabledExternalIDs(payload.DisabledExternalIDs)
		if err != nil {
			return input, err
		}
		input.Provider = normalizeSSOProvider(payload.Provider)
		input.DisabledExternalIDs = externalIDs
		input.ForceSignOut = payload.ForceSignOut
		return input, nil
	}

	if err := r.ParseForm(); err != nil {
		return input, fmt.Errorf("invalid form payload: %w", err)
	}
	input.Provider = normalizeSSOProvider(r.FormValue("provider"))
	input.DisabledExternalIDs = parseSSOExternalIDList(r.FormValue("disabled_external_ids"))
	if raw := strings.TrimSpace(r.FormValue("force_sign_out")); raw != "" {
		parsed := parseBoolFlag(raw, false)
		input.ForceSignOut = &parsed
	}
	return input, nil
}

func decodeAPIAdminSSODisabledExternalIDs(raw json.RawMessage) ([]string, error) {
	clean := strings.TrimSpace(string(raw))
	if clean == "" || clean == "null" {
		return []string{}, nil
	}
	if strings.HasPrefix(clean, "[") {
		var values []string
		if err := json.Unmarshal(raw, &values); err != nil {
			return nil, fmt.Errorf("invalid disabled_external_ids")
		}
		return parseSSOExternalIDList(strings.Join(values, ",")), nil
	}
	var value string
	if err := json.Unmarshal(raw, &value); err != nil {
		return nil, fmt.Errorf("invalid disabled_external_ids")
	}
	return parseSSOExternalIDList(value), nil
}
