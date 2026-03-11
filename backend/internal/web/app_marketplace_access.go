package web

import (
	"context"
	"net/http"

	"skillsindex/internal/services"
)

func (a *App) marketplacePublicAccessEnabled(ctx context.Context) (bool, error) {
	if a.settingsService == nil {
		return true, nil
	}
	return a.settingsService.GetBool(ctx, services.SettingMarketplacePublicAccess, true)
}

func (a *App) ensureMarketplaceAccess(w http.ResponseWriter, r *http.Request) bool {
	marketplacePublicAccess, err := a.marketplacePublicAccessEnabled(r.Context())
	if err != nil {
		if requestWantsJSON(r) {
			writeJSON(w, http.StatusInternalServerError, map[string]any{
				"error":   "settings_query_failed",
				"message": "Failed to load marketplace access policy",
			})
			return false
		}
		a.renderWithStatus(w, r, http.StatusInternalServerError, ViewData{
			Page:  "home",
			Title: "Skill Marketplace",
			Error: "Failed to load marketplace access policy",
		})
		return false
	}
	if marketplacePublicAccess || currentUserFromContext(r.Context()) != nil {
		return true
	}
	if requestWantsJSON(r) {
		writeJSON(w, http.StatusUnauthorized, map[string]any{
			"error":   "unauthorized",
			"message": "Authentication required",
		})
		return false
	}
	http.Redirect(w, r, "/login", http.StatusSeeOther)
	return false
}

func (a *App) requireMarketplaceAccess(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !a.ensureMarketplaceAccess(w, r) {
			return
		}
		next.ServeHTTP(w, r)
	})
}
