package web

import (
	"errors"
	"net/http"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

func writeAPIAdminAuthProviderConfigServiceUnavailable(w http.ResponseWriter, r *http.Request, app *App) {
	switch {
	case app == nil:
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Auth provider services are unavailable")
	case app.settingsService == nil:
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Settings service is unavailable")
	case app.integrationSvc == nil:
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Integration service is unavailable")
	default:
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Auth provider services are unavailable")
	}
}

func (a *App) handleAPIAdminAuthProviderConfigs(w http.ResponseWriter, r *http.Request) {
	if _, ok := requireAdminUserManagementAPI(w, r); !ok {
		return
	}
	if a.settingsService == nil || a.integrationSvc == nil {
		writeAPIAdminAuthProviderConfigServiceUnavailable(w, r, a)
		return
	}

	items := make([]apiAdminAuthProviderConfigItem, 0, len(authProviderOrder))
	for _, key := range authProviderOrder {
		detail, err := a.buildAPIAdminAuthProviderConfigDetail(r.Context(), key)
		if err != nil {
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "provider_query_failed", err, "Failed to load auth provider configuration")
			return
		}
		items = append(items, detail.apiAdminAuthProviderConfigItem)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":    true,
		"items": items,
	})
}

func (a *App) handleAPIAdminAuthProviderConfigDetail(w http.ResponseWriter, r *http.Request) {
	if _, ok := requireAdminUserManagementAPI(w, r); !ok {
		return
	}
	if a.settingsService == nil || a.integrationSvc == nil {
		writeAPIAdminAuthProviderConfigServiceUnavailable(w, r, a)
		return
	}

	provider := normalizeManagedAuthProviderKey(chi.URLParam(r, "provider"))
	if provider == "" {
		writeAPIError(w, r, http.StatusNotFound, "provider_not_found", "Provider not found")
		return
	}

	item, err := a.buildAPIAdminAuthProviderConfigDetail(r.Context(), provider)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "provider_query_failed", err, "Failed to load auth provider configuration")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"ok":   true,
		"item": item,
	})
}

func (a *App) handleAPIAdminAuthProviderConfigUpsert(w http.ResponseWriter, r *http.Request) {
	user, ok := requireAdminUserManagementAPI(w, r)
	if !ok {
		return
	}
	if a.settingsService == nil || a.integrationSvc == nil {
		writeAPIAdminAuthProviderConfigServiceUnavailable(w, r, a)
		return
	}

	input, err := readAPIAdminSSOProviderCreateInput(r)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}
	provider := normalizeManagedAuthProviderKey(input.Provider)
	if provider == "" {
		writeAPIError(w, r, http.StatusBadRequest, "provider_required", "Provider is required")
		return
	}
	definition, _ := authProviderDefinitionFor(provider)

	input.Provider = provider
	if strings.TrimSpace(input.Name) == "" {
		input.Name = definition.DefaultDisplayName
	}
	if strings.TrimSpace(input.Description) == "" {
		input.Description = definition.DefaultDisplayName + " identity provider"
	}

	rawConfig, err := marshalSSOConnectorConfig(input)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "config_serialize_failed", err, "Failed to serialize auth provider configuration")
		return
	}
	if _, err := parseSSOConnectorConfig(models.IntegrationConnector{
		Provider:   provider,
		BaseURL:    strings.TrimSpace(input.Issuer),
		ConfigJSON: rawConfig,
		Enabled:    true,
	}); err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_provider_config", err, "Invalid auth provider configuration")
		return
	}

	existing, err := a.integrationSvc.GetConnectorByProvider(r.Context(), provider, true)
	statusCode := http.StatusOK
	switch {
	case err == nil:
		enabled := true
		if _, err := a.integrationSvc.UpdateConnector(r.Context(), existing.ID, services.UpdateConnectorInput{
			Name:        input.Name,
			Description: input.Description,
			BaseURL:     strings.TrimSpace(input.Issuer),
			ConfigJSON:  rawConfig,
			Enabled:     &enabled,
		}); err != nil {
			writeAPIErrorFromError(w, r, http.StatusInternalServerError, "update_failed", err, "Failed to update auth provider configuration")
			return
		}
	case errors.Is(err, services.ErrIntegrationConnectorNotFound):
		if _, err := a.integrationSvc.CreateConnector(r.Context(), services.CreateConnectorInput{
			Name:        input.Name,
			Provider:    provider,
			Description: input.Description,
			BaseURL:     strings.TrimSpace(input.Issuer),
			ConfigJSON:  rawConfig,
			Enabled:     true,
			CreatedBy:   user.ID,
		}); err != nil {
			writeAPIErrorFromError(w, r, http.StatusBadRequest, "create_failed", err, "Failed to create auth provider configuration")
			return
		}
		statusCode = http.StatusCreated
	default:
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "provider_query_failed", err, "Failed to load auth provider configuration")
		return
	}

	if _, err := a.setEnabledAuthProvider(r.Context(), provider, true); err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "visibility_update_failed", err, "Failed to update auth provider visibility")
		return
	}

	item, err := a.buildAPIAdminAuthProviderConfigDetail(r.Context(), provider)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "provider_query_failed", err, "Failed to load auth provider configuration")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_auth_provider_config_upsert",
		TargetType: "integration_connector",
		TargetID:   item.ConnectorID,
		Summary:    "Upserted managed auth provider through admin api",
		Details: auditDetailsJSON(map[string]string{
			"provider": provider,
			"name":     item.Name,
		}),
	})

	writeJSON(w, statusCode, map[string]any{
		"ok":   true,
		"item": item,
	})
}

func (a *App) handleAPIAdminAuthProviderConfigDisable(w http.ResponseWriter, r *http.Request) {
	user, ok := requireAdminUserManagementAPI(w, r)
	if !ok {
		return
	}
	if a.settingsService == nil || a.integrationSvc == nil {
		writeAPIAdminAuthProviderConfigServiceUnavailable(w, r, a)
		return
	}

	provider := normalizeManagedAuthProviderKey(chi.URLParam(r, "provider"))
	if provider == "" {
		writeAPIError(w, r, http.StatusNotFound, "provider_not_found", "Provider not found")
		return
	}

	connector, err := a.integrationSvc.GetConnectorByProvider(r.Context(), provider, true)
	if err != nil {
		if errors.Is(err, services.ErrIntegrationConnectorNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "provider_not_found", "Provider not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "provider_query_failed", err, "Failed to load auth provider configuration")
		return
	}

	if _, err := a.integrationSvc.SetConnectorEnabled(r.Context(), connector.ID, false); err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "disable_failed", err, "Failed to disable auth provider")
		return
	}
	if _, err := a.setEnabledAuthProvider(r.Context(), provider, false); err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "visibility_update_failed", err, "Failed to update auth provider visibility")
		return
	}

	item, err := a.buildAPIAdminAuthProviderConfigDetail(r.Context(), provider)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "provider_query_failed", err, "Failed to load auth provider configuration")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_auth_provider_config_disable",
		TargetType: "integration_connector",
		TargetID:   connector.ID,
		Summary:    "Disabled managed auth provider through admin api",
		Details: auditDetailsJSON(map[string]string{
			"provider": provider,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":   true,
		"item": item,
	})
}
