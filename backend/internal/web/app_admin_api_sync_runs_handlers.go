package web

import (
	"errors"
	"net/http"

	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminSyncRuns(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.syncJobSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	filters, err := parseSyncRunListCommonFilters(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": syncRunListFilterErrorCode(err)})
		return
	}
	ownerID, err := resolveSyncRunOwnerScope(r, user.CanViewAllSkills(), user.ID)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_owner_id"})
		return
	}
	targetSkillID, err := parseOptionalUintQuery(r, "target_skill_id")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_target_skill_id"})
		return
	}

	input := filters.listInput()
	input.OwnerUserID = ownerID
	input.TargetSkillID = targetSkillID

	items, err := a.syncJobSvc.ListRuns(r.Context(), input)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": resultToAPISyncRunItems(items), "total": len(items)})
}

func (a *App) handleAPIAdminSyncRunDetail(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.syncJobSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	runID, err := parseUintURLParam(r, "runID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_run_id"})
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
	if !canViewSyncRunDetail(*user, item) {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
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
