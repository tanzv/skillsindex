package web

import (
	"errors"
	"net/http"
	"net/url"
	"strconv"
	"time"

	"skillsindex/internal/services"
)

func (a *App) handleAdminJobs(w http.ResponseWriter, r *http.Request) {
	target := "/admin/records/sync-jobs"
	if encoded := r.URL.Query().Encode(); encoded != "" {
		target += "?" + encoded
	}
	http.Redirect(w, r, target, http.StatusSeeOther)
}

func (a *App) handleAdminJob(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.asyncJobSvc == nil {
		redirectAdminPath(w, r, "/admin/records/sync-jobs", "", "Async job service unavailable")
		return
	}

	jobID, err := parseUintURLParam(r, "jobID")
	if err != nil {
		redirectAdminPath(w, r, "/admin/records/sync-jobs", "", "Invalid job id")
		return
	}
	job, err := a.asyncJobSvc.GetByID(r.Context(), jobID)
	if err != nil {
		if errors.Is(err, services.ErrAsyncJobNotFound) {
			redirectAdminPath(w, r, "/admin/records/sync-jobs", "", "Job not found")
			return
		}
		redirectAdminPath(w, r, "/admin/records/sync-jobs", "", "Failed to load job")
		return
	}
	if !canViewAsyncJobDetail(*user, job) {
		redirectAdminPath(w, r, "/admin/records/sync-jobs", "", "Permission denied")
		return
	}
	redirectAdminPath(
		w,
		r,
		"/admin/records/sync-jobs?job_id="+url.QueryEscape(strconv.FormatUint(uint64(jobID), 10)),
		"",
		"",
	)
}

func (a *App) handleAdminJobRetry(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.asyncJobSvc == nil {
		redirectAdminPath(w, r, "/admin/jobs", "", "Async job service unavailable")
		return
	}

	jobID, err := parseUintURLParam(r, "jobID")
	if err != nil {
		redirectAdminPath(w, r, "/admin/jobs", "", "Invalid job id")
		return
	}
	job, err := a.asyncJobSvc.GetByID(r.Context(), jobID)
	if err != nil {
		if errors.Is(err, services.ErrAsyncJobNotFound) {
			redirectAdminPath(w, r, "/admin/jobs", "", "Job not found")
			return
		}
		redirectAdminPath(w, r, "/admin/jobs", "", "Failed to load job")
		return
	}
	if !canViewAsyncJobDetail(*user, job) {
		redirectAdminPath(w, r, "/admin/jobs/"+strconv.FormatUint(uint64(jobID), 10), "", "Permission denied")
		return
	}

	retried, retryErr := a.asyncJobSvc.Retry(r.Context(), jobID, user.ID, time.Now().UTC())
	if retryErr != nil {
		redirectAdminPath(w, r, "/admin/jobs/"+strconv.FormatUint(uint64(jobID), 10), "", "Failed to retry job")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "admin_async_job_retry",
		TargetType: "async_job",
		TargetID:   retried.ID,
		Summary:    "Retried async orchestration job",
		Details: auditDetailsJSON(map[string]string{
			"job_type": string(retried.JobType),
			"status":   string(retried.Status),
			"attempt":  strconv.Itoa(retried.Attempt),
		}),
	})

	redirectAdminPath(w, r, "/admin/jobs/"+strconv.FormatUint(uint64(jobID), 10), "Job moved back to pending", "")
}

func (a *App) handleAdminJobCancel(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	if a.asyncJobSvc == nil {
		redirectAdminPath(w, r, "/admin/jobs", "", "Async job service unavailable")
		return
	}

	jobID, err := parseUintURLParam(r, "jobID")
	if err != nil {
		redirectAdminPath(w, r, "/admin/jobs", "", "Invalid job id")
		return
	}
	job, err := a.asyncJobSvc.GetByID(r.Context(), jobID)
	if err != nil {
		if errors.Is(err, services.ErrAsyncJobNotFound) {
			redirectAdminPath(w, r, "/admin/jobs", "", "Job not found")
			return
		}
		redirectAdminPath(w, r, "/admin/jobs", "", "Failed to load job")
		return
	}
	if !canViewAsyncJobDetail(*user, job) {
		redirectAdminPath(w, r, "/admin/jobs/"+strconv.FormatUint(uint64(jobID), 10), "", "Permission denied")
		return
	}

	canceled, cancelErr := a.asyncJobSvc.Cancel(r.Context(), jobID, user.ID, time.Now().UTC())
	if cancelErr != nil {
		redirectAdminPath(w, r, "/admin/jobs/"+strconv.FormatUint(uint64(jobID), 10), "", "Failed to cancel job")
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "admin_async_job_cancel",
		TargetType: "async_job",
		TargetID:   canceled.ID,
		Summary:    "Canceled async orchestration job",
		Details: auditDetailsJSON(map[string]string{
			"job_type": string(canceled.JobType),
			"status":   string(canceled.Status),
		}),
	})

	redirectAdminPath(w, r, "/admin/jobs/"+strconv.FormatUint(uint64(jobID), 10), "Job canceled", "")
}
