package web

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"skillsindex/internal/models"
)

func TestAPIAdminOverviewUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/overview", nil)
	req.Header.Set("X-Request-ID", "req-admin-overview-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminOverview(recorder, req)

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
	if payload["request_id"] != "req-admin-overview-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminOverviewServiceUnavailable(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	app.skillService = nil
	actor := createAdminAccessAPIUser(t, app, "overview-actor", models.RoleAdmin)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/overview", nil)
	req.Header.Set("X-Request-ID", "req-admin-overview-service-unavailable")
	req = withCurrentUser(req, &actor)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminOverview(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusServiceUnavailable)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "service_unavailable" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Skill service is unavailable" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-admin-overview-service-unavailable" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
