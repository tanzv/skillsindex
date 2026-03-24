package web

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAdminIngestionErrorTestApp(t *testing.T) (*App, models.User, *gorm.DB) {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.Skill{},
		&models.Tag{},
		&models.SkillTag{},
		&models.SkillVersion{},
		&models.AuditLog{},
	); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	owner := models.User{Username: "ingestion-error-owner", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner user: %v", err)
	}

	app := &App{
		skillService:  services.NewSkillService(db),
		uploadService: services.NewUploadService(),
		auditService:  services.NewAuditService(db),
		storagePath:   t.TempDir(),
	}
	return app, owner, db
}

func TestHandleAPIAdminIngestionManualInternalFailure(t *testing.T) {
	app, owner, db := setupAdminIngestionErrorTestApp(t)
	app.asyncJobSvc = nil

	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("failed to access sql db: %v", err)
	}
	if err := sqlDB.Close(); err != nil {
		t.Fatalf("failed to close sql db: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/manual",
		strings.NewReader(`{"name":"Manual API Skill","description":"Manual import","content":"# Manual API Skill","tags":"manual,api","visibility":"public"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionManual(recorder, req)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusInternalServerError, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	if got, _ := payload["error"].(string); got != "manual_ingestion_failed" {
		t.Fatalf("unexpected error code: got=%q payload=%#v", got, payload)
	}
	if got, _ := payload["message"].(string); got != "Failed to create manual skill" {
		t.Fatalf("unexpected error message: got=%q payload=%#v", got, payload)
	}
}

func TestHandleAPIAdminIngestionUploadStorageFailure(t *testing.T) {
	app, owner, _ := setupAdminIngestionErrorTestApp(t)
	app.asyncJobSvc = nil
	app.storagePath = "/dev/null"

	req := buildUploadRequest(t, map[string]string{
		"tags":       "upload,api",
		"visibility": "private",
	})
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionUpload(recorder, req)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusInternalServerError, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	if got, _ := payload["error"].(string); got != "upload_ingestion_failed" {
		t.Fatalf("unexpected error code: got=%q payload=%#v", got, payload)
	}
	if got, _ := payload["message"].(string); got != "Failed to prepare upload storage" {
		t.Fatalf("unexpected error message: got=%q payload=%#v", got, payload)
	}
}
