package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"slices"
	"strconv"
	"strings"
	"testing"

	"skillsindex/internal/models"
)

func TestAPIAdminAccountsUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/accounts", nil)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccounts(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
}

func TestAPIAdminAccountsForbidden(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "access-admin", models.RoleAdmin)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/accounts", nil)
	req = withCurrentUser(req, &actor)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccounts(recorder, req)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
}

func TestAPIAdminAccountsSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "access-actor", models.RoleSuperAdmin)
	targetOne := createAdminAccessAPIUser(t, app, "access-target-one", models.RoleMember)
	targetTwo := createAdminAccessAPIUser(t, app, "access-target-two", models.RoleAdmin)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/accounts", nil)
	req = withCurrentUser(req, &actor)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAccounts(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}
	payload := decodeBodyMap(t, recorder)
	if total, ok := payload["total"].(float64); !ok || int(total) != 3 {
		t.Fatalf("unexpected total: %#v", payload["total"])
	}
	items, ok := payload["items"].([]any)
	if !ok || len(items) != 3 {
		t.Fatalf("unexpected items payload: %#v", payload["items"])
	}

	usernames := make([]string, 0, len(items))
	for _, rawItem := range items {
		item, ok := rawItem.(map[string]any)
		if !ok {
			t.Fatalf("unexpected item shape: %#v", rawItem)
		}
		username, _ := item["username"].(string)
		usernames = append(usernames, username)
	}

	if !slices.Contains(usernames, actor.Username) {
		t.Fatalf("missing actor username in accounts response: %v", usernames)
	}
	if !slices.Contains(usernames, targetOne.Username) {
		t.Fatalf("missing targetOne username in accounts response: %v", usernames)
	}
	if !slices.Contains(usernames, targetTwo.Username) {
		t.Fatalf("missing targetTwo username in accounts response: %v", usernames)
	}
}

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

func createAdminAccessAPIUser(t *testing.T, app *App, username string, role models.UserRole) models.User {
	t.Helper()

	user, err := app.authService.Register(context.Background(), username, "Password123!")
	if err != nil {
		t.Fatalf("failed to register user %s: %v", username, err)
	}
	if role != models.RoleMember {
		if err := app.authService.SetUserRole(context.Background(), user.ID, role); err != nil {
			t.Fatalf("failed to assign role %s to user %s: %v", role, username, err)
		}
	}

	updated, err := app.authService.GetUserByID(context.Background(), user.ID)
	if err != nil {
		t.Fatalf("failed to reload user %s: %v", username, err)
	}
	return updated
}
