package bootstrap

import (
	"context"
	"errors"
	"fmt"
	"log"
	"path/filepath"

	"skillsindex/internal/config"
	"skillsindex/internal/services"
	"skillsindex/internal/web"

	"gorm.io/gorm"
)

type runtimeServices struct {
	authService               *services.AuthService
	settingsService           *services.SettingsService
	repoSyncPolicyService     *services.RepositorySyncPolicyService
	syncPolicyRecordService   *services.SyncPolicyService
	sessionService            *services.SessionService
	userSessionService        *services.UserSessionService
	skillService              *services.SkillService
	apiKeyService             *services.APIKeyService
	interactionService        *services.SkillInteractionService
	auditService              *services.AuditService
	integrationService        *services.IntegrationService
	incidentService           *services.IncidentService
	moderationService         *services.ModerationService
	opsService                *services.OpsService
	asyncJobService           *services.AsyncJobService
	syncJobService            *services.SyncJobService
	syncGovernanceService     *services.SyncGovernanceService
	skillVersionService       *services.SkillVersionService
	organizationService       *services.OrganizationService
	oauthGrantService         *services.OAuthGrantService
	dingTalkService           *services.DingTalkService
	uploadService             *services.UploadService
	repositoryService         *services.RepositorySyncService
	repositorySyncCoordinator *services.RepositorySyncCoordinator
	skillMPService            *services.SkillMPService
	apiSpecRegistryService    *services.APISpecRegistryService
	apiPublishService         *services.APIPublishService
	apiPolicyService          *services.APIPolicyService
	apiMockService            *services.APIMockService
	apiExportService          *services.APIExportService
	apiContractRuntimeService *services.APIContractRuntimeService
	scheduler                 *services.RepositorySyncScheduler
}

func buildRuntimeServices(
	ctx context.Context,
	runtimeConfig config.Config,
	database *gorm.DB,
	authService *services.AuthService,
	settingsService *services.SettingsService,
	repoSyncPolicyService *services.RepositorySyncPolicyService,
	syncPolicyRecordService *services.SyncPolicyService,
) (runtimeServices, error) {
	sessionService := services.NewSessionService(runtimeConfig.SessionSecret, runtimeConfig.SessionCookieSecure)
	userSessionService := services.NewUserSessionService(database)
	skillService := services.NewSkillService(database)
	apiKeyService := services.NewAPIKeyService(database)
	interactionService := services.NewSkillInteractionService(database)
	auditService := services.NewAuditService(database)
	integrationService := services.NewIntegrationService(database)
	incidentService := services.NewIncidentService(database)
	moderationService := services.NewModerationService(database)
	opsService := services.NewOpsService(database)
	asyncJobService := services.NewAsyncJobService(database)
	syncJobService := services.NewSyncJobService(database)
	skillVersionService := services.NewSkillVersionService(database)
	syncGovernanceService := services.NewSyncGovernanceService(
		asyncJobService,
		syncJobService,
		skillVersionService,
		auditService,
	)
	organizationService := services.NewOrganizationService(database)
	oauthGrantService := services.NewOAuthGrantService(database)
	dingTalkService := services.NewDingTalkService(services.DingTalkConfig{
		ClientID:     runtimeConfig.DingTalkClientID,
		ClientSecret: runtimeConfig.DingTalkSecret,
		RedirectURL:  runtimeConfig.DingTalkRedirect,
		Scope:        runtimeConfig.DingTalkScope,
		AuthBaseURL:  runtimeConfig.DingTalkAuthBase,
		APIBaseURL:   runtimeConfig.DingTalkAPIBase,
	})
	uploadService := services.NewUploadService()
	repositoryService := services.NewRepositorySyncService()
	repositorySyncCoordinator := services.NewRepositorySyncCoordinator(skillService, repositoryService)
	skillMPService := services.NewSkillMPService(runtimeConfig.SkillMPBaseURL, runtimeConfig.SkillMPToken)
	apiManagementStoragePath := filepath.Join(runtimeConfig.StoragePath, "api-management")
	apiSpecRegistryService := services.NewAPISpecRegistryService(database, apiManagementStoragePath)
	apiContractRuntimeService := services.NewAPIContractRuntimeService(database)
	if err := apiContractRuntimeService.Reload(ctx); err != nil && !errors.Is(err, services.ErrAPISpecNotFound) {
		return runtimeServices{}, fmt.Errorf("failed to initialize api contract runtime service: %w", err)
	}
	apiPublishService := services.NewAPIPublishService(database)
	apiPublishService.SetRuntimeReloader(apiContractRuntimeService)
	apiPolicyService := services.NewAPIPolicyService(database)
	apiPolicyService.SetRuntimeReloader(apiContractRuntimeService)
	apiMockService := services.NewAPIMockService(database, apiContractRuntimeService)
	apiExportService := services.NewAPIExportService(database, apiManagementStoragePath)

	scheduler := services.NewRepositorySyncScheduler(
		repositorySyncCoordinator,
		syncGovernanceService,
		runtimeConfig.RepoSyncInterval,
		runtimeConfig.RepoSyncTimeout,
		runtimeConfig.RepoSyncBatchSize,
		log.Default(),
		func(policyContext context.Context) (services.RepositorySyncPolicy, error) {
			return repoSyncPolicyService.Get(policyContext)
		},
	)

	return runtimeServices{
		authService:               authService,
		settingsService:           settingsService,
		repoSyncPolicyService:     repoSyncPolicyService,
		syncPolicyRecordService:   syncPolicyRecordService,
		sessionService:            sessionService,
		userSessionService:        userSessionService,
		skillService:              skillService,
		apiKeyService:             apiKeyService,
		interactionService:        interactionService,
		auditService:              auditService,
		integrationService:        integrationService,
		incidentService:           incidentService,
		moderationService:         moderationService,
		opsService:                opsService,
		asyncJobService:           asyncJobService,
		syncJobService:            syncJobService,
		syncGovernanceService:     syncGovernanceService,
		skillVersionService:       skillVersionService,
		organizationService:       organizationService,
		oauthGrantService:         oauthGrantService,
		dingTalkService:           dingTalkService,
		uploadService:             uploadService,
		repositoryService:         repositoryService,
		repositorySyncCoordinator: repositorySyncCoordinator,
		skillMPService:            skillMPService,
		apiSpecRegistryService:    apiSpecRegistryService,
		apiPublishService:         apiPublishService,
		apiPolicyService:          apiPolicyService,
		apiMockService:            apiMockService,
		apiExportService:          apiExportService,
		apiContractRuntimeService: apiContractRuntimeService,
		scheduler:                 scheduler,
	}, nil
}

