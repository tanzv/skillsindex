package web

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAccessSettingsTestApp(t *testing.T) *App {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.SystemSetting{}); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.UserSession{},
		&models.Skill{},
		&models.Tag{},
		&models.SkillTag{},
		&models.SyncPolicy{},
		&models.SyncJobRun{},
		&models.AsyncJob{},
		&models.SkillVersion{},
		&models.AuditLog{},
		&models.IntegrationConnector{},
		&models.Organization{},
		&models.OrganizationMember{},
	); err != nil {
		t.Fatalf("failed to migrate sqlite db for sync jobs, async jobs, and audit logs: %v", err)
	}
	settingsSvc := services.NewSettingsService(db)
	asyncJobSvc := services.NewAsyncJobService(db)
	syncJobSvc := services.NewSyncJobService(db)
	auditSvc := services.NewAuditService(db)
	return &App{
		authService:     services.NewAuthService(db),
		userSessionSvc:  services.NewUserSessionService(db),
		skillService:    services.NewSkillService(db),
		integrationSvc:  services.NewIntegrationService(db),
		organizationSvc: services.NewOrganizationService(db),
		settingsService: settingsSvc,
		syncPolicyService: services.NewRepositorySyncPolicyService(settingsSvc, services.RepositorySyncPolicy{
			Enabled:   false,
			Interval:  30 * time.Minute,
			Timeout:   10 * time.Minute,
			BatchSize: 20,
		}),
		syncPolicyRecordSvc: services.NewSyncPolicyService(db),
		syncJobSvc:          syncJobSvc,
		asyncJobSvc:         asyncJobSvc,
		skillVersionSvc:     services.NewSkillVersionService(db),
		auditService:        auditSvc,
		syncGovernanceSvc:   services.NewSyncGovernanceService(asyncJobSvc, syncJobSvc, nil, auditSvc),
		opsService:          services.NewOpsService(db),
		allowRegistration:   true,
	}
}

func withCurrentUser(req *http.Request, user *models.User) *http.Request {
	ctx := context.WithValue(req.Context(), currentUserKey, user)
	return req.WithContext(ctx)
}

func withURLParam(req *http.Request, key string, value string) *http.Request {
	routeCtx := chi.NewRouteContext()
	routeCtx.URLParams.Add(key, value)
	ctx := context.WithValue(req.Context(), chi.RouteCtxKey, routeCtx)
	return req.WithContext(ctx)
}

func decodeBodyMap(t *testing.T, recorder *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode response body: %v", err)
	}
	return payload
}
