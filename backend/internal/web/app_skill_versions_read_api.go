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
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.skillVersionSvc == nil || a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill version services are unavailable")
		return
	}

	skill, ok := a.loadManagedSkillForVersionAPI(w, r)
	if !ok {
		return
	}

	capturedAfter, err := parseOptionalAPITimeQuery(r.URL.Query().Get("from_time"))
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_from_time", "Invalid from_time")
		return
	}
	capturedBefore, err := parseOptionalAPITimeQuery(r.URL.Query().Get("to_time"))
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_to_time", "Invalid to_time")
		return
	}
	if capturedAfter != nil && capturedBefore != nil && capturedAfter.After(*capturedBefore) {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_time_range", "Invalid time range")
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
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "list_failed", err, "Failed to load skill versions")
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
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.skillVersionSvc == nil || a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill version services are unavailable")
		return
	}

	skill, ok := a.loadManagedSkillForVersionAPI(w, r)
	if !ok {
		return
	}
	versionID, err := parseUintURLParam(r, "versionID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_version_id", "Invalid version id")
		return
	}

	item, err := a.skillVersionSvc.GetByID(r.Context(), skill.ID, versionID)
	if err != nil {
		if errors.Is(err, services.ErrSkillNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "version_not_found", "Version not found")
			return
		}
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "query_failed", err, "Failed to load skill version")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"item": resultToAPISkillVersionItem(item),
	})
}

func (a *App) loadManagedSkillForVersionAPI(w http.ResponseWriter, r *http.Request) (models.Skill, bool) {
	skillID, err := parseUintURLParam(r, "skillID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_skill_id", "Invalid skill id")
		return models.Skill{}, false
	}
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return models.Skill{}, false
	}

	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		writeAPIError(w, r, http.StatusNotFound, "skill_not_found", "Skill not found")
		return models.Skill{}, false
	}
	if !user.CanManageSkill(skill.OwnerID) {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return models.Skill{}, false
	}
	return skill, true
}
