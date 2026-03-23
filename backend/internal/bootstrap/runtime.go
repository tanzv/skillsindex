package bootstrap

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"skillsindex/internal/config"
	"skillsindex/internal/db"
	"skillsindex/internal/models"
	"skillsindex/internal/services"
	"skillsindex/internal/web"
)

const defaultCORSOrigin = "http://localhost:5173"
const defaultHTTPShutdownTimeout = 10 * time.Second

// RunOptions controls command-level startup behavior.
type RunOptions struct {
	StartupLabel string
	ForceAPIOnly bool
}

// NormalizeRuntimeConfig applies runtime defaults for a command entrypoint.
func NormalizeRuntimeConfig(cfg config.Config, options RunOptions) config.Config {
	if options.ForceAPIOnly {
		cfg.APIOnly = true
	}
	if len(cfg.CORSAllowedOrigins) == 0 && !cfg.IsProduction() {
		cfg.CORSAllowedOrigins = []string{defaultCORSOrigin}
	}
	return cfg
}

// ValidateSecurityDefaults checks required production safeguards.
func ValidateSecurityDefaults(cfg config.Config) error {
	if !cfg.IsProduction() {
		return nil
	}
	if strings.TrimSpace(cfg.SessionSecret) == "" || cfg.SessionSecret == "change-me-in-production" {
		return errors.New("SESSION_SECRET must be explicitly configured in production")
	}
	if strings.TrimSpace(cfg.AdminPassword) == "" || cfg.AdminPassword == "Admin123456!" {
		return errors.New("ADMIN_PASSWORD must be explicitly configured in production")
	}
	return nil
}

// LogAPIKeyWarning emits a warning when no static API keys are configured.
func LogAPIKeyWarning(logger *log.Logger, cfg config.Config) {
	if logger == nil {
		logger = log.Default()
	}
	if len(cfg.APIKeys) == 0 {
		logger.Printf("API_KEYS is empty; API routes require database-issued API keys")
	}
}

