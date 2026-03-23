package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminAPIKeys(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.apiKeyService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	statusFilter := normalizeAPIAdminAPIKeyStatus(r.URL.Query().Get("status"))
	ownerFilter := strings.TrimSpace(r.URL.Query().Get("owner"))
	limit := parsePositiveInt(r.URL.Query().Get("limit"), 200)
	if limit > 1000 {
		limit = 1000
	}

	var (
		keys []models.APIKey
		err  error
	)
	if user.CanManageUsers() {
		keys, err = a.apiKeyService.ListForAdmin(r.Context(), services.ListAPIKeysInput{
			OwnerUsername: ownerFilter,
			Status:        statusFilter,
			Limit:         limit,
		})
	} else {
		if ownerFilter != "" &&
			!strings.EqualFold(ownerFilter, user.Username) &&
			ownerFilter != strconv.FormatUint(uint64(user.ID), 10) {
			writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
			return
		}
		keys, err = a.apiKeyService.ListByUser(r.Context(), user.ID)
		if err == nil {
			keys = filterAPIAdminAPIKeysByStatus(keys, statusFilter)
			if limit > 0 && len(keys) > limit {
				keys = keys[:limit]
			}
		}
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"items": resultToAPIAdminAPIKeyItems(keys),
		"total": len(keys),
	})
}

func (a *App) handleAPIAdminAPIKeysCreate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.apiKeyService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	input, err := readAPIKeyCreateInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}

	ownerUserID := user.ID
	if input.OwnerUserID != nil {
		ownerUserID = *input.OwnerUserID
	}
	if ownerUserID != user.ID && !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	ownerUsername := user.Username
	if a.authService != nil {
		ownerUser, ownerErr := a.authService.GetUserByID(r.Context(), ownerUserID)
		if ownerErr != nil {
			if errors.Is(ownerErr, services.ErrUserNotFound) {
				writeJSON(w, http.StatusNotFound, map[string]any{"error": "user_not_found"})
				return
			}
			writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "owner_query_failed", "message": ownerErr.Error()})
			return
		}
		ownerUsername = ownerUser.Username
	}

	created, plaintext, createErr := a.apiKeyService.Create(r.Context(), services.CreateAPIKeyInput{
		UserID:        ownerUserID,
		Name:          input.Name,
		Purpose:       input.Purpose,
		CreatedBy:     user.ID,
		ExpiresInDays: input.ExpiresInDays,
		Scopes:        input.Scopes,
	})
	if createErr != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "create_failed", "message": createErr.Error()})
		return
	}

	created.User = models.User{ID: ownerUserID, Username: ownerUsername}
	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_api_key_create",
		TargetType: "api_key",
		TargetID:   created.ID,
		Summary:    "Created API key through admin json api",
		Details: auditDetailsJSON(map[string]string{
			"name":      created.Name,
			"purpose":   created.Purpose,
			"prefix":    created.Prefix,
			"ownerID":   strconv.FormatUint(uint64(created.UserID), 10),
			"createdBy": strconv.FormatUint(uint64(user.ID), 10),
		}),
	})

	writeJSON(w, http.StatusCreated, map[string]any{
		"item":          resultToAPIAdminAPIKeyItem(created),
		"plaintext_key": plaintext,
	})
}

func (a *App) handleAPIAdminAPIKeyRevoke(w http.ResponseWriter, r *http.Request) {
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
	if err := a.apiKeyService.Revoke(r.Context(), key.ID, key.UserID); err != nil {
		if errors.Is(err, services.ErrAPIKeyNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "api_key_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "revoke_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_api_key_revoke",
		TargetType: "api_key",
		TargetID:   key.ID,
		Summary:    "Revoked API key through admin json api",
		Details: auditDetailsJSON(map[string]string{
			"name":   key.Name,
			"prefix": key.Prefix,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (a *App) handleAPIAdminAPIKeyRotate(w http.ResponseWriter, r *http.Request) {
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

	rotated, plaintext, rotateErr := a.apiKeyService.Rotate(r.Context(), key.ID, key.UserID)
	if rotateErr != nil {
		if errors.Is(rotateErr, services.ErrAPIKeyNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "api_key_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "rotate_failed", "message": rotateErr.Error()})
		return
	}

	ownerUsername := ""
	if a.authService != nil {
		ownerUser, ownerErr := a.authService.GetUserByID(r.Context(), rotated.UserID)
		if ownerErr == nil {
			ownerUsername = ownerUser.Username
		}
	}
	rotated.User = models.User{ID: rotated.UserID, Username: ownerUsername}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_api_key_rotate",
		TargetType: "api_key",
		TargetID:   rotated.ID,
		Summary:    "Rotated API key through admin json api",
		Details: auditDetailsJSON(map[string]string{
			"originalID": strconv.FormatUint(uint64(key.ID), 10),
			"newID":      strconv.FormatUint(uint64(rotated.ID), 10),
			"newPrefix":  rotated.Prefix,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"item":          resultToAPIAdminAPIKeyItem(rotated),
		"plaintext_key": plaintext,
	})
}
