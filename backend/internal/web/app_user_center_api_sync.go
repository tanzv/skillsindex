package web

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAPIUserCenterSync(w http.ResponseWriter, r *http.Request) {
	actor, ok := a.requireUserCenterPermission(w, r, userCenterPermissionAccountsSync)
	if !ok {
		return
	}
	if a.authService == nil || a.oauthGrantService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "User center services are unavailable")
		return
	}

	input, err := readAPIUserCenterSyncInput(r)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}
	providerLabel, providerKey, providerOK := normalizeUserCenterSyncProvider(input.Provider)
	if !providerOK {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_provider", "Invalid sync provider")
		return
	}
	mode := normalizeUserCenterSyncMode(input.Mode)
	if len(input.Users) == 0 {
		writeAPIError(w, r, http.StatusBadRequest, "users_required", "At least one user is required")
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
			writeAPIError(w, r, http.StatusBadRequest, "invalid_payload", fmt.Sprintf("users[%d].external_user_id is required", idx))
			return
		}
		if _, exists := seenExternalIDs[externalUserID]; exists {
			writeAPIError(w, r, http.StatusBadRequest, "invalid_payload", fmt.Sprintf("duplicate external user id: %s", externalUserID))
			return
		}
		seenExternalIDs[externalUserID] = struct{}{}

		role := models.RoleMember
		if strings.TrimSpace(sourceUser.Role) != "" {
			parsedRole, roleOK := parseRoleValue(sourceUser.Role)
			if !roleOK {
				writeAPIError(w, r, http.StatusBadRequest, "invalid_payload", fmt.Sprintf("users[%d].role is invalid", idx))
				return
			}
			role = parsedRole
		}
		status := models.UserStatusActive
		if strings.TrimSpace(sourceUser.Status) != "" {
			parsedStatus, statusOK := parseUserStatus(sourceUser.Status)
			if !statusOK {
				writeAPIError(w, r, http.StatusBadRequest, "invalid_payload", fmt.Sprintf("users[%d].status is invalid", idx))
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
			writeAPIError(w, r, http.StatusInternalServerError, "resolve_user_failed", "Failed to resolve sync target user")
			return
		}

		if created {
			createdCount++
		} else {
			updatedCount++
		}

		if targetUser.EffectiveRole() != role {
			if err := a.authService.SetUserRole(r.Context(), targetUser.ID, role); err != nil {
				writeAPIError(w, r, http.StatusInternalServerError, "sync_role_failed", "Failed to synchronize user role")
				return
			}
		}
		if userStatusValue(targetUser) != string(status) {
			if err := a.authService.SetUserStatus(r.Context(), targetUser.ID, status); err != nil {
				writeAPIError(w, r, http.StatusInternalServerError, "sync_status_failed", "Failed to synchronize user status")
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
			writeAPIError(w, r, http.StatusInternalServerError, "mapping_upsert_failed", "Failed to update account binding")
			return
		}

		normalizedPermissions := normalizeUserCenterPermissionList(sourceUser.Permissions)
		if len(normalizedPermissions) > 0 {
			if err := a.setUserCenterPermissionOverride(r.Context(), targetUser.ID, normalizedPermissions); err != nil {
				writeAPIError(w, r, http.StatusInternalServerError, "permission_update_failed", "Failed to update user permissions")
				return
			}
			permissionConfiguredCount++
		}
	}

	if mode == "full" {
		grants, err := a.oauthGrantService.ListGrantsByProviders(r.Context(), []models.OAuthProvider{providerKey})
		if err != nil {
			writeAPIError(w, r, http.StatusInternalServerError, "mapping_query_failed", "Failed to load existing account bindings")
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
				writeAPIError(w, r, http.StatusInternalServerError, "offboard_failed", "Failed to disable missing account")
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
