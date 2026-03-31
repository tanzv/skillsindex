package web

import "net/http"

func (a *App) handleAPIAdminOverview(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill service is unavailable")
		return
	}

	counts, err := a.skillService.CountDashboardSkills(r.Context(), user.ID, user.CanViewAllSkills())
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "count_failed", err, "Failed to load overview counts")
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
