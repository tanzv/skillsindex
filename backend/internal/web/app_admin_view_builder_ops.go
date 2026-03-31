package web

import (
	"net/http"
	"strconv"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

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
