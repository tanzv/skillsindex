package web

import (
	"context"
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

func TestAPIAdminModerationListUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/moderation", nil)
	req.Header.Set("X-Request-ID", "req-admin-moderation-list-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminModerationList(recorder, req)

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
	if payload["request_id"] != "req-admin-moderation-list-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminModerationCreateInvalidTargetType(t *testing.T) {
	app, _ := setupModerationPublicAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/moderation",
		strings.NewReader(`{"target_type":"unknown","reason_code":"spam"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-admin-moderation-create-invalid-target")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminModerationCreate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_target_type" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Invalid moderation target type" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-moderation-create-invalid-target" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminModerationResolveInvalidCaseID(t *testing.T) {
	app, _ := setupModerationPublicAPITestApp(t)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/moderation/invalid/resolve", strings.NewReader(`{"action":"hidden"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-admin-moderation-resolve-invalid-case")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	req = withURLParam(req, "caseID", "invalid")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminModerationResolve(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_case_id" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Invalid moderation case id" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-moderation-resolve-invalid-case" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminSkillsUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/skills", nil)
	req.Header.Set("X-Request-ID", "req-admin-skills-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSkills(recorder, req)

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
	if payload["request_id"] != "req-admin-skills-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminSkillsSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	owner := createAdminAccessAPIUser(t, app, "skills-owner", models.RoleMember)
	if _, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:      owner.ID,
		Name:         "Admin Skills Visible",
		Description:  "desc",
		Content:      "content",
		Visibility:   models.VisibilityPublic,
		SourceType:   models.SourceTypeManual,
		CategorySlug: "development",
		Analysis: services.SourceTopologySnapshot{
			EntryFile:       "SKILL.md",
			Mechanism:       "skill_markdown",
			MetadataSources: []string{"SKILL.md"},
		},
	}); err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/skills?limit=10", nil)
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSkills(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}
	payload := decodeBodyMap(t, recorder)
	if total, ok := payload["total"].(float64); !ok || int(total) < 1 {
		t.Fatalf("unexpected total payload: %#v", payload)
	}
	items, ok := payload["items"].([]any)
	if !ok || len(items) == 0 {
		t.Fatalf("missing items payload: %#v", payload)
	}
	firstItem, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected first item payload: %#v", items[0])
	}
	sourceAnalysis, ok := firstItem["source_analysis"].(map[string]any)
	if !ok {
		t.Fatalf("missing source_analysis payload: %#v", firstItem)
	}
	if got, _ := sourceAnalysis["entry_file"].(string); got != "SKILL.md" {
		t.Fatalf("unexpected source_analysis.entry_file: got=%q payload=%#v", got, sourceAnalysis)
	}
	if got, _ := sourceAnalysis["mechanism"].(string); got != "skill_markdown" {
		t.Fatalf("unexpected source_analysis.mechanism: got=%q payload=%#v", got, sourceAnalysis)
	}
}

func TestAPIAdminSkillsListFailureHidesInternalError(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	owner := createAdminAccessAPIUser(t, app, "skills-list-failed-owner", models.RoleMember)

	sharedDB, err := gorm.Open(sqlite.Open(fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open shared sqlite db: %v", err)
	}
	if err := sharedDB.Migrator().DropTable(&models.Skill{}); err != nil {
		t.Fatalf("failed to drop skills table: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/skills", nil)
	req.Header.Set("X-Request-ID", "req-admin-skills-list-failed")
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSkills(recorder, req)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusInternalServerError)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "list_failed" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Failed to list skills" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-skills-list-failed" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
