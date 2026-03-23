package web

import (
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/catalog"
	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) buildAdminViewData(
	r *http.Request,
	user *models.User,
	adminSection string,
	routeContext adminRouteContext,
) (ViewData, int, error) {
	view := buildAdminBaseViewData(r, user, adminSection, routeContext)

	scopeCounts, err := a.skillService.CountDashboardSkills(r.Context(), user.ID, user.CanViewAllSkills())
	if err != nil {
		return ViewData{}, http.StatusInternalServerError, newAdminViewBuildError(
			http.StatusInternalServerError,
			"Failed to query dashboard counts",
			err,
		)
	}
	applyAdminScopeCounts(&view, user, scopeCounts)

	if adminSection == "records" {
		skills, loadErr := a.loadAdminRecordSkills(r, user)
		if loadErr != nil {
			return ViewData{}, http.StatusInternalServerError, newAdminViewBuildError(
				http.StatusInternalServerError,
				"Failed to list skills",
				loadErr,
			)
		}
		view.UserSkills = skills
	}

	a.populateAdminSyncRecords(&view, r, user, adminSection, routeContext)
	a.populateAdminOverview(&view, r, adminSection)
	a.populateAdminAuditLogs(&view, r, user, adminSection, routeContext)
	a.populateAdminUsers(&view, r, user, adminSection, routeContext)
	a.populateAdminDingTalkGrant(&view, r, user, adminSection)
	a.populateAdminAPIKeys(&view, r, user, adminSection)
	a.populateAdminIntegrations(&view, r, adminSection, routeContext)
	a.populateAdminIncidents(&view, r, adminSection, routeContext)
	a.populateAdminModeration(&view, r, adminSection)
	a.populateAdminOps(&view, r, adminSection, routeContext)

	return view, http.StatusOK, nil
}

func buildAdminBaseViewData(
	r *http.Request,
	user *models.User,
	adminSection string,
	routeContext adminRouteContext,
) ViewData {
	apiKeyStatusFilter := strings.TrimSpace(r.URL.Query().Get("api_key_status"))
	if apiKeyStatusFilter == "" {
		apiKeyStatusFilter = "all"
	}

	return ViewData{
		Page:                  adminPageName(adminSection),
		Title:                 "Admin Console",
		AdminSection:          adminSection,
		AdminAccessMode:       routeContext.AccessMode,
		AdminIngestionSource:  routeContext.IngestionSource,
		AdminRecordsMode:      routeContext.RecordsMode,
		AdminIntegrationsMode: routeContext.IntegrationsMode,
		AdminIncidentsMode:    routeContext.IncidentsMode,
		AdminIncidentID:       routeContext.IncidentID,
		AdminModerationStatus: normalizeModerationListStatus(r.URL.Query().Get("status")),
		AdminOpsMode:          routeContext.OpsMode,
		AdminShowOwner:        user.CanViewAllSkills(),
		AdminCanManageUsers:   user.CanManageUsers(),
		AdminShowAPIKeyOwner:  user.CanManageUsers(),
		AdminAPIKeyOwner:      strings.TrimSpace(r.URL.Query().Get("api_key_owner")),
		AdminAPIKeyStatus:     apiKeyStatusFilter,
		RoleChoices: []models.UserRole{
			models.RoleViewer,
			models.RoleMember,
			models.RoleAdmin,
			models.RoleSuperAdmin,
		},
		Message:           strings.TrimSpace(r.URL.Query().Get("msg")),
		Error:             strings.TrimSpace(r.URL.Query().Get("err")),
		Categories:        []CategoryCard{},
		CatalogCategories: catalog.Categories(),
	}
}

func applyAdminScopeCounts(view *ViewData, user *models.User, counts services.DashboardSkillCounts) {
	view.AdminShowOwner = user.CanViewAllSkills()
	view.AdminTotalCount = int(counts.Total)
	view.AdminPublicCount = int(counts.Public)
	view.AdminPrivateCount = int(counts.Private)
	view.AdminSyncableCount = int(counts.Syncable)
}

