package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"skillsindex/internal/models"
)

func TestAPIAdminAccountStatusSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "status-actor", models.RoleSuperAdmin)
	target := createAdminAccessAPIUser(t, app, "status-target", models.RoleMember)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/accounts/"+strconv.FormatUint(uint64(target.ID), 10)+"/status",
		strings.NewReader(`{"status":"disabled"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &actor)
	req = withURLParam(req, "userID", strconv.FormatUint(uint64(target.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccountStatus(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}
	updated, err := app.authService.GetUserByID(context.Background(), target.ID)
	if err != nil {
		t.Fatalf("failed to read updated target user: %v", err)
	}
	if updated.Status != models.UserStatusDisabled {
		t.Fatalf("unexpected updated status: got=%s want=%s", updated.Status, models.UserStatusDisabled)
	}
	if updated.ForceLogoutAt == nil {
		t.Fatalf("expected force logout timestamp after disabling account")
	}
	assertLatestAuditAction(t, app, "api_user_update_status")
}

func TestAPIAdminAccountStatusServiceUnavailable(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "status-service-unavailable-actor", models.RoleSuperAdmin)
	app.authService = nil

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/accounts/1/status",
		strings.NewReader(`{"status":"disabled"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-admin-account-status-service-unavailable")
	req = withCurrentUser(req, &actor)
	req = withURLParam(req, "userID", "1")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccountStatus(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusServiceUnavailable, recorder.Body.String())
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "service_unavailable" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-admin-account-status-service-unavailable" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
