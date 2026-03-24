package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
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
}
