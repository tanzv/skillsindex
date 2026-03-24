package services

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strings"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

var (
	// ErrAPIOperationNotFound indicates the requested API operation record does not exist.
	ErrAPIOperationNotFound = errors.New("api operation not found")
)

type apiRuntimeReloader interface {
	Reload(context.Context) error
}

// ResolvedAPIOperationPolicy represents the effective runtime policy for one API operation.
type ResolvedAPIOperationPolicy struct {
	OperationID    string                       `json:"operation_id"`
	AuthMode       models.APIOperationAuthMode `json:"auth_mode"`
	RequiredRoles  []string                     `json:"required_roles"`
	RequiredScopes []string                     `json:"required_scopes"`
	Enabled        bool                         `json:"enabled"`
	MockEnabled    bool                         `json:"mock_enabled"`
	ExportEnabled  bool                         `json:"export_enabled"`
}

func getCurrentPublishedSpecRecord(ctx context.Context, database *gorm.DB) (models.APISpec, error) {
	if database == nil {
		return models.APISpec{}, fmt.Errorf("database is not configured")
	}

	var spec models.APISpec
	err := database.WithContext(ctx).
		Where("is_current = ? AND status = ?", true, models.APISpecStatusPublished).
		Order("published_at DESC, id DESC").
		First(&spec).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.APISpec{}, ErrAPISpecNotFound
	}
	if err != nil {
		return models.APISpec{}, fmt.Errorf("failed to load current published api spec: %w", err)
	}
	return spec, nil
}

func normalizeAPIOperationAuthMode(raw string) (models.APIOperationAuthMode, error) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "", string(models.APIAuthModeInherit):
		return models.APIAuthModeInherit, nil
	case string(models.APIAuthModePublic):
		return models.APIAuthModePublic, nil
	case string(models.APIAuthModeSession):
		return models.APIAuthModeSession, nil
	case string(models.APIAuthModeAPIKey):
		return models.APIAuthModeAPIKey, nil
	default:
		return "", fmt.Errorf("unsupported api auth mode: %s", raw)
	}
}

func normalizePolicyStringList(values []string) []string {
	unique := make(map[string]struct{}, len(values))
	normalized := make([]string, 0, len(values))
	for _, value := range values {
		clean := strings.ToLower(strings.TrimSpace(value))
		if clean == "" {
			continue
		}
		if _, exists := unique[clean]; exists {
			continue
		}
		unique[clean] = struct{}{}
		normalized = append(normalized, clean)
	}
	sort.Strings(normalized)
	return normalized
}

func validateRequiredRoles(values []string) ([]string, error) {
	roles := normalizePolicyStringList(values)
	for _, role := range roles {
		switch models.UserRole(role) {
		case models.RoleViewer, models.RoleMember, models.RoleAdmin, models.RoleSuperAdmin:
		default:
			return nil, fmt.Errorf("unsupported user role: %s", role)
		}
	}
	return roles, nil
}

func resolveDefaultAPIOperationAuthMode(operation models.APIOperation) models.APIOperationAuthMode {
	switch strings.ToLower(strings.TrimSpace(operation.Visibility)) {
	case "internal", "account":
		return models.APIAuthModeSession
	default:
		return models.APIAuthModePublic
	}
}

func resolveAPIOperationPolicy(operation models.APIOperation, stored *models.APIOperationPolicy) ResolvedAPIOperationPolicy {
	resolved := ResolvedAPIOperationPolicy{
		OperationID:    operation.OperationID,
		AuthMode:       resolveDefaultAPIOperationAuthMode(operation),
		RequiredRoles:  []string{},
		RequiredScopes: []string{},
		Enabled:        true,
		MockEnabled:    false,
		ExportEnabled:  true,
	}
	if stored == nil {
		return resolved
	}

	if stored.AuthMode != "" && stored.AuthMode != models.APIAuthModeInherit {
		resolved.AuthMode = stored.AuthMode
	}
	resolved.RequiredRoles = normalizePolicyStringList(stored.RequiredRoles)
	resolved.RequiredScopes = normalizePolicyStringList(stored.RequiredScopes)
	resolved.Enabled = stored.Enabled
	resolved.MockEnabled = stored.MockEnabled
	resolved.ExportEnabled = stored.ExportEnabled
	return resolved
}

