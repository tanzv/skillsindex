package web

import (
	"net/http"

	"skillsindex/internal/models"
)

func (a *App) handleAPIAdminSkills(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill service is unavailable")
		return
	}

	var (
		skills []models.Skill
		err    error
	)
	if user.CanViewAllSkills() {
		skills, err = a.skillService.ListAllSkills(r.Context())
	} else {
		skills, err = a.skillService.ListSkillsByOwner(r.Context(), user.ID)
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}

	filtered := filterAdminAPISkills(
		skills,
		r.URL.Query().Get("q"),
		r.URL.Query().Get("source"),
		r.URL.Query().Get("visibility"),
		r.URL.Query().Get("owner"),
	)

	page := parsePositiveInt(r.URL.Query().Get("page"), 1)
	if page < 1 {
		page = 1
	}
	limit := parsePositiveInt(r.URL.Query().Get("limit"), 20)
	if limit > 200 {
		limit = 200
	}
	start := (page - 1) * limit
	if start > len(filtered) {
		start = len(filtered)
	}
	end := start + limit
	if end > len(filtered) {
		end = len(filtered)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"items": resultToAPIAdminSkillItems(filtered[start:end]),
		"page":  page,
		"limit": limit,
		"total": len(filtered),
	})
}
