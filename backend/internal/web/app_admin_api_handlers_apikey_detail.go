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
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.apiKeyService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	keyID, err := parseUintURLParam(r, "keyID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_key_id"})
		return
	}

	key, err := a.apiKeyService.GetByID(r.Context(), keyID)
	if err != nil {
		if errors.Is(err, services.ErrAPIKeyNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "api_key_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}
	if !user.CanManageAPIKeys(key.UserID) {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
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
