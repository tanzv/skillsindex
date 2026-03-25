package bootstrap

import (
	"context"
	"fmt"
	"log"

	"gorm.io/gorm"
	"skillsindex/internal/config"
	"skillsindex/internal/db"
	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

type runtimeBootstrapCore struct {
	database                *gorm.DB
	authService             *services.AuthService
	settingsService         *services.SettingsService
	repoSyncPolicyService   *services.RepositorySyncPolicyService
	syncPolicyRecordService *services.SyncPolicyService
	closeDatabase           func()
}

func prepareRuntimeBootstrapCore(
	ctx context.Context,
	runtimeConfig config.Config,
	options StateInitializationOptions,
) (runtimeBootstrapCore, error) {
	database, closeDatabase, err := openRuntimeDatabase(runtimeConfig.DatabaseURL)
	if err != nil {
		return runtimeBootstrapCore{}, err
	}

	core := buildRuntimeBootstrapCore(database, runtimeConfig, closeDatabase)
	if err := initializeRuntimeState(
		ctx,
		runtimeConfig,
		options,
		core.database,
		core.authService,
		core.settingsService,
		core.repoSyncPolicyService,
		core.syncPolicyRecordService,
	); err != nil {
		core.close()
		return runtimeBootstrapCore{}, err
	}
	return core, nil
}

func openRuntimeDatabase(databaseURL string) (*gorm.DB, func(), error) {
	database, err := db.Open(databaseURL)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to connect database: %w", err)
	}
	if err := db.Migrate(database); err != nil {
		return nil, nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	sqlDB, err := database.DB()
	if err != nil {
		return nil, nil, fmt.Errorf("failed to access sql db handle: %w", err)
	}

	closeDatabase := func() {
		if closeErr := sqlDB.Close(); closeErr != nil {
			log.Printf("failed to close database: %v", closeErr)
		}
	}
	return database, closeDatabase, nil
}

func buildRuntimeBootstrapCore(
	database *gorm.DB,
	runtimeConfig config.Config,
	closeDatabase func(),
) runtimeBootstrapCore {
	settingsService := services.NewSettingsService(database)
	return runtimeBootstrapCore{
		database:        database,
		authService:     services.NewAuthService(database),
		settingsService: settingsService,
		repoSyncPolicyService: services.NewRepositorySyncPolicyService(
			settingsService,
			services.RepositorySyncPolicy{
				Enabled:   runtimeConfig.RepoSyncEnabled,
				Interval:  runtimeConfig.RepoSyncInterval,
				Timeout:   runtimeConfig.RepoSyncTimeout,
				BatchSize: runtimeConfig.RepoSyncBatchSize,
			},
		),
		syncPolicyRecordService: services.NewSyncPolicyService(database),
		closeDatabase:           closeDatabase,
	}
}

func (c runtimeBootstrapCore) close() {
	if c.closeDatabase != nil {
		c.closeDatabase()
	}
}

func initializeRuntimeState(
	ctx context.Context,
	runtimeConfig config.Config,
	options StateInitializationOptions,
	database *gorm.DB,
	authService *services.AuthService,
	settingsService *services.SettingsService,
	repoSyncPolicyService *services.RepositorySyncPolicyService,
	syncPolicyRecordService *services.SyncPolicyService,
) error {
	if options.SeedData {
		if err := db.EnsureSeedData(database); err != nil {
			return fmt.Errorf("failed to seed database: %w", err)
		}
	}
	if options.DefaultAccount {
		if _, err := authService.EnsureDefaultAccount(
			ctx,
			runtimeConfig.AdminUsername,
			runtimeConfig.AdminPassword,
			models.NormalizeUserRole(runtimeConfig.AdminRole),
		); err != nil {
			return fmt.Errorf("failed to ensure default admin account: %w", err)
		}
	}
	if options.RegistrationSetting {
		if _, err := settingsService.EnsureBool(ctx, services.SettingAllowRegistration, runtimeConfig.AllowRegistration); err != nil {
			return fmt.Errorf("failed to initialize allow_registration setting: %w", err)
		}
		if _, err := settingsService.Ensure(
			ctx,
			services.SettingMarketplaceRankingDefaultSort,
			services.DefaultMarketplaceRankingSort,
		); err != nil {
			return fmt.Errorf("failed to initialize marketplace_ranking_default_sort setting: %w", err)
		}
		if _, err := settingsService.EnsureInt(
			ctx,
			services.SettingMarketplaceRankingLimit,
			services.DefaultMarketplaceRankingLimit,
		); err != nil {
			return fmt.Errorf("failed to initialize marketplace_ranking_limit setting: %w", err)
		}
		if _, err := settingsService.EnsureInt(
			ctx,
			services.SettingMarketplaceRankingHighlightLimit,
			services.DefaultMarketplaceRankingHighlightLimit,
		); err != nil {
			return fmt.Errorf("failed to initialize marketplace_ranking_highlight_limit setting: %w", err)
		}
		if _, err := settingsService.EnsureInt(
			ctx,
			services.SettingMarketplaceRankingCategoryLeaderLimit,
			services.DefaultMarketplaceCategoryLeaderLimit,
		); err != nil {
			return fmt.Errorf("failed to initialize marketplace_ranking_category_leader_limit setting: %w", err)
		}
	}
	if options.RepositorySyncPolicy {
		if _, err := repoSyncPolicyService.Ensure(ctx); err != nil {
			return fmt.Errorf("failed to initialize repository sync policy: %w", err)
		}
	}
	if options.RepositorySyncMirror {
		ensuredPolicy, err := repoSyncPolicyService.Get(ctx)
		if err != nil {
			return fmt.Errorf("failed to load initialized repository sync policy: %w", err)
		}
		if _, err := syncPolicyRecordService.UpsertRepositoryMirror(ctx, ensuredPolicy, nil); err != nil {
			return fmt.Errorf("failed to initialize repository sync policy mirror: %w", err)
		}
	}
	return nil
}
