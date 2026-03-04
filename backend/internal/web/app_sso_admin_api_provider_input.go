package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

func readAPIAdminSSOProviderCreateInput(r *http.Request) (apiAdminSSOProviderCreateInput, error) {
	input := apiAdminSSOProviderCreateInput{}
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	if strings.Contains(contentType, "application/json") {
		var payload struct {
			Name                   string `json:"name"`
			Provider               string `json:"provider"`
			Description            string `json:"description"`
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
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			return input, fmt.Errorf("invalid json payload: %w", err)
		}
		input = apiAdminSSOProviderCreateInput{
			Name:                   strings.TrimSpace(payload.Name),
			Provider:               strings.TrimSpace(payload.Provider),
			Description:            strings.TrimSpace(payload.Description),
			Issuer:                 strings.TrimSpace(payload.Issuer),
			AuthorizationURL:       strings.TrimSpace(payload.AuthorizationURL),
			TokenURL:               strings.TrimSpace(payload.TokenURL),
			UserInfoURL:            strings.TrimSpace(payload.UserInfoURL),
			ClientID:               strings.TrimSpace(payload.ClientID),
			ClientSecret:           strings.TrimSpace(payload.ClientSecret),
			Scope:                  strings.TrimSpace(payload.Scope),
			ClaimExternalID:        strings.TrimSpace(payload.ClaimExternalID),
			ClaimUsername:          strings.TrimSpace(payload.ClaimUsername),
			ClaimEmail:             strings.TrimSpace(payload.ClaimEmail),
			ClaimEmailVerified:     strings.TrimSpace(payload.ClaimEmailVerified),
			ClaimGroups:            strings.TrimSpace(payload.ClaimGroups),
			OffboardingMode:        strings.TrimSpace(payload.OffboardingMode),
			MappingMode:            strings.TrimSpace(payload.MappingMode),
			DefaultOrgID:           payload.DefaultOrgID,
			DefaultOrgRole:         strings.TrimSpace(payload.DefaultOrgRole),
			DefaultOrgGroupRules:   strings.TrimSpace(payload.DefaultOrgGroupRules),
			DefaultOrgEmailDomains: strings.TrimSpace(payload.DefaultOrgEmailDomains),
			DefaultUserRole:        strings.TrimSpace(payload.DefaultUserRole),
		}
		return input, nil
	}

	if err := r.ParseForm(); err != nil {
		return input, fmt.Errorf("invalid form payload: %w", err)
	}
	input = apiAdminSSOProviderCreateInput{
		Name:                   strings.TrimSpace(r.FormValue("name")),
		Provider:               strings.TrimSpace(r.FormValue("provider")),
		Description:            strings.TrimSpace(r.FormValue("description")),
		Issuer:                 strings.TrimSpace(r.FormValue("issuer")),
		AuthorizationURL:       strings.TrimSpace(r.FormValue("authorization_url")),
		TokenURL:               strings.TrimSpace(r.FormValue("token_url")),
		UserInfoURL:            strings.TrimSpace(r.FormValue("userinfo_url")),
		ClientID:               strings.TrimSpace(r.FormValue("client_id")),
		ClientSecret:           strings.TrimSpace(r.FormValue("client_secret")),
		Scope:                  strings.TrimSpace(r.FormValue("scope")),
		ClaimExternalID:        strings.TrimSpace(r.FormValue("claim_external_id")),
		ClaimUsername:          strings.TrimSpace(r.FormValue("claim_username")),
		ClaimEmail:             strings.TrimSpace(r.FormValue("claim_email")),
		ClaimEmailVerified:     strings.TrimSpace(r.FormValue("claim_email_verified")),
		ClaimGroups:            strings.TrimSpace(r.FormValue("claim_groups")),
		OffboardingMode:        strings.TrimSpace(r.FormValue("offboarding_mode")),
		MappingMode:            strings.TrimSpace(r.FormValue("mapping_mode")),
		DefaultOrgID:           normalizeSSODefaultOrganizationID(r.FormValue("default_org_id")),
		DefaultOrgRole:         strings.TrimSpace(r.FormValue("default_org_role")),
		DefaultOrgGroupRules:   strings.TrimSpace(r.FormValue("default_org_group_rules")),
		DefaultOrgEmailDomains: strings.TrimSpace(r.FormValue("default_org_email_domains")),
		DefaultUserRole:        strings.TrimSpace(r.FormValue("default_user_role")),
	}
	return input, nil
}
