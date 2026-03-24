package web

import (
	"errors"
	"net/http"

	"skillsindex/internal/services"
)

func (a *App) handleAPISkillSyncRuns(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.syncJobSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Sync job service is unavailable")
		return
	}
	if a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill service is unavailable")
		return
	}

	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}

	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		writeAPIError(w, r, http.StatusNotFound, "skill_not_found", "Skill not found")
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}

	filters, err := parseSyncRunListCommonFilters(r)
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, syncRunListFilterErrorCode(err), syncRunListFilterMessage(err))
		return
	}

	input := filters.listInput()
	input.TargetSkillID = &skillID

	items, listErr := a.syncJobSvc.ListRuns(r.Context(), input)
	if listErr != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "list_failed", "Failed to load sync runs")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"items": resultToAPISyncRunItems(items), "total": len(items)})
}

func (a *App) handleAPISkillSyncRunDetail(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.syncJobSvc == nil || a.skillService == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Sync run services are unavailable")
		return
	}

	skillID, ok := parseSkillID(w, r)
	if !ok {
		return
	}
	runID, err := parseUintURLParam(r, "runID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_run_id", "Invalid sync run id")
		return
	}

	skill, err := a.skillService.GetSkillByID(r.Context(), skillID)
	if err != nil {
		writeAPIError(w, r, http.StatusNotFound, "skill_not_found", "Skill not found")
		return
	}
	if !user.CanManageSkill(skill.OwnerID) {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}

	item, err := a.syncJobSvc.GetRunByID(r.Context(), runID)
	if err != nil {
		if errors.Is(err, services.ErrSyncRunNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "sync_run_not_found", "Sync run not found")
			return
		}
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load sync run")
		return
	}
	if item.TargetSkillID == nil || *item.TargetSkillID != skillID {
		writeAPIError(w, r, http.StatusNotFound, "sync_run_not_found", "Sync run not found")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": a.buildSyncRunDetailAPIItem(r.Context(), item)})
}
