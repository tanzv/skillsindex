package web

import (
	"errors"
	"fmt"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAPIUserCenterAccounts(w http.ResponseWriter, r *http.Request) {
	actor, ok := a.requireUserCenterPermission(w, r, userCenterPermissionAccountsRead)
	if !ok {
		return
	}
	if a.authService == nil || a.oauthGrantService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	accounts, err := a.authService.ListUsers(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}
	grants, err := a.oauthGrantService.ListGrantsByProviders(r.Context(), []models.OAuthProvider{models.OAuthProviderFeishuSync, models.OAuthProviderDingTalkSync})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "mapping_query_failed", "message": err.Error()})
		return
	}

	bindingsByUser := map[uint][]apiUserCenterBindingItem{}
	for _, grant := range grants {
		provider := userCenterProviderLabel(grant.Provider)
		if provider == "" {
			continue
		}
		bindingsByUser[grant.UserID] = append(bindingsByUser[grant.UserID], apiUserCenterBindingItem{
			Provider:       provider,
			ExternalUserID: grant.ExternalUserID,
			ExpiresAt:      grant.ExpiresAt.UTC(),
		})
	}

	overrides, err := a.loadUserCenterPermissionOverrides(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "permission_query_failed", "message": err.Error()})
		return
	}

	items := make([]apiUserCenterAccountItem, 0, len(accounts))
	for _, account := range accounts {
		permissions, permErr := a.resolveUserCenterPermissions(r.Context(), account)
		if permErr != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "permission_query_failed", "message": permErr.Error()})
			return
		}
		source := "default"
		if _, exists := overrides[account.ID]; exists {
			source = "override"
		}
		bindings := bindingsByUser[account.ID]
		sort.Slice(bindings, func(i int, j int) bool {
			if bindings[i].Provider == bindings[j].Provider {
				return bindings[i].ExternalUserID < bindings[j].ExternalUserID
			}
			return bindings[i].Provider < bindings[j].Provider
		})
		items = append(items, apiUserCenterAccountItem{
			ID:            account.ID,
			Username:      account.Username,
			DisplayName:   account.DisplayName,
			AvatarURL:     account.AvatarURL,
			Role:          string(account.EffectiveRole()),
			Status:        userStatusValue(account),
			Permissions:   permissions,
			BindingSource: source,
			Bindings:      bindings,
			CreatedAt:     account.CreatedAt,
			UpdatedAt:     account.UpdatedAt,
		})
	}

	a.recordAudit(r.Context(), actor, services.RecordAuditInput{
		Action:     "api_user_center_accounts_list",
		TargetType: "user",
		TargetID:   0,
		Summary:    "Listed user center accounts",
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"items":                 items,
		"total":                 len(items),
		"available_permissions": userCenterAllPermissions,
	})
}

