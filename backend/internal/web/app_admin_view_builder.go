package web

import (
	"log"
	"net/http"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func (a *App) buildAdminViewData(
	r *http.Request,
	user *models.User,
	adminSection string,
	routeContext adminRouteContext,
) (ViewData, int, error) {
	view := a.buildAdminBaseViewData(r, user, adminSection, routeContext)

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

func (a *App) buildAdminBaseViewData(
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
		CatalogCategories: a.marketplaceCatalogCategories(r.Context()),
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
