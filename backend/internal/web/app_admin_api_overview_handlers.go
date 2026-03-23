package web

import "net/http"

func (a *App) handleAPIAdminOverview(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}

	counts, err := a.skillService.CountDashboardSkills(r.Context(), user.ID, user.CanViewAllSkills())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "count_failed", "message": err.Error()})
		return
	}

	orgCount := 0
	if a.organizationSvc != nil {
		orgs, orgErr := a.organizationSvc.ListOrganizations(r.Context(), *user)
		if orgErr == nil {
			orgCount = len(orgs)
		}
	}

	accountCount := int64(0)
	if user.CanManageUsers() {
		accounts, accountErr := a.authService.ListUsers(r.Context())
		if accountErr == nil {
			accountCount = int64(len(accounts))
		}
	}

	var payload apiAdminOverviewResponse
	payload.User.ID = user.ID
	payload.User.Username = user.Username
	payload.User.Role = string(user.EffectiveRole())
	payload.Counts.Total = counts.Total
	payload.Counts.Public = counts.Public
	payload.Counts.Private = counts.Private
	payload.Counts.Syncable = counts.Syncable
	payload.Counts.OrgCount = orgCount
	payload.Counts.AccountCount = int(accountCount)
	payload.Capabilities.CanManageUsers = user.CanManageUsers()
	payload.Capabilities.CanViewAll = user.CanViewAllSkills()

	writeJSON(w, http.StatusOK, payload)
}
