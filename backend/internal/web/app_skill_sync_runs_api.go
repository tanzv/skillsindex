package web

import (
	"errors"
	"net/http"

	"skillsindex/internal/services"
)

func (a *App) handleAPISkillSyncRuns(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.syncJobSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}
	if a.skillService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}

	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "skill_not_found"})
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	limit := parsePositiveInt(r.URL.Query().Get("limit"), 80)
	items, listErr := a.syncJobSvc.ListRuns(r.Context(), services.ListSyncRunsInput{
		TargetSkillID: &skillID,
		Limit:         limit,
	})
	if listErr != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": listErr.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

func (a *App) handleAPISkillSyncRunDetail(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.syncJobSvc == nil || a.skillService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	runID, err := parseUintURLParam(r, "runID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_run_id"})
		return
	}

	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "skill_not_found"})
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	item, err := a.syncJobSvc.GetRunByID(r.Context(), runID)
	if err != nil {
		if errors.Is(err, services.ErrSyncRunNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "sync_run_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}
	if item.TargetSkillID == nil || *item.TargetSkillID != skillID {
		writeJSON(w, http.StatusNotFound, map[string]any{"error": "sync_run_not_found"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": item})
}
