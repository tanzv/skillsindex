package web

import (
	"context"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

const (
	userCenterPermissionAccountsRead    = "user_center.accounts.read"
	userCenterPermissionAccountsSync    = "user_center.accounts.sync"
	userCenterPermissionPermissionsEdit = "user_center.permissions.manage"
)

var userCenterAllPermissions = []string{
	userCenterPermissionAccountsRead,
	userCenterPermissionAccountsSync,
	userCenterPermissionPermissionsEdit,
}

func normalizeUserCenterPermissionList(values []string) []string {
	seen := map[string]struct{}{}
	items := make([]string, 0, len(values))
	for _, raw := range values {
		clean := strings.ToLower(strings.TrimSpace(raw))
		if clean == "" {
			continue
		}
		if !isAllowedUserCenterPermission(clean) {
			continue
		}
		if _, exists := seen[clean]; exists {
			continue
		}
		seen[clean] = struct{}{}
		items = append(items, clean)
	}
	sort.Strings(items)
	return items
}

func isAllowedUserCenterPermission(permission string) bool {
	for _, item := range userCenterAllPermissions {
		if item == permission {
			return true
		}
	}
	return false
}

func defaultUserCenterPermissions(role models.UserRole) []string {
	switch models.NormalizeUserRole(string(role)) {
	case models.RoleSuperAdmin:
		permissions := append([]string{}, userCenterAllPermissions...)
		sort.Strings(permissions)
		return permissions
	case models.RoleAdmin:
		return []string{userCenterPermissionAccountsRead, userCenterPermissionAccountsSync}
	default:
		return []string{}
	}
}

func userCenterPermissionSet(values []string) map[string]struct{} {
	result := make(map[string]struct{}, len(values))
	for _, item := range values {
		result[item] = struct{}{}
	}
	return result
}

func (a *App) hasUserCenterPermission(ctx context.Context, user models.User, permission string) (bool, error) {
	permissions, err := a.resolveUserCenterPermissions(ctx, user)
	if err != nil {
		return false, err
	}
	_, exists := userCenterPermissionSet(permissions)[strings.ToLower(strings.TrimSpace(permission))]
	return exists, nil
}

func (a *App) resolveUserCenterPermissions(ctx context.Context, user models.User) ([]string, error) {
	defaults := defaultUserCenterPermissions(user.EffectiveRole())
	if a.settingsService == nil {
		return defaults, nil
	}
	overrides, err := a.loadUserCenterPermissionOverrides(ctx)
	if err != nil {
		return nil, err
	}
	override, exists := overrides[user.ID]
	if !exists {
		return defaults, nil
	}
	return override, nil
}

func (a *App) loadUserCenterPermissionOverrides(ctx context.Context) (map[uint][]string, error) {
	if a.settingsService == nil {
		return map[uint][]string{}, nil
	}
	raw, err := a.settingsService.Get(ctx, services.SettingUserCenterPermissionOverrides, "")
	if err != nil {
		return nil, err
	}
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return map[uint][]string{}, nil
	}

	var payload map[string][]string
	if err := json.Unmarshal([]byte(raw), &payload); err != nil {
		return nil, fmt.Errorf("failed to parse user center permission overrides: %w", err)
	}

	result := make(map[uint][]string, len(payload))
	for key, value := range payload {
		userIDValue, parseErr := strconv.ParseUint(strings.TrimSpace(key), 10, 64)
		if parseErr != nil || userIDValue == 0 {
			continue
		}
		result[uint(userIDValue)] = normalizeUserCenterPermissionList(value)
	}
	return result, nil
}

func (a *App) saveUserCenterPermissionOverrides(ctx context.Context, values map[uint][]string) error {
	if a.settingsService == nil {
		return fmt.Errorf("settings service is unavailable")
	}
	payload := make(map[string][]string, len(values))
	for userID, permissions := range values {
		if userID == 0 {
			continue
		}
		payload[strconv.FormatUint(uint64(userID), 10)] = normalizeUserCenterPermissionList(permissions)
	}
	raw, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to serialize user center permission overrides: %w", err)
	}
	return a.settingsService.Set(ctx, services.SettingUserCenterPermissionOverrides, string(raw))
}

func (a *App) setUserCenterPermissionOverride(ctx context.Context, userID uint, permissions []string) error {
	if userID == 0 {
		return fmt.Errorf("user id is required")
	}
	overrides, err := a.loadUserCenterPermissionOverrides(ctx)
	if err != nil {
		return err
	}
	overrides[userID] = normalizeUserCenterPermissionList(permissions)
	return a.saveUserCenterPermissionOverrides(ctx, overrides)
}
