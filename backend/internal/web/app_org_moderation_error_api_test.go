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

func setupModerationPublicAPITestApp(t *testing.T) (*App, models.User) {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(
		&models.User{},
		&models.Skill{},
		&models.SkillComment{},
		&models.ModerationCase{},
	); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	user := models.User{Username: "moderation-user", Role: models.RoleMember}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	app := &App{
		moderationSvc: services.NewModerationService(db),
	}
	return app, user
}

func TestAPIAdminOrganizationsUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/organizations", nil)
	req.Header.Set("X-Request-ID", "req-admin-organizations-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminOrganizations(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Authentication required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-organizations-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminOrganizationCreateInvalidPayload(t *testing.T) {
	app := setupAccessSettingsTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/organizations",
		strings.NewReader(`{"name":`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-admin-organizations-invalid-payload")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminOrganizationCreate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusBadRequest, recorder.Body.String())
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-admin-organizations-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminOrganizationMembersUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/organizations/1/members", nil)
	req.Header.Set("X-Request-ID", "req-admin-organization-members-unauthorized")
	req = withURLParam(req, "orgID", "1")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminOrganizationMembers(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Authentication required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-organization-members-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminOrganizationMembersInvalidOrganizationID(t *testing.T) {
	app := setupAccessSettingsTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/organizations/invalid/members", nil)
	req.Header.Set("X-Request-ID", "req-admin-organization-members-invalid-org")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	req = withURLParam(req, "orgID", "invalid")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminOrganizationMembers(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_organization_id" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Invalid organization id" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-organization-members-invalid-org" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPISkillReportUnauthorized(t *testing.T) {
	app, _ := setupModerationPublicAPITestApp(t)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/skills/1/report", strings.NewReader(`{"reason_code":"spam"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-skill-report-unauthorized")
	req = withURLParam(req, "skillID", "1")
	recorder := httptest.NewRecorder()

	app.handleAPISkillReport(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Authentication required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-skill-report-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPICommentReportInvalidCommentID(t *testing.T) {
	app, user := setupModerationPublicAPITestApp(t)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/skills/1/comments/invalid/report", strings.NewReader(`{"reason_code":"abuse"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-comment-report-invalid-comment")
	req = withCurrentUser(req, &user)
	req = withURLParams(req, map[string]string{
		"skillID":   "1",
		"commentID": "invalid",
	})
	recorder := httptest.NewRecorder()

	app.handleAPICommentReport(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_comment_id" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Invalid comment id" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-comment-report-invalid-comment" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
