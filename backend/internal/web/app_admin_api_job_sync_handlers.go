package web

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) handleAPIAdminJobs(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.asyncJobSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	limit := parsePositiveInt(r.URL.Query().Get("limit"), 120)
	var ownerID *uint
	if user.CanViewAllSkills() {
		raw := strings.TrimSpace(r.URL.Query().Get("owner_id"))
		if raw != "" {
			value, err := strconv.ParseUint(raw, 10, 64)
			if err != nil || value == 0 {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_owner_id"})
				return
			}
			parsed := uint(value)
			ownerID = &parsed
		}
	} else {
		ownerID = &user.ID
	}

	status := models.AsyncJobStatus(strings.ToLower(strings.TrimSpace(r.URL.Query().Get("status"))))
	jobType := models.AsyncJobType(strings.ToLower(strings.TrimSpace(r.URL.Query().Get("job_type"))))
	items, err := a.asyncJobSvc.List(r.Context(), services.ListAsyncJobsInput{
		OwnerUserID: ownerID,
		Status:      status,
		JobType:     jobType,
		Limit:       limit,
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": resultToAPIAdminAsyncJobItems(items), "total": len(items)})
}

func (a *App) handleAPIAdminJobDetail(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.asyncJobSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	jobID, err := parseUintURLParam(r, "jobID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_job_id"})
		return
	}
	item, err := a.asyncJobSvc.GetByID(r.Context(), jobID)
	if err != nil {
		if errors.Is(err, services.ErrAsyncJobNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "job_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}
	if !canViewAsyncJobDetail(*user, item) {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminAsyncJobItem(item)})
}

func (a *App) handleAPIAdminJobRetry(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.asyncJobSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	jobID, err := parseUintURLParam(r, "jobID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_job_id"})
		return
	}
	item, err := a.asyncJobSvc.GetByID(r.Context(), jobID)
	if err != nil {
		if errors.Is(err, services.ErrAsyncJobNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "job_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}
	if !canViewAsyncJobDetail(*user, item) {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	updated, retryErr := a.asyncJobSvc.Retry(r.Context(), jobID, user.ID, time.Now().UTC())
	if retryErr != nil {
		if errors.Is(retryErr, services.ErrAsyncJobInvalidTransition) {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_transition"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "retry_failed", "message": retryErr.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_async_job_retry",
		TargetType: "async_job",
		TargetID:   updated.ID,
		Summary:    "Retried async orchestration job through admin api",
		Details: auditDetailsJSON(map[string]string{
			"job_type": string(updated.JobType),
			"status":   string(updated.Status),
			"attempt":  strconv.Itoa(updated.Attempt),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminAsyncJobItem(updated)})
}

func (a *App) handleAPIAdminJobCancel(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.asyncJobSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	jobID, err := parseUintURLParam(r, "jobID")
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_job_id"})
		return
	}
	item, err := a.asyncJobSvc.GetByID(r.Context(), jobID)
	if err != nil {
		if errors.Is(err, services.ErrAsyncJobNotFound) {
			writeJSON(w, http.StatusNotFound, map[string]any{"error": "job_not_found"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}
	if !canViewAsyncJobDetail(*user, item) {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	updated, cancelErr := a.asyncJobSvc.Cancel(r.Context(), jobID, user.ID, time.Now().UTC())
	if cancelErr != nil {
		if errors.Is(cancelErr, services.ErrAsyncJobInvalidTransition) {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_transition"})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "cancel_failed", "message": cancelErr.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_admin_async_job_cancel",
		TargetType: "async_job",
		TargetID:   updated.ID,
		Summary:    "Canceled async orchestration job through admin api",
		Details: auditDetailsJSON(map[string]string{
			"job_type": string(updated.JobType),
			"status":   string(updated.Status),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminAsyncJobItem(updated)})
}

func (a *App) handleAPIAdminSyncJobs(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if a.syncJobSvc == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	limit := parsePositiveInt(r.URL.Query().Get("limit"), 80)
	var ownerID *uint
	if user.CanViewAllSkills() {
		raw := strings.TrimSpace(r.URL.Query().Get("owner_id"))
		if raw != "" {
			value, err := strconv.ParseUint(raw, 10, 64)
			if err != nil || value == 0 {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_owner_id"})
				return
			}
			parsed := uint(value)
			ownerID = &parsed
		}
	} else {
		ownerID = &user.ID
	}

	items, err := a.syncJobSvc.ListRuns(r.Context(), services.ListSyncRunsInput{
		OwnerUserID: ownerID,
		Limit:       limit,
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "list_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": items, "total": len(items)})
}

func (a *App) handleAPIAdminSyncJobDetail(w http.ResponseWriter, r *http.Request) {
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

	writeJSON(w, http.StatusOK, map[string]any{"item": item})
}

func (a *App) handleAPIAdminRepositorySyncPolicy(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanViewAllSkills() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.syncPolicyService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	policy, err := a.syncPolicyService.Get(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"enabled":    policy.Enabled,
		"interval":   policy.Interval.String(),
		"timeout":    policy.Timeout.String(),
		"batch_size": policy.BatchSize,
	})
}

func (a *App) handleAPIAdminRepositorySyncPolicyUpdate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanViewAllSkills() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.syncPolicyService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	input, err := readRepositorySyncPolicyUpdateInput(r)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
		return
	}
	if input.Enabled == nil && input.Interval == nil && input.Timeout == nil && input.BatchSize == nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "empty_payload"})
		return
	}

	updated, err := a.syncPolicyService.Update(r.Context(), input)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_repo_sync_policy_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated repository sync policy through admin api",
		Details: auditDetailsJSON(map[string]string{
			"enabled":    strconv.FormatBool(updated.Enabled),
			"interval":   updated.Interval.String(),
			"timeout":    updated.Timeout.String(),
			"batch_size": strconv.Itoa(updated.BatchSize),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"enabled":    updated.Enabled,
		"interval":   updated.Interval.String(),
		"timeout":    updated.Timeout.String(),
		"batch_size": updated.BatchSize,
	})
}