func (a *App) loadAdminRecordSkills(r *http.Request, user *models.User) ([]models.Skill, error) {
	if user.CanViewAllSkills() {
		return a.skillService.ListAllSkills(r.Context())
	}
	return a.skillService.ListSkillsByOwner(r.Context(), user.ID)
}

func adminScopedOwnerFilter(user *models.User) *uint {
	if user == nil || user.CanViewAllSkills() {
		return nil
	}
	return &user.ID
}

func logAdminLoadWarning(component string, err error) {
	if err == nil {
		return
	}
	log.Printf("admin view load warning component=%s err=%v", component, err)
}

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

func (a *App) populateAdminAuditLogs(view *ViewData, r *http.Request, user *models.User, adminSection string, routeContext adminRouteContext) {
	if a.auditService == nil {
		return
	}

	switch {
	case adminSection == "audit" || adminSection == "incidents" || adminSection == "integrations":
		input := services.ListAuditInput{Limit: 120}
		if !user.CanViewAllSkills() {
			input.ActorUserID = user.ID
		}
		logs, err := a.auditService.ListRecent(r.Context(), input)
		logAdminLoadWarning("audit_logs", err)
		view.AuditLogs = logs
	case adminSection == "ops" && routeContext.OpsMode == "audit-export":
		logs, err := a.auditService.ListRecent(r.Context(), services.ListAuditInput{Limit: 180})
		logAdminLoadWarning("ops_audit_export", err)
		view.AuditLogs = logs
	}
}

func (a *App) populateAdminUsers(view *ViewData, r *http.Request, user *models.User, adminSection string, routeContext adminRouteContext) {
	if a.authService == nil {
		return
	}

	switch {
	case adminSection == "incidents":
		if user.CanViewAllSkills() {
			users, err := a.authService.ListUsers(r.Context())
			logAdminLoadWarning("incident_users", err)
			view.AdminUsers = users
			return
		}
		view.AdminUsers = append(view.AdminUsers, *user)
	case (adminSection == "users" ||
		(adminSection == "access" && strings.HasPrefix(routeContext.AccessMode, "accounts")) ||
		(adminSection == "access" && strings.HasPrefix(routeContext.AccessMode, "roles"))) && user.CanManageUsers():
		users, err := a.authService.ListUsers(r.Context())
		logAdminLoadWarning("admin_users", err)
		view.AdminUsers = users
	}
}

func (a *App) populateAdminDingTalkGrant(view *ViewData, r *http.Request, user *models.User, adminSection string) {
	if adminSection != "integrations" || a.oauthGrantService == nil {
		return
	}

	grant, err := a.oauthGrantService.GetGrantByUserProvider(r.Context(), user.ID, models.OAuthProviderDingTalk)
	logAdminLoadWarning("dingtalk_grant", err)
	if err == nil {
		view.DingTalkGrant = &grant
	}
}

func (a *App) populateAdminAPIKeys(view *ViewData, r *http.Request, user *models.User, adminSection string) {
	if adminSection != "apikeys" || a.apiKeyService == nil {
		return
	}

	if view.AdminShowAPIKeyOwner {
		apiKeys, err := a.apiKeyService.ListForAdmin(r.Context(), services.ListAPIKeysInput{
			OwnerUsername: view.AdminAPIKeyOwner,
			Status:        view.AdminAPIKeyStatus,
			Limit:         400,
		})
		logAdminLoadWarning("admin_api_keys", err)
		view.AdminAPIKeys = apiKeys
		return
	}

	apiKeys, err := a.apiKeyService.ListByUser(r.Context(), user.ID)
	logAdminLoadWarning("user_api_keys", err)
	view.AdminAPIKeys = apiKeys
}

