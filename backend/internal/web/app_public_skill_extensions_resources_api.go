package web

import "net/http"

func (a *App) handleAPIPublicSkillResources(w http.ResponseWriter, r *http.Request) {
	if !a.ensureMarketplaceAccess(w, r) {
		return
	}
	if a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill service unavailable")
		return
	}

	skillID, ok := parseSkillIDParam(r)
	if !ok {
		writeAPIError(w, r, http.StatusNotFound, "skill_not_found", "Skill not found")
		return
	}

	viewerID := resolveMarketplaceViewerID(r, a.authService)
	skill, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), skillID, viewerID)
	if err != nil {
		writeMarketplaceSkillLookupError(w, r, err, "resource")
		return
	}

	files, topology := a.resolvePublicSkillResourceSnapshot(r, skill)
	writeJSON(w, http.StatusOK, buildPublicSkillResourcesResponse(skill, files, topology))
}