// RunAPIServer bootstraps all dependencies and starts the HTTP API server.
func RunAPIServer(ctx context.Context, cfg config.Config, options RunOptions) error {
	if ctx == nil {
		ctx = context.Background()
	}

	runtimeConfig := NormalizeRuntimeConfig(cfg, options)
	if err := ValidateSecurityDefaults(runtimeConfig); err != nil {
		return err
	}
	LogAPIKeyWarning(log.Default(), runtimeConfig)

	if err := os.MkdirAll(runtimeConfig.StoragePath, 0o755); err != nil {
		return fmt.Errorf("failed to create storage path: %w", err)
	}

	database, err := db.Open(runtimeConfig.DatabaseURL)
	if err != nil {
		return fmt.Errorf("failed to connect database: %w", err)
	}
	if err := db.Migrate(database); err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}
	if err := db.EnsureSeedData(database); err != nil {
		return fmt.Errorf("failed to seed database: %w", err)
	}
	sqlDB, err := database.DB()
	if err != nil {
		return fmt.Errorf("failed to access sql db handle: %w", err)
	}
	defer func() {
		if closeErr := sqlDB.Close(); closeErr != nil {
			log.Printf("failed to close database: %v", closeErr)
		}
	}()

	authService := services.NewAuthService(database)
	settingsService := services.NewSettingsService(database)
	repoSyncPolicyService := services.NewRepositorySyncPolicyService(settingsService, services.RepositorySyncPolicy{
		Enabled:   runtimeConfig.RepoSyncEnabled,
		Interval:  runtimeConfig.RepoSyncInterval,
		Timeout:   runtimeConfig.RepoSyncTimeout,
		BatchSize: runtimeConfig.RepoSyncBatchSize,
	})
	syncPolicyRecordService := services.NewSyncPolicyService(database)
	if _, err := authService.EnsureDefaultAccount(
		ctx,
		runtimeConfig.AdminUsername,
		runtimeConfig.AdminPassword,
		models.NormalizeUserRole(runtimeConfig.AdminRole),
	); err != nil {
		return fmt.Errorf("failed to ensure default admin account: %w", err)
	}
	if _, err := settingsService.EnsureBool(ctx, services.SettingAllowRegistration, runtimeConfig.AllowRegistration); err != nil {
		return fmt.Errorf("failed to initialize allow_registration setting: %w", err)
	}
	if _, err := repoSyncPolicyService.Ensure(ctx); err != nil {
		return fmt.Errorf("failed to initialize repository sync policy: %w", err)
	}
	if ensuredPolicy, err := repoSyncPolicyService.Get(ctx); err != nil {
		return fmt.Errorf("failed to load initialized repository sync policy: %w", err)
	} else if _, err := syncPolicyRecordService.UpsertRepositoryMirror(ctx, ensuredPolicy, nil); err != nil {
		return fmt.Errorf("failed to initialize repository sync policy mirror: %w", err)
	}

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
	scheduler.Start(ctx)
	log.Printf(
		"repository sync scheduler initialized bootstrap_enabled=%t interval=%s timeout=%s batch_size=%d",
		runtimeConfig.RepoSyncEnabled,
		runtimeConfig.RepoSyncInterval,
		runtimeConfig.RepoSyncTimeout,
		runtimeConfig.RepoSyncBatchSize,
	)

	app, err := web.NewApp(web.AppDependencies{
		AuthService:           authService,
		SessionService:        sessionService,
		UserSessionService:    userSessionService,
		SkillService:          skillService,
		APIKeyService:         apiKeyService,
		InteractionService:    interactionService,
		AuditService:          auditService,
		IntegrationService:    integrationService,
		IncidentService:       incidentService,
		ModerationService:     moderationService,
		OpsService:            opsService,
		AsyncJobService:       asyncJobService,
		SyncJobService:        syncJobService,
		SyncGovernanceService: syncGovernanceService,
		SkillVersionService:   skillVersionService,
		OrganizationService:   organizationService,
		OAuthGrantService:     oauthGrantService,
		DingTalkService:       dingTalkService,
		UploadService:         uploadService,
		RepositoryService:     repositoryService,
		SkillMPService:        skillMPService,
		SettingsService:       settingsService,
		SyncPolicyService:     repoSyncPolicyService,
		SyncPolicyRecordSvc:   syncPolicyRecordService,
		AllowRegistration:     runtimeConfig.AllowRegistration,
		CookieSecure:          runtimeConfig.SessionCookieSecure,
		APIOnly:               runtimeConfig.APIOnly,
		CORSAllowedOrigins:    runtimeConfig.CORSAllowedOrigins,
		APIKeys:               runtimeConfig.APIKeys,
		TemplateGlob:          "",
		StoragePath:           runtimeConfig.StoragePath,
	})
	if err != nil {
		return fmt.Errorf("failed to build web app: %w", err)
	}

	httpServer := &http.Server{
		Addr:              ":" + runtimeConfig.ServerPort,
		Handler:           app.Router(),
		ReadHeaderTimeout: 10 * time.Second,
	}

	startupLabel := strings.TrimSpace(options.StartupLabel)
	if startupLabel == "" {
		startupLabel = "SkillsIndex is listening at"
	}
	fmt.Printf("%s http://localhost:%s\n", startupLabel, runtimeConfig.ServerPort)
	if err := runHTTPServer(ctx, httpServer, defaultHTTPShutdownTimeout); err != nil {
		return fmt.Errorf("server failed: %w", err)
	}
	return nil
}

type managedHTTPServer interface {
	ListenAndServe() error
	Shutdown(context.Context) error
}

func runHTTPServer(ctx context.Context, server managedHTTPServer, shutdownTimeout time.Duration) error {
	if ctx == nil {
		ctx = context.Background()
	}
	errCh := make(chan error, 1)
	go func() {
		errCh <- server.ListenAndServe()
	}()

	select {
	case err := <-errCh:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}
		return nil
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
		defer cancel()
		if err := server.Shutdown(shutdownCtx); err != nil {
			return fmt.Errorf("shutdown failed: %w", err)
		}
		err := <-errCh
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			return err
		}
		return nil
	}
}
