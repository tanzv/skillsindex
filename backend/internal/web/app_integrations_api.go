package web

import (
	"net/http"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminIntegrations(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanViewAllSkills() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.integrationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
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
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}
	logs, logErr := a.integrationSvc.ListWebhookLogs(r.Context(), services.ListWebhookLogsInput{Limit: limit})
	if logErr != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": logErr.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"items":         items,
		"total":         len(items),
		"webhook_logs":  logs,
		"webhook_total": len(logs),
	})
}
