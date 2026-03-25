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

func TestAPIAdminAccountForceSignoutSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "force-signout-actor", models.RoleSuperAdmin)
	target := createAdminAccessAPIUser(t, app, "force-signout-target", models.RoleMember)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/accounts/"+strconv.FormatUint(uint64(target.ID), 10)+"/force-signout",
		nil,
	)
	req = withCurrentUser(req, &actor)
	req = withURLParam(req, "userID", strconv.FormatUint(uint64(target.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccountForceSignout(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}
	updated, err := app.authService.GetUserByID(context.Background(), target.ID)
	if err != nil {
		t.Fatalf("failed to read updated target user: %v", err)
	}
	if updated.ForceLogoutAt == nil {
		t.Fatalf("expected force logout timestamp after force signout")
	}
	assertLatestAuditAction(t, app, "api_user_force_signout")
}

func TestAPIAdminAccountForceSignoutServiceUnavailable(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "force-signout-service-unavailable-actor", models.RoleSuperAdmin)
	app.authService = nil

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/accounts/1/force-signout", nil)
	req = withCurrentUser(req, &actor)
	req = withURLParam(req, "userID", "1")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccountForceSignout(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusServiceUnavailable, recorder.Body.String())
	}
}

func TestAPIAdminAccountForceSignoutInvalidUserID(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "force-signout-invalid-id-actor", models.RoleSuperAdmin)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/accounts/invalid/force-signout", nil)
	req = withCurrentUser(req, &actor)
	req = withURLParam(req, "userID", "invalid")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccountForceSignout(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
}

func TestAPIAdminAccountForceSignoutUserNotFound(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "force-signout-missing-target-actor", models.RoleSuperAdmin)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/accounts/999/force-signout", nil)
	req = withCurrentUser(req, &actor)
	req = withURLParam(req, "userID", "999")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccountForceSignout(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
}

func TestAPIAdminAccountPasswordResetSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "password-reset-actor", models.RoleSuperAdmin)
	target := createAdminAccessAPIUser(t, app, "password-reset-target", models.RoleMember)
	if err := app.authService.SetUserStatus(context.Background(), target.ID, models.UserStatusDisabled); err != nil {
		t.Fatalf("failed to disable target user before reset: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/accounts/"+strconv.FormatUint(uint64(target.ID), 10)+"/password-reset",
		strings.NewReader(`{"new_password":"Reset123!"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &actor)
	req = withURLParam(req, "userID", strconv.FormatUint(uint64(target.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccountPasswordReset(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}
	if _, err := app.authService.Authenticate(context.Background(), target.Username, "Password123!"); err == nil {
		t.Fatalf("expected old password to become invalid after reset")
	}
	updated, err := app.authService.Authenticate(context.Background(), target.Username, "Reset123!")
	if err != nil {
		t.Fatalf("failed to authenticate with reset password: %v", err)
	}
	if updated.Status != models.UserStatusActive {
		t.Fatalf("unexpected updated status after reset: got=%s want=%s", updated.Status, models.UserStatusActive)
	}
	if updated.ForceLogoutAt == nil {
		t.Fatalf("expected force logout timestamp after password reset")
	}
	assertLatestAuditAction(t, app, "api_user_password_reset")
}

func TestAPIAdminAccountPasswordResetServiceUnavailable(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "password-reset-service-unavailable-actor", models.RoleSuperAdmin)
	app.authService = nil

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/accounts/1/password-reset",
		strings.NewReader(`{"new_password":"Reset123!"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &actor)
	req = withURLParam(req, "userID", "1")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccountPasswordReset(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusServiceUnavailable, recorder.Body.String())
	}
}
