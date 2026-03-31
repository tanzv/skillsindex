package web

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) populateAdminSyncRecords(view *ViewData, r *http.Request, user *models.User, adminSection string, routeContext adminRouteContext) {
	if adminSection != "records" || routeContext.RecordsMode != "sync-jobs" {
		return
	}

	view.AdminSyncPolicy = services.RepositorySyncPolicy{
		Enabled:   false,
		Interval:  30 * time.Minute,
		Timeout:   10 * time.Minute,
		BatchSize: 20,
	}

	ownerFilter := adminScopedOwnerFilter(user)
	asyncJobDetailID := strings.TrimSpace(r.URL.Query().Get("job_id"))
	syncRunDetailID := strings.TrimSpace(r.URL.Query().Get("run_id"))

	if a.asyncJobSvc != nil {
		asyncJobs, err := a.asyncJobSvc.List(r.Context(), services.ListAsyncJobsInput{
			OwnerUserID: ownerFilter,
			Limit:       180,
		})
		logAdminLoadWarning("async_jobs", err)
		view.AdminAsyncJobs = asyncJobs

		if asyncJobDetailID != "" {
			jobID, parseErr := strconv.ParseUint(asyncJobDetailID, 10, 64)
			if parseErr == nil && jobID > 0 {
				job, getErr := a.asyncJobSvc.GetByID(r.Context(), uint(jobID))
				if getErr == nil && canViewAsyncJobDetail(*user, job) {
					view.AdminAsyncJobDetail = &job
				} else {
					logAdminLoadWarning("async_job_detail", getErr)
				}
			}
		}
	}

	if a.syncJobSvc != nil {
		syncRuns, err := a.syncJobSvc.ListRuns(r.Context(), services.ListSyncRunsInput{
			OwnerUserID: ownerFilter,
			Limit:       180,
		})
		logAdminLoadWarning("sync_runs", err)
		view.AdminSyncRuns = syncRuns

		if syncRunDetailID != "" {
			runID, parseErr := strconv.ParseUint(syncRunDetailID, 10, 64)
			if parseErr == nil && runID > 0 {
				run, getErr := a.syncJobSvc.GetRunByID(r.Context(), uint(runID))
				if getErr == nil && canViewSyncRunDetail(*user, run) {
					view.AdminSyncRunDetail = &run
				} else {
					logAdminLoadWarning("sync_run_detail", getErr)
				}
			}
		}
	}

	if a.syncPolicyService != nil {
		policy, err := a.syncPolicyService.Get(r.Context())
		logAdminLoadWarning("sync_policy", err)
		if err == nil {
			view.AdminSyncPolicy = policy
		}
	}
}

func (a *App) populateAdminOverview(view *ViewData, r *http.Request, adminSection string) {
	if adminSection != "overview" {
		return
	}

	featured, err := a.skillService.SearchPublicSkills(r.Context(), services.PublicSearchInput{
		SortBy: "stars",
		Page:   1,
		Limit:  8,
	})
	logAdminLoadWarning("overview_featured", err)
	view.FeaturedSkills = featured.Items

	categories, loadErr := a.loadCategoryCards(r.Context(), "")
	logAdminLoadWarning("overview_categories", loadErr)
	view.Categories = categories
}