func buildWebAppDependencies(runtimeConfig config.Config, serviceSet runtimeServices) web.AppDependencies {
	return web.AppDependencies{
		AuthService:         serviceSet.authService,
		SessionService:      serviceSet.sessionService,
		UserSessionService:  serviceSet.userSessionService,
		SkillService:        serviceSet.skillService,
		APIKeyService:       serviceSet.apiKeyService,
		InteractionService:  serviceSet.interactionService,
		AuditService:        serviceSet.auditService,
		IntegrationService:  serviceSet.integrationService,
		IncidentService:     serviceSet.incidentService,
		ModerationService:   serviceSet.moderationService,
		OpsService:          serviceSet.opsService,
		SkillVersionService: serviceSet.skillVersionService,
		OrganizationService: serviceSet.organizationService,
		OAuthGrantService:   serviceSet.oauthGrantService,
		DingTalkService:     serviceSet.dingTalkService,
		UploadService:       serviceSet.uploadService,
		SyncDependencies: web.SyncDependencies{
			AsyncJobService:           serviceSet.asyncJobService,
			SyncJobService:            serviceSet.syncJobService,
			SyncGovernanceService:     serviceSet.syncGovernanceService,
			RepositoryService:         serviceSet.repositoryService,
			RepositorySyncCoordinator: serviceSet.repositorySyncCoordinator,
			SyncPolicyService:         serviceSet.repoSyncPolicyService,
			SyncPolicyRecordSvc:       serviceSet.syncPolicyRecordService,
		},
		APIDependencies: web.APIDependencies{
			APISpecRegistrySvc:    serviceSet.apiSpecRegistryService,
			APIPublishSvc:         serviceSet.apiPublishService,
			APIPolicySvc:          serviceSet.apiPolicyService,
			APIMockSvc:            serviceSet.apiMockService,
			APIExportSvc:          serviceSet.apiExportService,
			APIContractRuntimeSvc: serviceSet.apiContractRuntimeService,
		},
		SkillMPService:     serviceSet.skillMPService,
		SettingsService:    serviceSet.settingsService,
		AllowRegistration:  runtimeConfig.AllowRegistration,
		CookieSecure:       runtimeConfig.SessionCookieSecure,
		APIOnly:            runtimeConfig.APIOnly,
		CORSAllowedOrigins: runtimeConfig.CORSAllowedOrigins,
		APIKeys:            runtimeConfig.APIKeys,
		TemplateGlob:       resolveTemplateGlob(runtimeConfig.APIOnly),
		StoragePath:        runtimeConfig.StoragePath,
	}
}
