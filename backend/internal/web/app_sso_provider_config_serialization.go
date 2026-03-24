package web

import (
	"encoding/json"
	"strconv"
	"strings"
)

func buildSSOConnectorConfigMap(input apiAdminSSOProviderCreateInput) map[string]string {
	return map[string]string{
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
}

func marshalSSOConnectorConfig(input apiAdminSSOProviderCreateInput) (string, error) {
	rawConfig, err := json.Marshal(buildSSOConnectorConfigMap(input))
	if err != nil {
		return "", err
	}
	return string(rawConfig), nil
}
