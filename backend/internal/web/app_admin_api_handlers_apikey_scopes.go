package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminAPIKeyScopesUpdate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.apiKeyService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "API key service is unavailable")
		return
	}

	keyID, err := parseUintURLParam(r, "keyID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_key_id", "Invalid API key id")
		return
	}

	key, err := a.apiKeyService.GetByID(r.Context(), keyID)
	if err != nil {
		if errors.Is(err, services.ErrAPIKeyNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "api_key_not_found", "API key not found")
			return
		}
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load API key")
		return
	}
	if !user.CanManageAPIKeys(key.UserID) {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}

	inputScopes, err := readAPIKeyScopesInput(r)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}

	updated, err := a.apiKeyService.UpdateScopes(r.Context(), key.ID, key.UserID, inputScopes)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrAPIKeyNotFound):
			writeAPIError(w, r, http.StatusNotFound, "api_key_not_found", "API key not found")
		case errors.Is(err, services.ErrAPIKeyScopesRequired):
			writeAPIError(w, r, http.StatusBadRequest, "scopes_required", "At least one scope is required")
		case strings.Contains(strings.ToLower(err.Error()), "invalid scope"):
			writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_scope", err, "Invalid API key scope")
		default:
			writeAPIError(w, r, http.StatusInternalServerError, "scope_update_failed", "Failed to update API key scopes")
		}
		return
	}

	ownerUsername := ""
	if a.authService != nil {
		ownerUser, ownerErr := a.authService.GetUserByID(r.Context(), updated.UserID)
		if ownerErr == nil {
			ownerUsername = ownerUser.Username
		}
	}
	updated.User = models.User{ID: updated.UserID, Username: ownerUsername}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_api_key_scope_update",
		TargetType: "api_key",
		TargetID:   updated.ID,
		Summary:    "Updated API key scopes through admin json api",
		Details: auditDetailsJSON(map[string]string{
			"scopes": strings.Join(services.APIKeyScopes(updated), ","),
			"userID": strconv.FormatUint(uint64(updated.UserID), 10),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"item": resultToAPIAdminAPIKeyItem(updated),
	})
}
