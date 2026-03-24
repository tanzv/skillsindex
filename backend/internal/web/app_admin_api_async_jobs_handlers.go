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
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.asyncJobSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Async job service is unavailable")
		return
	}

	limit := parsePositiveInt(r.URL.Query().Get("limit"), 120)
	var ownerID *uint
	if user.CanViewAllSkills() {
		raw := strings.TrimSpace(r.URL.Query().Get("owner_id"))
		if raw != "" {
			value, err := strconv.ParseUint(raw, 10, 64)
			if err != nil || value == 0 {
				writeAPIError(w, r, http.StatusBadRequest, "invalid_owner_id", "Invalid owner id filter")
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
		writeAPIError(w, r, http.StatusInternalServerError, "list_failed", "Failed to load async jobs")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"items": resultToAPIAdminAsyncJobItems(items), "total": len(items)})
}

func (a *App) handleAPIAdminJobDetail(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.asyncJobSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Async job service is unavailable")
		return
	}

	jobID, err := parseUintURLParam(r, "jobID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_job_id", "Invalid async job id")
		return
	}
	item, err := a.asyncJobSvc.GetByID(r.Context(), jobID)
	if err != nil {
		if errors.Is(err, services.ErrAsyncJobNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "job_not_found", "Async job not found")
			return
		}
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load async job")
		return
	}
	if !canViewAsyncJobDetail(*user, item) {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"item": resultToAPIAdminAsyncJobItem(item)})
}

func (a *App) handleAPIAdminJobRetry(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.asyncJobSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Async job service is unavailable")
		return
	}

	jobID, err := parseUintURLParam(r, "jobID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_job_id", "Invalid async job id")
		return
	}
	item, err := a.asyncJobSvc.GetByID(r.Context(), jobID)
	if err != nil {
		if errors.Is(err, services.ErrAsyncJobNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "job_not_found", "Async job not found")
			return
		}
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load async job")
		return
	}
	if !canViewAsyncJobDetail(*user, item) {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}

	updated, retryErr := a.retryAsyncJob(r.Context(), item, user.ID, time.Now().UTC())
	if retryErr != nil {
		if errors.Is(retryErr, services.ErrAsyncJobInvalidTransition) {
			writeAPIError(w, r, http.StatusBadRequest, "invalid_transition", "Invalid async job state transition")
			return
		}
		writeAPIError(w, r, http.StatusInternalServerError, "retry_failed", "Failed to retry async job")
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
		writeAPIError(w, r, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}
	if a.asyncJobSvc == nil {
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Async job service is unavailable")
		return
	}

	jobID, err := parseUintURLParam(r, "jobID")
	if err != nil {
		writeAPIError(w, r, http.StatusBadRequest, "invalid_job_id", "Invalid async job id")
		return
	}
	item, err := a.asyncJobSvc.GetByID(r.Context(), jobID)
	if err != nil {
		if errors.Is(err, services.ErrAsyncJobNotFound) {
			writeAPIError(w, r, http.StatusNotFound, "job_not_found", "Async job not found")
			return
		}
		writeAPIError(w, r, http.StatusInternalServerError, "query_failed", "Failed to load async job")
		return
	}
	if !canViewAsyncJobDetail(*user, item) {
		writeAPIError(w, r, http.StatusForbidden, "permission_denied", "Permission denied")
		return
	}

	updated, cancelErr := a.cancelAsyncJob(r.Context(), item, user.ID, time.Now().UTC())
	if cancelErr != nil {
		if errors.Is(cancelErr, services.ErrAsyncJobInvalidTransition) {
			writeAPIError(w, r, http.StatusBadRequest, "invalid_transition", "Invalid async job state transition")
			return
		}
		writeAPIError(w, r, http.StatusInternalServerError, "cancel_failed", "Failed to cancel async job")
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
