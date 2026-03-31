package web

import (
	"errors"
	"net/http"
	"strconv"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminSSOUsersSync(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.authService == nil || a.oauthGrantService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "SSO sync services are unavailable")
		return
	}

	input, err := readAPIAdminSSOUsersSyncInput(r)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}
	if input.Provider == "" {
		writeAPIError(w, r, http.StatusBadRequest, "provider_required", "Provider is required")
		return
	}
	if len(input.DisabledExternalIDs) == 0 {
		writeAPIError(w, r, http.StatusBadRequest, "disabled_external_ids_required", "Disabled external ids are required")
		return
	}
	forceSignOut, err := a.resolveSSOProviderDefaultForceSignOut(r.Context(), input.Provider)
	if err != nil {
		if errors.Is(err, services.ErrIntegrationConnectorNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "provider_not_found", "Provider not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "policy_query_failed", err, "Failed to load SSO provider policy")
		return
	}
	if input.ForceSignOut != nil {
		forceSignOut = *input.ForceSignOut
	}

	disabledCount := 0
	for _, externalID := range input.DisabledExternalIDs {
		targetUser, findErr := a.oauthGrantService.FindUserByExternalID(r.Context(), ssoOAuthProvider(input.Provider), externalID)
		if errors.Is(findErr, services.ErrOAuthGrantNotFound) {
			continue
		}
		if findErr != nil {
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "mapping_query_failed", findErr, "Failed to resolve SSO user mapping")
			return
		}
		if statusErr := a.authService.SetUserStatus(r.Context(), targetUser.ID, models.UserStatusDisabled); statusErr != nil {
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "disable_user_failed", statusErr, "Failed to disable SSO user")
			return
		}
		if forceSignOut {
			_ = a.authService.ForceSignOutUser(r.Context(), targetUser.ID)
		}
		disabledCount++
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_sso_users_sync",
		TargetType: "user",
		TargetID:   0,
		Summary:    "Synchronized disabled users from enterprise SSO through admin api",
		Details: auditDetailsJSON(map[string]string{
			"provider":       input.Provider,
			"disabled_count": strconv.Itoa(disabledCount),
			"force_sign_out": strconv.FormatBool(forceSignOut),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                   true,
		"provider":             input.Provider,
		"disabled_count":       disabledCount,
		"requested_identities": len(input.DisabledExternalIDs),
		"force_sign_out":       forceSignOut,
	})
}
