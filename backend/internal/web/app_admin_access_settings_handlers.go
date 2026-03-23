package web

import (
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/services"
)

func (a *App) handleAdminAccessRegistrationUpdate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanManageUsers() {
		redirectAdminPath(w, r, "/admin/access", "", "Permission denied")
		return
	}
	if a.settingsService == nil {
		redirectAdminPath(w, r, "/admin/access", "", "Settings service unavailable")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminPath(w, r, "/admin/access", "", "Invalid form payload")
		return
	}

	allowRegistration := parseBoolFlag(r.FormValue("allow_registration"), false)
	marketplacePublicAccess, err := a.settingsService.GetBool(r.Context(), services.SettingMarketplacePublicAccess, true)
	if err != nil {
		redirectAdminPath(w, r, "/admin/access", "", "Failed to load marketplace access policy")
		return
	}
	if rawMarketplacePublicAccess := strings.TrimSpace(r.FormValue("marketplace_public_access")); rawMarketplacePublicAccess != "" {
		marketplacePublicAccess = parseBoolFlag(rawMarketplacePublicAccess, marketplacePublicAccess)
	}
	if err := a.settingsService.SetBool(r.Context(), services.SettingAllowRegistration, allowRegistration); err != nil {
		redirectAdminPath(w, r, "/admin/access", "", "Failed to update registration policy")
		return
	}
	if err := a.settingsService.SetBool(r.Context(), services.SettingMarketplacePublicAccess, marketplacePublicAccess); err != nil {
		redirectAdminPath(w, r, "/admin/access", "", "Failed to update marketplace access policy")
		return
	}
	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "access_registration_policy_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated registration policy",
		Details: auditDetailsJSON(map[string]string{
			"allow_registration":        strconv.FormatBool(allowRegistration),
			"marketplace_public_access": strconv.FormatBool(marketplacePublicAccess),
		}),
	})

	if allowRegistration {
		redirectAdminPath(w, r, "/admin/access", "Registration is now enabled", "")
		return
	}
	redirectAdminPath(w, r, "/admin/access", "Registration is now disabled", "")
}

func (a *App) handleAdminAccessAuthProvidersUpdate(w http.ResponseWriter, r *http.Request) {
	currentUser := currentUserFromContext(r.Context())
	if currentUser == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if !currentUser.CanManageUsers() {
		redirectAdminPath(w, r, "/admin/access", "", "Permission denied")
		return
	}
	if a.settingsService == nil {
		redirectAdminPath(w, r, "/admin/access", "", "Settings service unavailable")
		return
	}
	if err := r.ParseForm(); err != nil {
		redirectAdminPath(w, r, "/admin/access", "", "Invalid form payload")
		return
	}

	selectedProviders := normalizeAuthProviderList(r.Form["auth_providers"])
	serialized := strings.Join(selectedProviders, ",")
	if err := a.settingsService.Set(r.Context(), services.SettingAuthEnabledProviders, serialized); err != nil {
		redirectAdminPath(w, r, "/admin/access", "", "Failed to update auth providers")
		return
	}
	a.recordAudit(r.Context(), currentUser, services.RecordAuditInput{
		Action:     "access_auth_providers_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated visible auth providers",
		Details: auditDetailsJSON(map[string]string{
			"auth_enabled_providers": serialized,
		}),
	})

	redirectAdminPath(w, r, "/admin/access", "Auth provider visibility updated", "")
}
