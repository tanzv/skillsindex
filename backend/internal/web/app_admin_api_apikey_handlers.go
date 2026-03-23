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
