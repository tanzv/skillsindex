package web

import (
	"net/http"
	"strings"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminSSOProviders(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.integrationSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	rawProvider := strings.TrimSpace(r.URL.Query().Get("provider"))
	provider := ""
	if rawProvider != "" {
		provider = normalizeSSOProvider(rawProvider)
		if provider == "" {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_provider"})
			return
		}
	}
	includeDisabled := parseBoolFlag(r.URL.Query().Get("include_disabled"), true)
	limit := parsePositiveInt(r.URL.Query().Get("limit"), 50)
	if limit <= 0 {
		limit = 50
	}
	if limit > 200 {
		limit = 200
	}

	connectors, err := a.integrationSvc.ListConnectors(r.Context(), services.ListConnectorsInput{
		Provider:        provider,
		IncludeDisabled: includeDisabled,
		Limit:           limit,
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}

	items := make([]apiAdminSSOProviderItem, 0, len(connectors))
	for _, connector := range connectors {
		if _, cfgErr := parseSSOConnectorConfig(connector); cfgErr != nil {
			continue
		}
		items = append(items, resultToAPIAdminSSOProviderItem(connector))
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"items": items,
		"total": len(items),
	})
}
