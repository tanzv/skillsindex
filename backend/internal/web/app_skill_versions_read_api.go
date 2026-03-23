package web

import (
	"errors"
	"net/http"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAPISkillVersions(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.skillVersionSvc == nil || a.skillService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	skill, ok := a.loadManagedSkillForVersionAPI(w, r)
	if !ok {
		return
	}

	capturedAfter, err := parseOptionalAPITimeQuery(r.URL.Query().Get("from_time"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_from_time"})
		return
	}
	capturedBefore, err := parseOptionalAPITimeQuery(r.URL.Query().Get("to_time"))
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_to_time"})
		return
	}
	if capturedAfter != nil && capturedBefore != nil && capturedAfter.After(*capturedBefore) {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_time_range"})
		return
	}

	items, err := a.skillVersionSvc.ListBySkill(r.Context(), services.ListSkillVersionsInput{
		SkillID:         skill.ID,
		Trigger:         strings.TrimSpace(r.URL.Query().Get("trigger")),
		CapturedAfter:   capturedAfter,
		CapturedBefore:  capturedBefore,
		IncludeArchived: parseBoolFlag(r.URL.Query().Get("include_archived"), false),
		Limit:           parsePositiveInt(r.URL.Query().Get("limit"), 80),
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"items": resultToAPISkillVersionItems(items),
		"total": len(items),
	})
}

func (a *App) handleAPISkillVersionDetail(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.skillVersionSvc == nil || a.skillService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	skill, ok := a.loadManagedSkillForVersionAPI(w, r)
	if !ok {
		return
	}
	versionID, err := parseUintURLParam(r, "versionID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_version_id"})
		return
	}

	item, err := a.skillVersionSvc.GetByID(r.Context(), skill.ID, versionID)
	if err != nil {
		if errors.Is(err, services.ErrSkillNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "version_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"item": resultToAPISkillVersionItem(item),
	})
}

func (a *App) loadManagedSkillForVersionAPI(w http.ResponseWriter, r *http.Request) (models.Skill, bool) {
	skillID, err := parseUintURLParam(r, "skillID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_skill_id"})
		return models.Skill{}, false
	}
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return models.Skill{}, false
	}

	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "skill_not_found"})
		return models.Skill{}, false
	}
	if !user.CanManageSkill(skill.OwnerID) {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return models.Skill{}, false
	}
	return skill, true
}
