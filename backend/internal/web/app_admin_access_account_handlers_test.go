package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strconv"
	"strings"
	"testing"

	"skillsindex/internal/models"
)

func TestAdminAccountCreateSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "form-create-actor", models.RoleSuperAdmin)

	form := url.Values{}
	form.Set("username", "form-create-target")
	form.Set("password", "Password123!")
	form.Set("role", string(models.RoleAdmin))
	req := httptest.NewRequest(http.MethodPost, "/admin/accounts/create", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &actor)
	recorder := httptest.NewRecorder()

	app.handleAdminAccountCreate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "/admin/accounts") || !strings.Contains(location, "msg=Account+created") {
		t.Fatalf("unexpected redirect location: %s", location)
	}

	created, err := app.authService.GetUserByUsername(context.Background(), "form-create-target")
	if err != nil {
		t.Fatalf("failed to read created user: %v", err)
	}
	if created.EffectiveRole() != models.RoleAdmin {
		t.Fatalf("unexpected created role: got=%s want=%s", created.EffectiveRole(), models.RoleAdmin)
	}
	assertLatestAuditAction(t, app, "user_create_by_admin")
}

func TestAdminAccountCreateInvalidRole(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "form-create-invalid-actor", models.RoleSuperAdmin)

	form := url.Values{}
	form.Set("username", "form-create-invalid-target")
	form.Set("password", "Password123!")
	form.Set("role", "invalid")
	req := httptest.NewRequest(http.MethodPost, "/admin/accounts/create", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &actor)
	recorder := httptest.NewRecorder()

	app.handleAdminAccountCreate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "/admin/accounts/new") || !strings.Contains(location, "err=Invalid+role+value") {
		t.Fatalf("unexpected redirect location: %s", location)
	}
}

func TestAdminAccountStatusUpdateSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "form-status-actor", models.RoleSuperAdmin)
	target := createAdminAccessAPIUser(t, app, "form-status-target", models.RoleMember)

	form := url.Values{}
	form.Set("status", string(models.UserStatusDisabled))
	req := httptest.NewRequest(http.MethodPost, "/admin/accounts/"+strconv.FormatUint(uint64(target.ID), 10)+"/status", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &actor)
	req = withURLParam(req, "userID", strconv.FormatUint(uint64(target.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAdminAccountStatusUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "/admin/accounts") || !strings.Contains(location, "msg=Account+status+updated") {
		t.Fatalf("unexpected redirect location: %s", location)
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
	assertLatestAuditAction(t, app, "user_update_status")
}

func TestAdminAccountForceSignoutUserNotFound(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "form-force-signout-actor", models.RoleSuperAdmin)

	req := httptest.NewRequest(http.MethodPost, "/admin/accounts/999/force-signout", nil)
	req = withCurrentUser(req, &actor)
	req = withURLParam(req, "userID", "999")
	recorder := httptest.NewRecorder()

	app.handleAdminAccountForceSignout(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "/admin/accounts") || !strings.Contains(location, "err=User+not+found") {
		t.Fatalf("unexpected redirect location: %s", location)
	}
}
