package web

import (
	"errors"
	"net/http"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminSyncJobs(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.syncJobSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Sync job service is unavailable")
		return
	}

	filters, err := parseSyncRunListCommonFilters(r)
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, syncRunListFilterErrorCode(err), syncRunListFilterMessage(err))
		return
	}
	ownerID, err := resolveSyncRunOwnerScope(r, user.CanViewAllSkills(), user.ID)
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_owner_id", "Invalid owner id filter")
		return
	}
	targetSkillID, err := parseOptionalUintQuery(r, "target_skill_id")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_target_skill_id", "Invalid target skill id filter")
		return
	}

	input := filters.listInput()
	input.OwnerUserID = ownerID
	input.TargetSkillID = targetSkillID

	items, err := a.syncJobSvc.ListRuns(r.Context(), input)
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "list_failed", "Failed to load sync jobs")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": resultToAPISyncRunItems(items), "total": len(items)})
}

func (a *App) handleAPIAdminSyncJobDetail(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.syncJobSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Sync job service is unavailable")
		return
	}

	runID, err := parseUintURLParam(r, "runID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_run_id", "Invalid sync run id")
		return
	}
	item, err := a.syncJobSvc.GetRunByID(r.Context(), runID)
	if err != nil {
		if errors.Is(err, services.ErrSyncRunNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "sync_run_not_found", "Sync run not found")
			return
		}
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load sync job detail")
		return
	}

	if !canViewSyncRunDetail(*user, item) {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": a.buildSyncRunDetailAPIItem(r.Context(), item)})
}
