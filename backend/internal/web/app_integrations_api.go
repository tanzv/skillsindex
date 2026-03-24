package web

import (
	"net/http"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminIntegrations(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanViewAllSkills() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.integrationSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Integration service is unavailable")
		return
	}

	provider := r.URL.Query().Get("provider")
	includeDisabled := parseBoolFlag(r.URL.Query().Get("include_disabled"), true)
	limit := parsePositiveInt(r.URL.Query().Get("limit"), 50)
	if limit <= 0 {
		limit = 50
	}
	items, err := a.integrationSvc.ListConnectors(r.Context(), services.ListConnectorsInput{
		Provider:        provider,
		IncludeDisabled: includeDisabled,
		Limit:           limit,
	})
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "list_failed", "Failed to load integration connectors")
		return
	}
	logs, logErr := a.integrationSvc.ListWebhookLogs(r.Context(), services.ListWebhookLogsInput{Limit: limit})
	if logErr != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "list_failed", "Failed to load webhook delivery logs")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"items":         items,
		"total":         len(items),
		"webhook_logs":  logs,
		"webhook_total": len(logs),
	})
}
