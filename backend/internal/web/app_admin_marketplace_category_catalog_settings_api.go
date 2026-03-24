package web

import (
	"encoding/json"
	"net/http"
	"strconv"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminCategoryCatalogSetting(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}

	items, err := a.loadMarketplaceCategoryCatalog(r.Context())
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load category catalog settings")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"items": items,
	})
}

func (a *App) handleAPIAdminCategoryCatalogSettingUpdate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.settingsService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Settings service is unavailable")
		return
	}

	var payload marketplaceCategoryCatalogPayload
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&payload); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}

	if _, err := normalizeMarketplaceCategoryCatalog(payload.Items); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}
	if err := a.saveMarketplaceCategoryCatalog(r.Context(), payload.Items); err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "update_failed", "Failed to update category catalog settings")
		return
	}

	items, err := a.loadMarketplaceCategoryCatalog(r.Context())
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load category catalog settings")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_marketplace_category_catalog_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated marketplace category catalog through admin api",
		Details: auditDetailsJSON(map[string]string{
			"category_count": strconv.Itoa(len(items)),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"items": items,
	})
}