func (a *App) handleAPIUserCenterSync(w http.ResponseWriter, r *http.Request) {
	actor, ok := a.requireUserCenterPermission(w, r, userCenterPermissionAccountsSync)
	if !ok {
		return
	}
	if a.authService == nil || a.oauthGrantService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	input, err := readAPIUserCenterSyncInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	providerLabel, providerKey, providerOK := normalizeUserCenterSyncProvider(input.Provider)
	if !providerOK {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_provider"})
		return
	}
	mode := normalizeUserCenterSyncMode(input.Mode)
	if len(input.Users) == 0 {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "users_required"})
		return
	}

	seenExternalIDs := map[string]struct{}{}
	createdCount := 0
	updatedCount := 0
	disabledCount := 0
	permissionConfiguredCount := 0
	forceSignOutDisabled := input.ForceSignOutDisabled != nil && *input.ForceSignOutDisabled

	for idx, sourceUser := range input.Users {
		externalUserID := strings.TrimSpace(sourceUser.ExternalUserID)
		if externalUserID == "" {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": fmt.Sprintf("users[%d].external_user_id is required", idx)})
			return
		}
		if _, exists := seenExternalIDs[externalUserID]; exists {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": fmt.Sprintf("duplicate external user id: %s", externalUserID)})
			return
		}
		seenExternalIDs[externalUserID] = struct{}{}

		role := models.RoleMember
		if strings.TrimSpace(sourceUser.Role) != "" {
			parsedRole, roleOK := parseRoleValue(sourceUser.Role)
			if !roleOK {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": fmt.Sprintf("users[%d].role is invalid", idx)})
				return
			}
			role = parsedRole
		}
		status := models.UserStatusActive
		if strings.TrimSpace(sourceUser.Status) != "" {
			parsedStatus, statusOK := parseUserStatus(sourceUser.Status)
			if !statusOK {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": fmt.Sprintf("users[%d].status is invalid", idx)})
				return
			}
			status = parsedStatus
		}

		preferredUsername := strings.TrimSpace(sourceUser.Username)
		if preferredUsername == "" {
			preferredUsername = buildUserCenterSyncUsername(providerLabel, sourceUser.DisplayName, externalUserID)
		}
		preferredUsername = strings.ToLower(strings.TrimSpace(preferredUsername))

		targetUser, created, resolveErr := a.resolveUserCenterSyncTarget(r.Context(), providerKey, externalUserID, preferredUsername, role)
		if resolveErr != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "resolve_user_failed", "message": resolveErr.Error()})
			return
		}

		if created {
			createdCount++
		} else {
			updatedCount++
		}

		if targetUser.EffectiveRole() != role {
			if err := a.authService.SetUserRole(r.Context(), targetUser.ID, role); err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "sync_role_failed", "message": err.Error()})
				return
			}
		}
		if userStatusValue(targetUser) != string(status) {
			if err := a.authService.SetUserStatus(r.Context(), targetUser.ID, status); err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "sync_status_failed", "message": err.Error()})
				return
			}
		}
		if status == models.UserStatusDisabled && forceSignOutDisabled {
			_ = a.authService.ForceSignOutUser(r.Context(), targetUser.ID)
		}

		if strings.TrimSpace(sourceUser.DisplayName) != "" || strings.TrimSpace(sourceUser.AvatarURL) != "" {
			_, _ = a.authService.UpdateProfile(r.Context(), targetUser.ID, services.UpdateUserProfileInput{
				DisplayName: defaultString(strings.TrimSpace(sourceUser.DisplayName), targetUser.DisplayName),
				AvatarURL:   defaultString(strings.TrimSpace(sourceUser.AvatarURL), targetUser.AvatarURL),
				Bio:         targetUser.Bio,
			})
		}

		_, upsertErr := a.oauthGrantService.UpsertGrant(r.Context(), services.UpsertOAuthGrantInput{
			UserID:         targetUser.ID,
			Provider:       providerKey,
			ExternalUserID: externalUserID,
			AccessToken:    buildUserCenterSyncGrantToken(providerLabel, externalUserID),
			Scope:          "user_center_sync",
			ExpiresAt:      time.Now().UTC().Add(24 * 365 * 10 * time.Hour),
		})
		if upsertErr != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "mapping_upsert_failed", "message": upsertErr.Error()})
			return
		}

		normalizedPermissions := normalizeUserCenterPermissionList(sourceUser.Permissions)
		if len(normalizedPermissions) > 0 {
			if err := a.setUserCenterPermissionOverride(r.Context(), targetUser.ID, normalizedPermissions); err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "permission_update_failed", "message": err.Error()})
				return
			}
			permissionConfiguredCount++
		}
	}

	if mode == "full" {
		grants, err := a.oauthGrantService.ListGrantsByProviders(r.Context(), []models.OAuthProvider{providerKey})
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "mapping_query_failed", "message": err.Error()})
			return
		}
		for _, grant := range grants {
			if _, exists := seenExternalIDs[strings.TrimSpace(grant.ExternalUserID)]; exists {
				continue
			}
			targetUser, getErr := a.authService.GetUserByID(r.Context(), grant.UserID)
			if getErr != nil {
				continue
			}
			if userStatusValue(targetUser) != string(models.UserStatusDisabled) {
				disabledCount++
			}
			if err := a.authService.SetUserStatus(r.Context(), grant.UserID, models.UserStatusDisabled); err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "offboard_failed", "message": err.Error()})
				return
			}
			if forceSignOutDisabled {
				_ = a.authService.ForceSignOutUser(r.Context(), grant.UserID)
			}
		}
	}

	a.recordAudit(r.Context(), actor, services.RecordAuditInput{
		Action:     "api_user_center_sync",
		TargetType: "user",
		TargetID:   0,
		Summary:    "Synchronized user accounts from enterprise provider",
		Details: auditDetailsJSON(map[string]string{
			"provider":                    providerLabel,
			"mode":                        mode,
			"created_count":               strconv.Itoa(createdCount),
			"updated_count":               strconv.Itoa(updatedCount),
			"disabled_count":              strconv.Itoa(disabledCount),
			"permission_configured_count": strconv.Itoa(permissionConfiguredCount),
			"force_sign_out_disabled":     strconv.FormatBool(forceSignOutDisabled),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                          true,
		"provider":                    providerLabel,
		"mode":                        mode,
		"received_count":              len(input.Users),
		"created_count":               createdCount,
		"updated_count":               updatedCount,
		"disabled_count":              disabledCount,
		"permission_configured_count": permissionConfiguredCount,
		"force_sign_out_disabled":     forceSignOutDisabled,
	})
}

func (a *App) handleAPIUserCenterPermissionsGet(w http.ResponseWriter, r *http.Request) {
	_, ok := a.requireUserCenterPermission(w, r, userCenterPermissionPermissionsEdit)
	if !ok {
		return
	}
	if a.authService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	targetUserID, err := parseUintURLParam(r, "userID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_user_id"})
		return
	}
	targetUser, err := a.authService.GetUserByID(r.Context(), targetUserID)
	if err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "user_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	overrides, err := a.loadUserCenterPermissionOverrides(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "permission_query_failed", "message": err.Error()})
		return
	}
	defaultPermissions := defaultUserCenterPermissions(targetUser.EffectiveRole())
	effectivePermissions := defaultPermissions
	source := "default"
	overridePermissions := []string{}
	if override, exists := overrides[targetUser.ID]; exists {
		effectivePermissions = override
		overridePermissions = override
		source = "override"
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"user_id":               targetUser.ID,
		"role":                  string(targetUser.EffectiveRole()),
		"available_permissions": userCenterAllPermissions,
		"default_permissions":   defaultPermissions,
		"override_permissions":  overridePermissions,
		"effective_permissions": effectivePermissions,
		"permission_source":     source,
	})
}

func (a *App) handleAPIUserCenterPermissionsUpdate(w http.ResponseWriter, r *http.Request) {
	actor, ok := a.requireUserCenterPermission(w, r, userCenterPermissionPermissionsEdit)
	if !ok {
		return
	}
	if a.authService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	targetUserID, err := parseUintURLParam(r, "userID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_user_id"})
		return
	}
	targetUser, err := a.authService.GetUserByID(r.Context(), targetUserID)
	if err != nil {
		if errors.Is(err, services.ErrUserNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "user_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	input, err := readAPIUserCenterPermissionUpdateInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	normalized := normalizeUserCenterPermissionList(input.Permissions)
	if err := a.setUserCenterPermissionOverride(r.Context(), targetUserID, normalized); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), actor, services.RecordAuditInput{
		Action:     "api_user_center_permissions_update",
		TargetType: "user",
		TargetID:   targetUserID,
		Summary:    "Updated user center permissions",
		Details: auditDetailsJSON(map[string]string{
			"username":    targetUser.Username,
			"permissions": strings.Join(normalized, ","),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                    true,
		"user_id":               targetUserID,
		"effective_permissions": normalized,
	})
}