func (a *App) populateAdminIntegrations(view *ViewData, r *http.Request, adminSection string, routeContext adminRouteContext) {
	if adminSection != "integrations" || a.integrationSvc == nil {
		return
	}

	connectors, err := a.integrationSvc.ListConnectors(r.Context(), services.ListConnectorsInput{
		IncludeDisabled: true,
		Limit:           160,
	})
	logAdminLoadWarning("integration_connectors", err)
	view.AdminConnectors = connectors

	if routeContext.IntegrationsMode != "webhooks" {
		return
	}

	webhookLogs, loadErr := a.integrationSvc.ListWebhookLogs(r.Context(), services.ListWebhookLogsInput{Limit: 180})
	logAdminLoadWarning("integration_webhook_logs", loadErr)
	view.AdminWebhookLogs = webhookLogs
}

func (a *App) populateAdminIncidents(view *ViewData, r *http.Request, adminSection string, routeContext adminRouteContext) {
	if adminSection != "incidents" || a.incidentSvc == nil {
		return
	}

	incidents, err := a.incidentSvc.ListIncidents(r.Context(), services.ListIncidentsInput{Limit: 160})
	logAdminLoadWarning("incidents", err)
	view.AdminIncidents = incidents

	if routeContext.IncidentID == "" {
		return
	}

	incidentIDValue, parseErr := strconv.ParseUint(routeContext.IncidentID, 10, 64)
	if parseErr != nil || incidentIDValue == 0 {
		return
	}

	item, loadErr := a.incidentSvc.GetIncidentByID(r.Context(), uint(incidentIDValue))
	logAdminLoadWarning("incident_detail", loadErr)
	if loadErr == nil {
		view.AdminIncident = &item
	}
}

func (a *App) populateAdminModeration(view *ViewData, r *http.Request, adminSection string) {
	if adminSection != "moderation" || a.moderationSvc == nil {
		return
	}

	listInput := services.ListModerationCasesInput{Limit: 180}
	switch view.AdminModerationStatus {
	case string(models.ModerationStatusOpen):
		listInput.Status = models.ModerationStatusOpen
	case string(models.ModerationStatusResolved):
		listInput.Status = models.ModerationStatusResolved
	case string(models.ModerationStatusRejected):
		listInput.Status = models.ModerationStatusRejected
	}

	cases, err := a.moderationSvc.ListCases(r.Context(), listInput)
	logAdminLoadWarning("moderation_cases", err)
	view.AdminModerationCases = cases
}

func (a *App) populateAdminOps(view *ViewData, r *http.Request, adminSection string, routeContext adminRouteContext) {
	if adminSection != "ops" || a.opsService == nil {
		return
	}

	now := time.Now().UTC()
	metrics, metricsErr := a.opsService.BuildMetrics(r.Context(), now)
	logAdminLoadWarning("ops_metrics", metricsErr)
	view.AdminOpsMetrics = metrics

	alerts, alertsErr := a.opsService.BuildAlerts(r.Context(), now)
	logAdminLoadWarning("ops_alerts", alertsErr)
	view.AdminOpsAlerts = alerts

	switch routeContext.OpsMode {
	case "release-gates":
		gates, err := a.opsService.BuildReleaseGates(r.Context(), now)
		logAdminLoadWarning("ops_release_gates", err)
		view.AdminOpsReleaseGates = gates
	case "recovery-drills":
		drills, err := a.opsService.ListRecoveryDrills(r.Context(), 80)
		logAdminLoadWarning("ops_recovery_drills", err)
		view.AdminOpsRecoveryDrills = drills
	case "releases":
		releases, err := a.opsService.ListReleases(r.Context(), 80)
		logAdminLoadWarning("ops_releases", err)
		view.AdminOpsReleases = releases
	case "change-approvals":
		approvals, err := a.opsService.ListChangeApprovals(r.Context(), 80)
		logAdminLoadWarning("ops_change_approvals", err)
		view.AdminOpsChangeApprovals = approvals
	case "backup-plans":
		plans, err := a.opsService.ListBackupPlans(r.Context(), 80)
		logAdminLoadWarning("ops_backup_plans", err)
		view.AdminOpsBackupPlans = plans
	case "backup-runs":
		runs, err := a.opsService.ListBackupRuns(r.Context(), 80)
		logAdminLoadWarning("ops_backup_runs", err)
		view.AdminOpsBackupRuns = runs
	}
}
