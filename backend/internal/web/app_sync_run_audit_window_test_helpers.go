package web

import (
	"fmt"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupSyncRunAuditWindowTestApp(t *testing.T) (*App, *gorm.DB) {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.SystemSetting{}); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.Skill{}, &models.Tag{}, &models.SkillTag{}, &models.SyncPolicy{}, &models.SyncJobRun{}, &models.AsyncJob{}, &models.SkillVersion{}, &models.AuditLog{}); err != nil {
		t.Fatalf("failed to migrate sqlite db for sync run audit window tests: %v", err)
	}

	settingsSvc := services.NewSettingsService(db)
	asyncJobSvc := services.NewAsyncJobService(db)
	syncJobSvc := services.NewSyncJobService(db)
	auditSvc := services.NewAuditService(db)
	app := &App{
		authService:     services.NewAuthService(db),
		skillService:    services.NewSkillService(db),
		settingsService: settingsSvc,
		syncRuntimeDependencies: syncRuntimeDependencies{
			syncPolicyService: services.NewRepositorySyncPolicyService(settingsSvc, services.RepositorySyncPolicy{
				Enabled:   false,
				Interval:  30 * time.Minute,
				Timeout:   10 * time.Minute,
				BatchSize: 20,
			}),
			syncPolicyRecordSvc: services.NewSyncPolicyService(db),
			syncJobSvc:          syncJobSvc,
			asyncJobSvc:         asyncJobSvc,
			syncGovernanceSvc:   services.NewSyncGovernanceService(asyncJobSvc, syncJobSvc, nil, auditSvc),
		},
		skillVersionSvc:   services.NewSkillVersionService(db),
		auditService:      auditSvc,
		opsService:        services.NewOpsService(db),
		allowRegistration: true,
	}
	return app, db
}
