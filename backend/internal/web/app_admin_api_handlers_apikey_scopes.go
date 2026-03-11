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

	inputScopes, err := readAPIKeyScopesInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}

	updated, err := a.apiKeyService.UpdateScopes(r.Context(), key.ID, key.UserID, inputScopes)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrAPIKeyNotFound):
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "api_key_not_found"})
		case errors.Is(err, services.ErrAPIKeyScopesRequired):
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "scopes_required"})
		case strings.Contains(strings.ToLower(err.Error()), "invalid scope"):
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_scope", "message": err.Error()})
		default:
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "scope_update_failed", "message": err.Error()})
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
