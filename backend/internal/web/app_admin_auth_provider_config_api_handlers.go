package web

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

type apiAdminAuthProviderConfigItem struct {
	Key            string    `json:"key"`
	DisplayName    string    `json:"display_name"`
	ManagementKind string    `json:"management_kind"`
	Configurable   bool      `json:"configurable"`
	Enabled        bool      `json:"enabled"`
	Connected      bool      `json:"connected"`
	Available      bool      `json:"available"`
	StartPath      string    `json:"start_path"`
	ConnectorID    uint      `json:"connector_id"`
	Description    string    `json:"description"`
	BaseURL        string    `json:"base_url"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type apiAdminAuthProviderConfigDetail struct {
	apiAdminAuthProviderConfigItem
	Name                   string `json:"name"`
	Provider               string `json:"provider"`
	Issuer                 string `json:"issuer"`
	AuthorizationURL       string `json:"authorization_url"`
	TokenURL               string `json:"token_url"`
	UserInfoURL            string `json:"userinfo_url"`
	ClientID               string `json:"client_id"`
	ClientSecret           string `json:"client_secret"`
	Scope                  string `json:"scope"`
	ClaimExternalID        string `json:"claim_external_id"`
	ClaimUsername          string `json:"claim_username"`
	ClaimEmail             string `json:"claim_email"`
	ClaimEmailVerified     string `json:"claim_email_verified"`
	ClaimGroups            string `json:"claim_groups"`
	OffboardingMode        string `json:"offboarding_mode"`
	MappingMode            string `json:"mapping_mode"`
	DefaultOrgID           uint   `json:"default_org_id"`
	DefaultOrgRole         string `json:"default_org_role"`
	DefaultOrgGroupRules   string `json:"default_org_group_rules"`
	DefaultOrgEmailDomains string `json:"default_org_email_domains"`
	DefaultUserRole        string `json:"default_user_role"`
}

func writeAPIAdminAuthProviderConfigServiceUnavailable(w http.ResponseWriter, r *http.Request, app *App) {
	switch {
	case app == nil:
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Auth provider services are unavailable")
	case app.settingsService == nil:
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Settings service is unavailable")
	case app.integrationSvc == nil:
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Integration service is unavailable")
	default:
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Auth provider services are unavailable")
	}
}

func (a *App) handleAPIAdminAuthProviderConfigs(w http.ResponseWriter, r *http.Request) {
	if _, ok := requireAdminUserManagementAPI(w, r); !ok {
		return
	}
	if a.settingsService == nil || a.integrationSvc == nil {
		writeAPIAdminAuthProviderConfigServiceUnavailable(w, r, a)
		return
	}

	items := make([]apiAdminAuthProviderConfigItem, 0, len(authProviderOrder))
	for _, key := range authProviderOrder {
		detail, err := a.buildAPIAdminAuthProviderConfigDetail(r.Context(), key)
		if err != nil {
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "provider_query_failed", err, "Failed to load auth provider configuration")
			return
		}
		items = append(items, detail.apiAdminAuthProviderConfigItem)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"items": items,
	})
}

func (a *App) handleAPIAdminAuthProviderConfigDetail(w http.ResponseWriter, r *http.Request) {
	if _, ok := requireAdminUserManagementAPI(w, r); !ok {
		return
	}
	if a.settingsService == nil || a.integrationSvc == nil {
		writeAPIAdminAuthProviderConfigServiceUnavailable(w, r, a)
		return
	}

	provider := normalizeManagedAuthProviderKey(chi.URLParam(r, "provider"))
	if provider == "" {
		writeAPIError(w, r, http.StatusNotFound, "provider_not_found", "Provider not found")
		return
	}

	item, err := a.buildAPIAdminAuthProviderConfigDetail(r.Context(), provider)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "provider_query_failed", err, "Failed to load auth provider configuration")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"ok":   true,
		"item": item,
	})
}

func (a *App) handleAPIAdminAuthProviderConfigUpsert(w http.ResponseWriter, r *http.Request) {
	user, ok := requireAdminUserManagementAPI(w, r)
	if !ok {
		return
	}
	if a.settingsService == nil || a.integrationSvc == nil {
		writeAPIAdminAuthProviderConfigServiceUnavailable(w, r, a)
		return
	}

	input, err := readAPIAdminSSOProviderCreateInput(r)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}
	provider := normalizeManagedAuthProviderKey(input.Provider)
	if provider == "" {
		writeAPIError(w, r, http.StatusBadRequest, "provider_required", "Provider is required")
		return
	}
	definition, _ := authProviderDefinitionFor(provider)

	input.Provider = provider
	if strings.TrimSpace(input.Name) == "" {
		input.Name = definition.DefaultDisplayName
	}
	if strings.TrimSpace(input.Description) == "" {
		input.Description = definition.DefaultDisplayName + " identity provider"
	}

	rawConfig, err := marshalSSOConnectorConfig(input)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "config_serialize_failed", err, "Failed to serialize auth provider configuration")
		return
	}
	if _, err := parseSSOConnectorConfig(models.IntegrationConnector{
		Provider:   provider,
		BaseURL:    strings.TrimSpace(input.Issuer),
		ConfigJSON: rawConfig,
		Enabled:    true,
	}); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_provider_config", err, "Invalid auth provider configuration")
		return
	}

	existing, err := a.integrationSvc.GetConnectorByProvider(r.Context(), provider, true)
	statusCode := http.StatusOK
	switch {
	case err == nil:
		enabled := true
		if _, err := a.integrationSvc.UpdateConnector(r.Context(), existing.ID, services.UpdateConnectorInput{
			Name:        input.Name,
			Description: input.Description,
			BaseURL:     strings.TrimSpace(input.Issuer),
			ConfigJSON:  rawConfig,
			Enabled:     &enabled,
		}); err != nil {
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "update_failed", err, "Failed to update auth provider configuration")
			return
		}
	case errors.Is(err, services.ErrIntegrationConnectorNotFound):
		if _, err := a.integrationSvc.CreateConnector(r.Context(), services.CreateConnectorInput{
			Name:        input.Name,
			Provider:    provider,
			Description: input.Description,
			BaseURL:     strings.TrimSpace(input.Issuer),
			ConfigJSON:  rawConfig,
			Enabled:     true,
			CreatedBy:   user.ID,
		}); err != nil {
			writeAPIErrorFromError(w, r, http.StatusBadRequest, "create_failed", err, "Failed to create auth provider configuration")
			return
		}
		statusCode = http.StatusCreated
	default:
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "provider_query_failed", err, "Failed to load auth provider configuration")
		return
	}

	if _, err := a.setEnabledAuthProvider(r.Context(), provider, true); err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "visibility_update_failed", err, "Failed to update auth provider visibility")
		return
	}

	item, err := a.buildAPIAdminAuthProviderConfigDetail(r.Context(), provider)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "provider_query_failed", err, "Failed to load auth provider configuration")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_auth_provider_config_upsert",
		TargetType: "integration_connector",
		TargetID:   item.ConnectorID,
		Summary:    "Upserted managed auth provider through admin api",
		Details: auditDetailsJSON(map[string]string{
			"provider": provider,
			"name":     item.Name,
		}),
	})

	writeJSON(w, statusCode, map[string]any{
		"ok":   true,
		"item": item,
	})
}

func (a *App) handleAPIAdminAuthProviderConfigDisable(w http.ResponseWriter, r *http.Request) {
	user, ok := requireAdminUserManagementAPI(w, r)
	if !ok {
		return
	}
	if a.settingsService == nil || a.integrationSvc == nil {
		writeAPIAdminAuthProviderConfigServiceUnavailable(w, r, a)
		return
	}

	provider := normalizeManagedAuthProviderKey(chi.URLParam(r, "provider"))
	if provider == "" {
		writeAPIError(w, r, http.StatusNotFound, "provider_not_found", "Provider not found")
		return
	}

	connector, err := a.integrationSvc.GetConnectorByProvider(r.Context(), provider, true)
	if err != nil {
		if errors.Is(err, services.ErrIntegrationConnectorNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "provider_not_found", "Provider not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "provider_query_failed", err, "Failed to load auth provider configuration")
		return
	}

	if _, err := a.integrationSvc.SetConnectorEnabled(r.Context(), connector.ID, false); err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "disable_failed", err, "Failed to disable auth provider")
		return
	}
	if _, err := a.setEnabledAuthProvider(r.Context(), provider, false); err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "visibility_update_failed", err, "Failed to update auth provider visibility")
		return
	}

	item, err := a.buildAPIAdminAuthProviderConfigDetail(r.Context(), provider)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "provider_query_failed", err, "Failed to load auth provider configuration")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_auth_provider_config_disable",
		TargetType: "integration_connector",
		TargetID:   connector.ID,
		Summary:    "Disabled managed auth provider through admin api",
		Details: auditDetailsJSON(map[string]string{
			"provider": provider,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":   true,
		"item": item,
	})
}

func (a *App) buildAPIAdminAuthProviderConfigDetail(ctx context.Context, key string) (apiAdminAuthProviderConfigDetail, error) {
	definition, ok := authProviderDefinitionFor(key)
	if !ok {
		return apiAdminAuthProviderConfigDetail{}, services.ErrIntegrationConnectorNotFound
	}

	enabledSet := a.loadEnabledAuthProviderSet(ctx)
	runtimeState := a.loadAuthProviderRuntimeState(ctx)
	item := apiAdminAuthProviderConfigDetail{
		apiAdminAuthProviderConfigItem: apiAdminAuthProviderConfigItem{
			Key:            definition.Key,
			DisplayName:    definition.DefaultDisplayName,
			ManagementKind: definition.ManagementKind,
			Configurable:   true,
			Enabled:        enabledSet[key],
		},
		Name:                 definition.DefaultDisplayName,
		Provider:             definition.Key,
		Scope:                "openid profile email",
		ClaimExternalID:      "sub",
		ClaimUsername:        "preferred_username",
		ClaimEmail:           "email",
		ClaimEmailVerified:   "email_verified",
		ClaimGroups:          "groups",
		OffboardingMode:      ssoOffboardingDisableOnly,
		MappingMode:          ssoMappingExternalEmailUsername,
		DefaultOrgRole:       string(models.OrganizationRoleMember),
		DefaultUserRole:      string(models.RoleMember),
		DefaultOrgGroupRules: "[]",
	}

	connector, err := a.integrationSvc.GetConnectorByProvider(ctx, key, true)
	if err != nil && !errors.Is(err, services.ErrIntegrationConnectorNotFound) {
		return apiAdminAuthProviderConfigDetail{}, err
	}
	if err == nil {
		item.ConnectorID = connector.ID
		item.Name = defaultString(strings.TrimSpace(connector.Name), definition.DefaultDisplayName)
		item.DisplayName = item.Name
		item.Description = strings.TrimSpace(connector.Description)
		item.BaseURL = strings.TrimSpace(connector.BaseURL)
		item.Connected = connector.Enabled
		item.UpdatedAt = connector.UpdatedAt
		if cfg, cfgErr := parseSSOConnectorConfig(connector); cfgErr == nil {
			item.Issuer = cfg.Issuer
			item.AuthorizationURL = cfg.AuthorizationURL
			item.TokenURL = cfg.TokenURL
			item.UserInfoURL = cfg.UserInfoURL
			item.ClientID = cfg.ClientID
			item.ClientSecret = cfg.ClientSecret
			item.Scope = cfg.Scope
			item.ClaimExternalID = cfg.ClaimExternalID
			item.ClaimUsername = cfg.ClaimUsername
			item.ClaimEmail = cfg.ClaimEmail
			item.ClaimEmailVerified = cfg.ClaimEmailVerified
			item.ClaimGroups = cfg.ClaimGroups
			item.OffboardingMode = cfg.OffboardingMode
			item.MappingMode = cfg.MappingMode
			item.DefaultOrgID = cfg.DefaultOrgID
			item.DefaultOrgRole = string(cfg.DefaultOrgRole)
			item.DefaultOrgGroupRules = serializeSSODefaultOrganizationGroupRulesJSON("")
			if len(cfg.DefaultOrgGroupRules) > 0 {
				rawGroupRules, marshalErr := marshalSSODefaultOrganizationGroupRules(cfg.DefaultOrgGroupRules)
				if marshalErr == nil {
					item.DefaultOrgGroupRules = rawGroupRules
				}
			}
			item.DefaultOrgEmailDomains = strings.Join(cfg.DefaultOrgDomains, ",")
			item.DefaultUserRole = string(cfg.DefaultUserRole)
		}
	}
	if state, ok := runtimeState[key]; ok {
		item.Available = state.Available
		item.StartPath = state.StartPath
	}
	return item, nil
}

func normalizeManagedAuthProviderKey(raw string) string {
	key := strings.ToLower(strings.TrimSpace(raw))
	if _, ok := authProviderDefinitionFor(key); !ok {
		return ""
	}
	return key
}

func marshalSSODefaultOrganizationGroupRules(rules []ssoOrgGroupRule) (string, error) {
	raw, err := json.Marshal(rules)
	if err != nil {
		return "", err
	}
	return string(raw), nil
}
