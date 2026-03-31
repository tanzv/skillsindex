package web

import (
	"net/http"

	"skillsindex/internal/models"
)

type apiPublicSkillCompareResponse struct {
	LeftSkill  apiSkillResponse `json:"left_skill"`
	RightSkill apiSkillResponse `json:"right_skill"`
}

func (a *App) handleAPIPublicSkillCompare(w http.ResponseWriter, r *http.Request) {
	if !a.ensureMarketplaceAccess(w, r) {
		return
	}
	if a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill service unavailable")
		return
	}

	leftSkillID, rightSkillID, ok := parseCompareSkillIDs(r)
	if !ok {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_compare_query", "Both left and right skill identifiers are required")
		return
	}

	viewerID := resolveMarketplaceViewerID(r, a.authService)
	leftSkill, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), leftSkillID, viewerID)
	if err != nil {
		writeMarketplaceSkillLookupError(w, r, err, "left")
		return
	}
	rightSkill, err := a.skillService.GetMarketplaceVisibleSkillByID(r.Context(), rightSkillID, viewerID)
	if err != nil {
		writeMarketplaceSkillLookupError(w, r, err, "right")
		return
	}

	presentationTaxonomy := a.marketplacePresentationTaxonomy(r.Context())
	items := resultToAPIItemsWithTaxonomy([]models.Skill{leftSkill, rightSkill}, presentationTaxonomy)
	writeJSON(w, http.StatusOK, apiPublicSkillCompareResponse{
		LeftSkill:  items[0],
		RightSkill: items[1],
	})
}
