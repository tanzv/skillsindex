package web

import (
	"net/http"
	"time"
)

type apiPublicSkillVersionItem struct {
	ID               uint       `json:"id"`
	SkillID          uint       `json:"skill_id"`
	VersionNumber    int        `json:"version_number"`
	Trigger          string     `json:"trigger"`
	ChangeSummary    string     `json:"change_summary"`
	RiskLevel        string     `json:"risk_level"`
	CapturedAt       time.Time  `json:"captured_at"`
	ArchivedAt       *time.Time `json:"archived_at,omitempty"`
	ArchiveReason    string     `json:"archive_reason,omitempty"`
	ActorUsername    string     `json:"actor_username"`
	ActorDisplayName string     `json:"actor_display_name"`
	Tags             []string   `json:"tags"`
	ChangedFields    []string   `json:"changed_fields"`
}

type apiPublicSkillVersionsResponse struct {
	Items []apiPublicSkillVersionItem `json:"items"`
	Total int                         `json:"total"`
}

func (a *App) handleAPIPublicSkillVersions(w http.ResponseWriter, r *http.Request) {
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
	items, err := a.skillService.ListMarketplaceVisibleSkillVersions(r.Context(), skillID, viewerID, 20)
	if err != nil {
		writeMarketplaceSkillLookupError(w, r, err, "version")
		return
	}

	writeJSON(w, http.StatusOK, apiPublicSkillVersionsResponse{
		Items: toAPIPublicSkillVersionItems(items),
		Total: len(items),
	})
}
