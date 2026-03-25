package web

import (
	"net/http"
	"strings"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminSSOProviders(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if !user.CanManageUsers() {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}
	if a.integrationSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Integration service is unavailable")
		return
	}

	rawProvider := strings.TrimSpace(r.URL.Query().Get("provider"))
	provider := ""
	if rawProvider != "" {
		provider = normalizeSSOProvider(rawProvider)
		if provider == "" {
			writeAPIError(w, r, http.StatusBadRequest, "invalid_provider", "Invalid provider")
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
		writeAPIError(w, r, http.StatusInternalServerError, "list_failed", "Failed to list SSO providers")
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
