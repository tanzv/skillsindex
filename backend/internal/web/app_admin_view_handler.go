package web

import (
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/catalog"
	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
)

func (a *App) handleAdmin(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}
	rawSection := firstNonEmpty(chi.URLParam(r, "section"), r.URL.Query().Get("section"))
	routeContext := resolveAdminRouteContext(
		rawSection,
		firstNonEmpty(chi.URLParam(r, "subsection"), r.URL.Query().Get("subsection")),
		firstNonEmpty(chi.URLParam(r, "detail"), r.URL.Query().Get("detail")),
		firstNonEmpty(chi.URLParam(r, "extra"), r.URL.Query().Get("extra")),
	)
	adminSection := routeContext.Section
	if clean := strings.ToLower(strings.TrimSpace(rawSection)); clean != "" && clean != "overview" && adminSection == "overview" {
		http.Redirect(w, r, "/admin", http.StatusSeeOther)
		return
	}
	if adminSection == "users" && !user.CanManageUsers() {
		http.Redirect(w, r, "/admin?err="+url.QueryEscape("Permission denied"), http.StatusSeeOther)
		return
	}
	if adminSection == "moderation" && !user.CanViewAllSkills() {
		http.Redirect(w, r, "/admin?err="+url.QueryEscape("Permission denied"), http.StatusSeeOther)
		return
	}
	if adminSection == "ops" && !user.CanViewAllSkills() {
		http.Redirect(w, r, "/admin?err="+url.QueryEscape("Permission denied"), http.StatusSeeOther)
		return
	}
	if adminSection == "access" && (routeContext.AccessMode == "accounts-list" || routeContext.AccessMode == "accounts-new" || routeContext.AccessMode == "roles-list" || routeContext.AccessMode == "roles-new") && !user.CanManageUsers() {
		http.Redirect(w, r, "/admin/access?err="+url.QueryEscape("Permission denied"), http.StatusSeeOther)
		return
	}

	scopeCounts, err := a.skillService.CountDashboardSkills(r.Context(), user.ID, user.CanViewAllSkills())
	if err != nil {
		a.renderWithStatus(w, r, http.StatusInternalServerError, ViewData{Page: adminPageName(adminSection), Title: "Admin Console", Error: "Failed to query dashboard counts"})
		return
	}

	skills := make([]models.Skill, 0)
	if adminSection == "records" {
		if user.CanViewAllSkills() {
			skills, err = a.skillService.ListAllSkills(r.Context())
		} else {
			skills, err = a.skillService.ListSkillsByOwner(r.Context(), user.ID)
		}
		if err != nil {
			a.renderWithStatus(w, r, http.StatusInternalServerError, ViewData{Page: adminPageName(adminSection), Title: "Admin Console", Error: "Failed to list skills"})
			return
		}
	}
	syncRuns := make([]models.SyncJobRun, 0)
	asyncJobs := make([]models.AsyncJob, 0)
	syncPolicy := services.RepositorySyncPolicy{
		Enabled:   false,
		Interval:  30 * time.Minute,
		Timeout:   10 * time.Minute,
		BatchSize: 20,
	}
	var syncRunDetail *models.SyncJobRun
	var asyncJobDetail *models.AsyncJob
	syncRunDetailID := strings.TrimSpace(r.URL.Query().Get("run_id"))
	asyncJobDetailID := strings.TrimSpace(r.URL.Query().Get("job_id"))
	if adminSection == "records" && routeContext.RecordsMode == "sync-jobs" && a.asyncJobSvc != nil {
		var ownerFilter *uint
		if !user.CanViewAllSkills() {
			ownerFilter = &user.ID
		}
		asyncJobs, _ = a.asyncJobSvc.List(r.Context(), services.ListAsyncJobsInput{
			OwnerUserID: ownerFilter,
			Limit:       180,
		})
		if asyncJobDetailID != "" {
			if jobID, parseErr := strconv.ParseUint(asyncJobDetailID, 10, 64); parseErr == nil && jobID > 0 {
				job, getErr := a.asyncJobSvc.GetByID(r.Context(), uint(jobID))
				if getErr == nil && canViewAsyncJobDetail(*user, job) {
					asyncJobDetail = &job
				}
			}
		}
	}
	if adminSection == "records" && routeContext.RecordsMode == "sync-jobs" && a.syncJobSvc != nil {
		var ownerFilter *uint
		if !user.CanViewAllSkills() {
			ownerFilter = &user.ID
		}
		syncRuns, _ = a.syncJobSvc.ListRuns(r.Context(), services.ListSyncRunsInput{
			OwnerUserID: ownerFilter,
			Limit:       180,
		})
		if syncRunDetailID != "" {
			if runID, parseErr := strconv.ParseUint(syncRunDetailID, 10, 64); parseErr == nil && runID > 0 {
				run, getErr := a.syncJobSvc.GetRunByID(r.Context(), uint(runID))
				if getErr == nil && canViewSyncRunDetail(*user, run) {
					syncRunDetail = &run
				}
			}
		}
	}
	if adminSection == "records" && routeContext.RecordsMode == "sync-jobs" && a.syncPolicyService != nil {
		policy, policyErr := a.syncPolicyService.Get(r.Context())
		if policyErr == nil {
			syncPolicy = policy
		}
	}

	featured := services.PublicSearchResult{Items: []models.Skill{}}
	if adminSection == "overview" {
		featured, _ = a.skillService.SearchPublicSkills(r.Context(), services.PublicSearchInput{
			SortBy: "stars",
			Page:   1,
			Limit:  8,
		})
	}
	categories := make([]CategoryCard, 0)
	if adminSection == "overview" {
		categories, _ = a.loadCategoryCards(r.Context(), "")
	}
	auditLogs := make([]models.AuditLog, 0)
	if (adminSection == "audit" || adminSection == "incidents" || adminSection == "integrations") && a.auditService != nil {
		logInput := services.ListAuditInput{Limit: 120}
		if !user.CanViewAllSkills() {
			logInput.ActorUserID = user.ID
		}
		auditLogs, _ = a.auditService.ListRecent(r.Context(), logInput)
	}
	if adminSection == "ops" && a.auditService != nil && routeContext.OpsMode == "audit-export" {
		logInput := services.ListAuditInput{Limit: 180}
		auditLogs, _ = a.auditService.ListRecent(r.Context(), logInput)
	}

	adminUsers := make([]models.User, 0)
	if adminSection == "incidents" {
		if user.CanViewAllSkills() {
			adminUsers, _ = a.authService.ListUsers(r.Context())
		} else {
			adminUsers = append(adminUsers, *user)
		}
	}
	if (adminSection == "users" || (adminSection == "access" && strings.HasPrefix(routeContext.AccessMode, "accounts")) || (adminSection == "access" && strings.HasPrefix(routeContext.AccessMode, "roles"))) && user.CanManageUsers() {
		adminUsers, _ = a.authService.ListUsers(r.Context())
	}
	var dingTalkGrant *models.OAuthGrant
	if adminSection == "integrations" && a.oauthGrantService != nil {
		grant, grantErr := a.oauthGrantService.GetGrantByUserProvider(r.Context(), user.ID, models.OAuthProviderDingTalk)
		if grantErr == nil {
			dingTalkGrant = &grant
		}
	}
	apiKeys := make([]models.APIKey, 0)
	apiKeyOwnerFilter := strings.TrimSpace(r.URL.Query().Get("api_key_owner"))
	apiKeyStatusFilter := strings.TrimSpace(r.URL.Query().Get("api_key_status"))
	if apiKeyStatusFilter == "" {
		apiKeyStatusFilter = "all"
	}
	showAPIKeyOwner := user.CanManageUsers()
	if adminSection == "apikeys" && a.apiKeyService != nil {
		if showAPIKeyOwner {
			apiKeys, _ = a.apiKeyService.ListForAdmin(r.Context(), services.ListAPIKeysInput{
				OwnerUsername: apiKeyOwnerFilter,
				Status:        apiKeyStatusFilter,
				Limit:         400,
			})
		} else {
			apiKeys, _ = a.apiKeyService.ListByUser(r.Context(), user.ID)
		}
	}

	connectors := make([]models.IntegrationConnector, 0)
	webhookLogs := make([]models.WebhookDeliveryLog, 0)
	if adminSection == "integrations" && a.integrationSvc != nil {
		connectors, _ = a.integrationSvc.ListConnectors(r.Context(), services.ListConnectorsInput{
			IncludeDisabled: true,
			Limit:           160,
		})
		if routeContext.IntegrationsMode == "webhooks" {
			webhookLogs, _ = a.integrationSvc.ListWebhookLogs(r.Context(), services.ListWebhookLogsInput{
				Limit: 180,
			})
		}
	}

	incidents := make([]models.Incident, 0)
	var activeIncident *models.Incident
	if adminSection == "incidents" && a.incidentSvc != nil {
		incidents, _ = a.incidentSvc.ListIncidents(r.Context(), services.ListIncidentsInput{Limit: 160})
		if routeContext.IncidentID != "" {
			incidentIDValue, parseErr := strconv.ParseUint(routeContext.IncidentID, 10, 64)
			if parseErr == nil && incidentIDValue > 0 {
				item, incidentErr := a.incidentSvc.GetIncidentByID(r.Context(), uint(incidentIDValue))
				if incidentErr == nil {
					activeIncident = &item
				}
			}
		}
	}
	moderationStatusFilter := normalizeModerationListStatus(r.URL.Query().Get("status"))
	moderationCases := make([]models.ModerationCase, 0)
	if adminSection == "moderation" && a.moderationSvc != nil {
		listInput := services.ListModerationCasesInput{
			Limit: 180,
		}
		switch moderationStatusFilter {
		case string(models.ModerationStatusOpen):
			listInput.Status = models.ModerationStatusOpen
		case string(models.ModerationStatusResolved):
			listInput.Status = models.ModerationStatusResolved
		case string(models.ModerationStatusRejected):
			listInput.Status = models.ModerationStatusRejected
		}
		moderationCases, _ = a.moderationSvc.ListCases(r.Context(), listInput)
	}
	opsMetrics := services.OpsMetrics{}
	opsAlerts := make([]services.OpsAlert, 0)
	opsReleaseGates := services.OpsReleaseGateSnapshot{}
	opsRecoveryDrills := make([]services.OpsRecoveryDrillRecord, 0)
	opsReleases := make([]services.OpsReleaseRecord, 0)
	opsChangeApprovals := make([]services.OpsChangeApprovalRecord, 0)
	opsBackupPlans := make([]services.OpsBackupPlanRecord, 0)
	opsBackupRuns := make([]services.OpsBackupRunRecord, 0)
	if adminSection == "ops" && a.opsService != nil {
		opsMetrics, _ = a.opsService.BuildMetrics(r.Context(), time.Now().UTC())
		opsAlerts, _ = a.opsService.BuildAlerts(r.Context(), time.Now().UTC())
		if routeContext.OpsMode == "release-gates" {
			opsReleaseGates, _ = a.opsService.BuildReleaseGates(r.Context(), time.Now().UTC())
		}
		if routeContext.OpsMode == "recovery-drills" {
			opsRecoveryDrills, _ = a.opsService.ListRecoveryDrills(r.Context(), 80)
		}
		if routeContext.OpsMode == "releases" {
			opsReleases, _ = a.opsService.ListReleases(r.Context(), 80)
		}
		if routeContext.OpsMode == "change-approvals" {
			opsChangeApprovals, _ = a.opsService.ListChangeApprovals(r.Context(), 80)
		}
		if routeContext.OpsMode == "backup-plans" {
			opsBackupPlans, _ = a.opsService.ListBackupPlans(r.Context(), 80)
		}
		if routeContext.OpsMode == "backup-runs" {
			opsBackupRuns, _ = a.opsService.ListBackupRuns(r.Context(), 80)
		}
	}

	a.render(w, r, ViewData{
		Page:                  adminPageName(adminSection),
		Title:                 "Admin Console",
		AdminSection:          adminSection,
		AdminAccessMode:       routeContext.AccessMode,
		AdminIngestionSource:  routeContext.IngestionSource,
		AdminRecordsMode:      routeContext.RecordsMode,
		AdminIntegrationsMode: routeContext.IntegrationsMode,
		AdminIncidentsMode:    routeContext.IncidentsMode,
		AdminIncidentID:       routeContext.IncidentID,
		AdminModerationStatus: moderationStatusFilter,
		AdminOpsMode:          routeContext.OpsMode,
		DingTalkGrant:         dingTalkGrant,
		UserSkills:            skills,
		AdminUsers:            adminUsers,
		AdminShowOwner:        user.CanViewAllSkills(),
		AdminTotalCount:       int(scopeCounts.Total),
		AdminCanManageUsers:   user.CanManageUsers(),
		AuditLogs:             auditLogs,
		RoleChoices: []models.UserRole{
			models.RoleViewer,
			models.RoleMember,
			models.RoleAdmin,
			models.RoleSuperAdmin,
		},
		FeaturedSkills:          featured.Items,
		AdminPublicCount:        int(scopeCounts.Public),
		AdminPrivateCount:       int(scopeCounts.Private),
		AdminSyncableCount:      int(scopeCounts.Syncable),
		AdminShowAPIKeyOwner:    showAPIKeyOwner,
		AdminAPIKeys:            apiKeys,
		AdminAPIKeyOwner:        apiKeyOwnerFilter,
		AdminAPIKeyStatus:       apiKeyStatusFilter,
		AdminConnectors:         connectors,
		AdminWebhookLogs:        webhookLogs,
		AdminIncidents:          incidents,
		AdminIncident:           activeIncident,
		AdminModerationCases:    moderationCases,
		AdminOpsMetrics:         opsMetrics,
		AdminOpsAlerts:          opsAlerts,
		AdminOpsReleaseGates:    opsReleaseGates,
		AdminOpsRecoveryDrills:  opsRecoveryDrills,
		AdminOpsReleases:        opsReleases,
		AdminOpsChangeApprovals: opsChangeApprovals,
		AdminOpsBackupPlans:     opsBackupPlans,
		AdminOpsBackupRuns:      opsBackupRuns,
		AdminAsyncJobs:          asyncJobs,
		AdminAsyncJobDetail:     asyncJobDetail,
		AdminSyncRuns:           syncRuns,
		AdminSyncRunDetail:      syncRunDetail,
		AdminSyncPolicy:         syncPolicy,
		Message:                 strings.TrimSpace(r.URL.Query().Get("msg")),
		Error:                   strings.TrimSpace(r.URL.Query().Get("err")),
		Categories:              categories,
		CatalogCategories:       catalog.Categories(),
	})
}
