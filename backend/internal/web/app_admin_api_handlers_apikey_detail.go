package web

import (
	"errors"
	"net/http"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminAPIKeyDetail(w http.ResponseWriter, r *http.Request) {
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

	ownerUsername := ""
	if a.authService != nil {
		ownerUser, ownerErr := a.authService.GetUserByID(r.Context(), key.UserID)
		if ownerErr == nil {
			ownerUsername = ownerUser.Username
		}
	}
	key.User = models.User{ID: key.UserID, Username: ownerUsername}

	writeJSON(w, http.StatusOK, map[string]any{
		"item": resultToAPIAdminAPIKeyItem(key),
	})
}
