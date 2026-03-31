package web

import (
	"errors"
	"net/http"
	"strings"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminSSOProviderCreate(w http.ResponseWriter, r *http.Request) {
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

	input, err := readAPIAdminSSOProviderCreateInput(r)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
		return
	}
	provider := normalizeSSOProvider(input.Provider)
	if provider == "" {
		writeAPIError(w, r, http.StatusBadRequest, "provider_required", "Provider is required")
		return
	}

	if _, err := a.integrationSvc.GetConnectorByProvider(r.Context(), provider, true); err == nil {
		writeAPIError(w, r, http.StatusConflict, "provider_exists", "Provider already exists")
		return
	} else if !errors.Is(err, services.ErrIntegrationConnectorNotFound) {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "provider_query_failed", err, "Failed to load SSO provider")
		return
	}

	rawConfig, err := marshalSSOConnectorConfig(input)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "config_serialize_failed", err, "Failed to serialize SSO provider configuration")
		return
	}

	name := strings.TrimSpace(input.Name)
	if name == "" {
		name = provider
	}
	created, err := a.integrationSvc.CreateConnector(r.Context(), services.CreateConnectorInput{
		Name:        name,
		Provider:    provider,
		Description: defaultString(strings.TrimSpace(input.Description), "Enterprise SSO provider"),
		BaseURL:     strings.TrimSpace(input.Issuer),
		ConfigJSON:  rawConfig,
		Enabled:     true,
		CreatedBy:   user.ID,
	})
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusBadRequest, "create_failed", err, "Failed to create SSO provider")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_sso_provider_create",
		TargetType: "integration_connector",
		TargetID:   created.ID,
		Summary:    "Created enterprise SSO provider through admin api",
		Details: auditDetailsJSON(map[string]string{
			"provider": created.Provider,
			"name":     created.Name,
		}),
	})

	writeJSON(w, http.StatusCreated, map[string]any{
		"item": resultToAPIAdminSSOProviderItem(created),
	})
}

func (a *App) handleAPIAdminSSOProviderDisable(w http.ResponseWriter, r *http.Request) {
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

	providerID, err := parseUintURLParam(r, "providerID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_provider_id", "Invalid provider id")
		return
	}
	updated, err := a.integrationSvc.SetConnectorEnabled(r.Context(), providerID, false)
	if err != nil {
		if errors.Is(err, services.ErrIntegrationConnectorNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "provider_not_found", "Provider not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "disable_failed", err, "Failed to disable SSO provider")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_sso_provider_disable",
		TargetType: "integration_connector",
		TargetID:   updated.ID,
		Summary:    "Disabled enterprise SSO provider through admin api",
		Details: auditDetailsJSON(map[string]string{
			"provider": updated.Provider,
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"item": resultToAPIAdminSSOProviderItem(updated),
	})
}
