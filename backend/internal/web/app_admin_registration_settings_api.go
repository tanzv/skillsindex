package web

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminRegistrationSetting(w http.ResponseWriter, r *http.Request) {
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

	allowRegistration, err := a.settingsService.GetBool(r.Context(), services.SettingAllowRegistration, a.allowRegistration)
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load registration settings")
		return
	}
	marketplacePublicAccess, err := a.settingsService.GetBool(r.Context(), services.SettingMarketplacePublicAccess, true)
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load registration settings")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                        true,
		"allow_registration":        allowRegistration,
		"marketplace_public_access": marketplacePublicAccess,
	})
}

func (a *App) handleAPIAdminRegistrationSettingUpdate(w http.ResponseWriter, r *http.Request) {
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

	marketplacePublicAccess, err := a.settingsService.GetBool(r.Context(), services.SettingMarketplacePublicAccess, true)
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load registration settings")
		return
	}
	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	allowRegistration := false
	if strings.Contains(contentType, "application/json") {
		var payload map[string]any
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
			return
		}
		rawAllowRegistration, ok := payload["allow_registration"]
		if !ok {
			writeAPIError(w, r, http.StatusBadRequest, "invalid_payload", "missing allow_registration")
			return
		}
		parsedAllowRegistration, matched := parseBoolSettingValue(rawAllowRegistration)
		if !matched {
			writeAPIError(w, r, http.StatusBadRequest, "invalid_payload", "invalid bool value for allow_registration")
			return
		}
		allowRegistration = parsedAllowRegistration
		if rawMarketplacePublicAccess, exists := payload["marketplace_public_access"]; exists {
			parsedMarketplacePublicAccess, matched := parseBoolSettingValue(rawMarketplacePublicAccess)
			if !matched {
				writeAPIError(w, r, http.StatusBadRequest, "invalid_payload", "invalid bool value for marketplace_public_access")
				return
			}
			marketplacePublicAccess = parsedMarketplacePublicAccess
		}
	} else {
		if err := r.ParseForm(); err != nil {
			writeAPIErrorFromError(w, r, http.StatusBadRequest, "invalid_payload", err, "Invalid request payload")
			return
		}
		rawAllowRegistration := strings.TrimSpace(r.FormValue("allow_registration"))
		if rawAllowRegistration == "" {
			writeAPIError(w, r, http.StatusBadRequest, "invalid_payload", "missing allow_registration")
			return
		}
		parsedAllowRegistration, matched := parseBoolSettingValue(rawAllowRegistration)
		if !matched {
			writeAPIError(w, r, http.StatusBadRequest, "invalid_payload", "invalid bool value for allow_registration")
			return
		}
		allowRegistration = parsedAllowRegistration
		if rawMarketplacePublicAccess := strings.TrimSpace(r.FormValue("marketplace_public_access")); rawMarketplacePublicAccess != "" {
			parsedMarketplacePublicAccess, matched := parseBoolSettingValue(rawMarketplacePublicAccess)
			if !matched {
				writeAPIError(w, r, http.StatusBadRequest, "invalid_payload", "invalid bool value for marketplace_public_access")
				return
			}
			marketplacePublicAccess = parsedMarketplacePublicAccess
		}
	}

	if err := a.settingsService.SetBool(r.Context(), services.SettingAllowRegistration, allowRegistration); err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "update_failed", "Failed to update registration settings")
		return
	}
	if err := a.settingsService.SetBool(r.Context(), services.SettingMarketplacePublicAccess, marketplacePublicAccess); err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "update_failed", "Failed to update registration settings")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_access_registration_policy_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated registration policy through admin api",
		Details: auditDetailsJSON(map[string]string{
			"allow_registration":        strconv.FormatBool(allowRegistration),
			"marketplace_public_access": strconv.FormatBool(marketplacePublicAccess),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                        true,
		"allow_registration":        allowRegistration,
		"marketplace_public_access": marketplacePublicAccess,
	})
}
