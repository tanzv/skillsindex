package web

import "time"

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
