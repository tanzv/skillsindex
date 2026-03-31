package web

import (
	"errors"
	"net/http"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminSyncRuns(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.syncJobSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Sync run service is unavailable")
		return
	}

	filters, err := parseSyncRunListCommonFilters(r)
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, syncRunListFilterErrorCode(err), syncRunListFilterMessage(err))
		return
	}
	ownerID, err := resolveSyncRunOwnerScope(r, user.CanViewAllSkills(), user.ID)
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_owner_id", "Invalid owner id")
		return
	}
	targetSkillID, err := parseOptionalUintQuery(r, "target_skill_id")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_target_skill_id", "Invalid target skill id")
		return
	}

	input := filters.listInput()
	input.OwnerUserID = ownerID
	input.TargetSkillID = targetSkillID

	items, err := a.syncJobSvc.ListRuns(r.Context(), input)
	if err != nil {
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "list_failed", err, "Failed to list sync runs")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": resultToAPISyncRunItems(items), "total": len(items)})
}

func (a *App) handleAPIAdminSyncRunDetail(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.syncJobSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Sync run service is unavailable")
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
		writeAPIErrorFromError(w, r, http.StatusInternalServerError, "query_failed", err, "Failed to load sync run")
		return
	}
	if !canViewSyncRunDetail(*user, item) {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": a.buildSyncRunDetailAPIItem(r.Context(), item)})
}

func resolveSyncRunOwnerScope(r *http.Request, canViewAll bool, currentUserID uint) (*uint, error) {
	if !canViewAll {
		ownerID := currentUserID
		return &ownerID, nil
	}
	return parseOptionalUintQuery(r, "owner_id")
}
