package web

import (
	"context"
	"encoding/json"
	"errors"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

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
