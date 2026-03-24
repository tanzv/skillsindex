package web

import (
	"encoding/json"
	"net/http"
	"strconv"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminPresentationTaxonomySetting(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}

	items, err := a.loadMarketplacePresentationTaxonomySettings(r.Context())
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load presentation taxonomy settings")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"items": items,
	})
}

func (a *App) handleAPIAdminPresentationTaxonomySettingUpdate(w http.ResponseWriter, r *http.Request) {
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

	var payload marketplacePresentationTaxonomyPayload
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&payload); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}

	if _, err := normalizeMarketplacePresentationTaxonomy(payload.Items); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}
	if err := a.saveMarketplacePresentationTaxonomySettings(r.Context(), payload.Items); err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "update_failed", "Failed to update presentation taxonomy settings")
		return
	}

	items, err := a.loadMarketplacePresentationTaxonomySettings(r.Context())
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load presentation taxonomy settings")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_marketplace_presentation_taxonomy_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated marketplace presentation taxonomy through admin api",
		Details: auditDetailsJSON(map[string]string{
			"category_count": strconv.Itoa(len(items)),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"items": items,
	})
}
