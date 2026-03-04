package web

import (
	"context"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) applySSODefaultOrganizationMembership(
	ctx context.Context,
	user models.User,
	cfg ssoConnectorConfig,
	provider string,
	email string,
	groups []string,
) error {
	if a.organizationSvc == nil {
		return nil
	}

	memberships, err := a.organizationSvc.ListMembershipsByUser(ctx, user.ID)
	if err != nil {
		return err
	}
	existing := make(map[uint]struct{}, len(memberships))
	for _, membership := range memberships {
		existing[membership.OrganizationID] = struct{}{}
	}

	systemActor := models.User{
		ID:     0,
		Role:   models.RoleSuperAdmin,
		Status: models.UserStatusActive,
	}

	groupMatched := false
	for _, rule := range cfg.DefaultOrgGroupRules {
		if rule.OrgID == 0 || !containsNormalizedSSOGroup(groups, rule.Group) {
			continue
		}
		groupMatched = true
		if _, exists := existing[rule.OrgID]; exists {
			continue
		}
		if err := a.organizationSvc.AddOrUpdateMember(
			ctx,
			rule.OrgID,
			systemActor,
			user.ID,
			rule.OrgRole,
		); err != nil {
			return err
		}
		existing[rule.OrgID] = struct{}{}
		a.recordAudit(ctx, &user, services.RecordAuditInput{
			Action:     "auth_sso_auto_join_org_by_group",
			TargetType: "organization",
			TargetID:   rule.OrgID,
			Summary:    "Assigned SSO user to organization by group mapping",
			Details: auditDetailsJSON(map[string]string{
				"sso_provider": provider,
				"org_id":       strconv.FormatUint(uint64(rule.OrgID), 10),
				"org_role":     string(rule.OrgRole),
				"group":        rule.Group,
			}),
		})
	}
	if groupMatched {
		return nil
	}

	if cfg.DefaultOrgID == 0 || !isSSODefaultOrganizationEmailAllowed(email, cfg.DefaultOrgDomains) {
		return nil
	}
	if _, exists := existing[cfg.DefaultOrgID]; exists {
		return nil
	}
	if err := a.organizationSvc.AddOrUpdateMember(
		ctx,
		cfg.DefaultOrgID,
		systemActor,
		user.ID,
		cfg.DefaultOrgRole,
	); err != nil {
		return err
	}

	a.recordAudit(ctx, &user, services.RecordAuditInput{
		Action:     "auth_sso_auto_join_org",
		TargetType: "organization",
		TargetID:   cfg.DefaultOrgID,
		Summary:    "Assigned SSO user to default organization",
		Details: auditDetailsJSON(map[string]string{
			"sso_provider": provider,
			"org_id":       strconv.FormatUint(uint64(cfg.DefaultOrgID), 10),
			"org_role":     string(cfg.DefaultOrgRole),
		}),
	})
	return nil
}

func containsNormalizedSSOGroup(groups []string, target string) bool {
	if len(groups) == 0 {
		return false
	}
	normalizedTarget := normalizeSSOGroupForMatch(target)
	if normalizedTarget == "" {
		return false
	}
	for _, group := range groups {
		if normalizeSSOGroupForMatch(group) == normalizedTarget {
			return true
		}
	}
	return false
}

func normalizeSSOGroupForMatch(raw string) string {
	return strings.ToLower(strings.TrimSpace(raw))
}
