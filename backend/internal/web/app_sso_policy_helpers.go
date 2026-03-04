package web

import (
	"context"
	"encoding/json"
	"errors"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

const (
	ssoOffboardingDisableOnly       = "disable_only"
	ssoOffboardingDisableAndSignOut = "disable_and_sign_out"
)

const (
	ssoMappingExternalOnly          = "external_only"
	ssoMappingExternalEmail         = "external_email"
	ssoMappingExternalEmailUsername = "external_email_username"
)

type ssoOrgGroupRule struct {
	Group   string                  `json:"group"`
	OrgID   uint                    `json:"org_id"`
	OrgRole models.OrganizationRole `json:"org_role"`
}

func normalizeSSOOffboardingMode(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case ssoOffboardingDisableAndSignOut:
		return ssoOffboardingDisableAndSignOut
	default:
		return ssoOffboardingDisableOnly
	}
}

func normalizeSSOMappingMode(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case ssoMappingExternalOnly:
		return ssoMappingExternalOnly
	case ssoMappingExternalEmail:
		return ssoMappingExternalEmail
	default:
		return ssoMappingExternalEmailUsername
	}
}

func normalizeSSODefaultOrganizationID(raw string) uint {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return 0
	}
	parsed, err := strconv.ParseUint(trimmed, 10, 64)
	if err != nil || parsed == 0 {
		return 0
	}
	return uint(parsed)
}

func normalizeSSODefaultOrganizationRole(raw string) models.OrganizationRole {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.OrganizationRoleViewer):
		return models.OrganizationRoleViewer
	default:
		return models.OrganizationRoleMember
	}
}

func normalizeSSODefaultUserRole(raw string) models.UserRole {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.RoleViewer):
		return models.RoleViewer
	default:
		return models.RoleMember
	}
}

func normalizeSSOClaimGroups(raw string) string {
	claim := strings.TrimSpace(raw)
	if claim == "" {
		return "groups"
	}
	return claim
}

func normalizeSSOClaimEmailVerified(raw string) string {
	claim := strings.TrimSpace(raw)
	if claim == "" {
		return "email_verified"
	}
	return claim
}

func normalizeSSODefaultOrganizationEmailDomains(raw string) []string {
	parts := parseSSOExternalIDList(raw)
	domains := make([]string, 0, len(parts))
	seen := make(map[string]struct{}, len(parts))
	for _, part := range parts {
		domain := strings.ToLower(strings.TrimSpace(part))
		domain = strings.TrimPrefix(domain, "@")
		if domain == "" {
			continue
		}
		if _, exists := seen[domain]; exists {
			continue
		}
		seen[domain] = struct{}{}
		domains = append(domains, domain)
	}
	return domains
}

func normalizeSSODefaultOrganizationGroupRules(raw string) []ssoOrgGroupRule {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return []ssoOrgGroupRule{}
	}
	var payload []struct {
		Group   string `json:"group"`
		OrgID   uint   `json:"org_id"`
		OrgRole string `json:"org_role"`
	}
	if err := json.Unmarshal([]byte(trimmed), &payload); err != nil {
		return []ssoOrgGroupRule{}
	}

	rules := make([]ssoOrgGroupRule, 0, len(payload))
	seen := make(map[string]struct{}, len(payload))
	for _, item := range payload {
		group := strings.ToLower(strings.TrimSpace(item.Group))
		if group == "" || item.OrgID == 0 {
			continue
		}
		key := group + ":" + strconv.FormatUint(uint64(item.OrgID), 10)
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		rules = append(rules, ssoOrgGroupRule{
			Group:   group,
			OrgID:   item.OrgID,
			OrgRole: normalizeSSODefaultOrganizationRole(item.OrgRole),
		})
	}
	return rules
}

func serializeSSODefaultOrganizationGroupRulesJSON(raw string) string {
	rules := normalizeSSODefaultOrganizationGroupRules(raw)
	if len(rules) == 0 {
		return ""
	}
	payload := make([]map[string]any, 0, len(rules))
	for _, rule := range rules {
		payload = append(payload, map[string]any{
			"group":    rule.Group,
			"org_id":   rule.OrgID,
			"org_role": string(rule.OrgRole),
		})
	}
	encoded, err := json.Marshal(payload)
	if err != nil {
		return ""
	}
	return string(encoded)
}

func serializeSSODomains(domains []string) string {
	if len(domains) == 0 {
		return ""
	}
	return strings.Join(domains, ",")
}

func isSSODefaultOrganizationEmailAllowed(email string, allowedDomains []string) bool {
	if len(allowedDomains) == 0 {
		return true
	}
	normalizedEmail := strings.ToLower(strings.TrimSpace(email))
	at := strings.LastIndex(normalizedEmail, "@")
	if at <= 0 || at >= len(normalizedEmail)-1 {
		return false
	}
	domain := normalizedEmail[at+1:]
	for _, allowed := range allowedDomains {
		if domain == strings.ToLower(strings.TrimSpace(allowed)) {
			return true
		}
	}
	return false
}

func shouldForceSignOutBySSOOffboardingMode(mode string) bool {
	return normalizeSSOOffboardingMode(mode) == ssoOffboardingDisableAndSignOut
}

func (a *App) resolveSSOProviderDefaultForceSignOut(ctx context.Context, provider string) (bool, error) {
	if a.integrationSvc == nil {
		return false, nil
	}
	_, cfg, err := a.resolveSSOProviderConfig(ctx, provider, true)
	if errors.Is(err, services.ErrIntegrationConnectorNotFound) {
		return false, services.ErrIntegrationConnectorNotFound
	}
	if err != nil {
		return false, err
	}
	return shouldForceSignOutBySSOOffboardingMode(cfg.OffboardingMode), nil
}
