package web

import (
	"time"

	"skillsindex/internal/models"
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
