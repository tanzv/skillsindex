package web

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

type apiAccountAPIKeyItem struct {
	ID            uint       `json:"id"`
	Name          string     `json:"name"`
	Purpose       string     `json:"purpose"`
	Prefix        string     `json:"prefix"`
	Scopes        []string   `json:"scopes"`
	Status        string     `json:"status"`
	RevokedAt     *time.Time `json:"revoked_at,omitempty"`
	ExpiresAt     *time.Time `json:"expires_at,omitempty"`
	LastRotatedAt *time.Time `json:"last_rotated_at,omitempty"`
	LastUsedAt    *time.Time `json:"last_used_at,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

func resultToAPIAccountAPIKeyItems(items []models.APIKey) []apiAccountAPIKeyItem {
	result := make([]apiAccountAPIKeyItem, 0, len(items))
	for _, item := range items {
		result = append(result, resultToAPIAccountAPIKeyItem(item))
	}
	return result
}

func resultToAPIAccountAPIKeyItem(item models.APIKey) apiAccountAPIKeyItem {
	return apiAccountAPIKeyItem{
		ID:            item.ID,
		Name:          item.Name,
		Purpose:       item.Purpose,
		Prefix:        item.Prefix,
		Scopes:        services.APIKeyScopes(item),
		Status:        apiAPIKeyStatus(item),
		RevokedAt:     item.RevokedAt,
		ExpiresAt:     item.ExpiresAt,
		LastRotatedAt: item.LastRotatedAt,
		LastUsedAt:    item.LastUsedAt,
		CreatedAt:     item.CreatedAt,
		UpdatedAt:     item.UpdatedAt,
	}
}

func (a *App) handleAPIAccountAPIKeys(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.apiKeyService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	keys, err := a.apiKeyService.ListByUser(r.Context(), currentUser.ID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"items":            resultToAPIAccountAPIKeyItems(keys),
		"total":            len(keys),
		"supported_scopes": services.SupportedAPIKeyScopes(),
		"default_scopes":   services.DefaultAPIKeyScopes(),
	})
}

func (a *App) handleAPIAccountAPIKeysCreate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
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
	if input.OwnerUserID != nil && *input.OwnerUserID != 0 && *input.OwnerUserID != currentUser.ID {
		writeJSON(w, http.StatusBadRequest, map[string]any{
			"error":   "invalid_payload",
			"message": "owner_user_id is not supported on account api key endpoints",
		})
		return
	}

	created, plaintext, err := a.apiKeyService.Create(r.Context(), services.CreateAPIKeyInput{
		UserID:        currentUser.ID,
		Name:          input.Name,
		Purpose:       input.Purpose,
		CreatedBy:     currentUser.ID,
		ExpiresInDays: input.ExpiresInDays,
		Scopes:        input.Scopes,
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "create_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "account_api_key_create",
		TargetType: "api_key",
		TargetID:   created.ID,
		Summary:    "Created personal API credential",
		Details: auditDetailsJSON(map[string]string{
			"name":    created.Name,
			"purpose": created.Purpose,
			"prefix":  created.Prefix,
			"scopes":  strings.Join(services.APIKeyScopes(created), ","),
		}),
	})

	writeJSON(w, http.StatusCreated, map[string]any{
		"item":          resultToAPIAccountAPIKeyItem(created),
		"plaintext_key": plaintext,
	})
}

func (a *App) handleAPIAccountAPIKeyRevoke(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
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

	key, err := a.loadOwnedAPIKey(r.Context(), keyID, currentUser.ID)
	if err != nil {
		a.writeOwnedAPIKeyError(w, err)
		return
	}

	if err := a.apiKeyService.Revoke(r.Context(), key.ID, currentUser.ID); err != nil {
		if errors.Is(err, services.ErrAPIKeyNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "api_key_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "revoke_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "account_api_key_revoke",
		TargetType: "api_key",
		TargetID:   key.ID,
		Summary:    "Revoked personal API credential",
		Details: auditDetailsJSON(map[string]string{
			"name":   key.Name,
			"prefix": key.Prefix,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{"ok": true})
}

func (a *App) handleAPIAccountAPIKeyRotate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
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

	key, err := a.loadOwnedAPIKey(r.Context(), keyID, currentUser.ID)
	if err != nil {
		a.writeOwnedAPIKeyError(w, err)
		return
	}

	rotated, plaintext, err := a.apiKeyService.Rotate(r.Context(), key.ID, currentUser.ID)
	if err != nil {
		if errors.Is(err, services.ErrAPIKeyNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "api_key_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "rotate_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "account_api_key_rotate",
		TargetType: "api_key",
		TargetID:   rotated.ID,
		Summary:    "Rotated personal API credential",
		Details: auditDetailsJSON(map[string]string{
			"original_id": strconv.FormatUint(uint64(key.ID), 10),
			"new_id":      strconv.FormatUint(uint64(rotated.ID), 10),
			"new_prefix":  rotated.Prefix,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"item":          resultToAPIAccountAPIKeyItem(rotated),
		"plaintext_key": plaintext,
	})
}

func (a *App) handleAPIAccountAPIKeyScopesUpdate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
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

	key, err := a.loadOwnedAPIKey(r.Context(), keyID, currentUser.ID)
	if err != nil {
		a.writeOwnedAPIKeyError(w, err)
		return
	}

	inputScopes, err := readAPIKeyScopesInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}

	updated, err := a.apiKeyService.UpdateScopes(r.Context(), key.ID, currentUser.ID, inputScopes)
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

	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "account_api_key_scope_update",
		TargetType: "api_key",
		TargetID:   updated.ID,
		Summary:    "Updated personal API credential scopes",
		Details: auditDetailsJSON(map[string]string{
			"prefix": key.Prefix,
			"scopes": strings.Join(services.APIKeyScopes(updated), ","),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"item": resultToAPIAccountAPIKeyItem(updated),
	})
}

func (a *App) loadOwnedAPIKey(ctx context.Context, keyID uint, ownerUserID uint) (models.APIKey, error) {
	key, err := a.apiKeyService.GetByID(ctx, keyID)
	if err != nil {
		return models.APIKey{}, err
	}
	if key.UserID != ownerUserID {
		return models.APIKey{}, services.ErrAPIKeyNotFound
	}
	return key, nil
}

func (a *App) writeOwnedAPIKeyError(w http.ResponseWriter, err error) {
	if errors.Is(err, services.ErrAPIKeyNotFound) {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "api_key_not_found"})
		return
	}
	writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
}
