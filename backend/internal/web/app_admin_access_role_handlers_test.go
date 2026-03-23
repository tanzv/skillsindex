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

func TestAdminRoleAssignSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "form-role-actor", models.RoleSuperAdmin)
	target := createAdminAccessAPIUser(t, app, "form-role-target", models.RoleMember)

	form := url.Values{}
	form.Set("user_id", strconv.FormatUint(uint64(target.ID), 10))
	form.Set("role", string(models.RoleAdmin))
	req := httptest.NewRequest(http.MethodPost, "/admin/roles/assign", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &actor)
	recorder := httptest.NewRecorder()

	app.handleAdminRoleAssign(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "/admin/roles") || !strings.Contains(location, "msg=User+role+updated") {
		t.Fatalf("unexpected redirect location: %s", location)
	}

	updated, err := app.authService.GetUserByID(context.Background(), target.ID)
	if err != nil {
		t.Fatalf("failed to read updated target user: %v", err)
	}
	if updated.EffectiveRole() != models.RoleAdmin {
		t.Fatalf("unexpected updated role: got=%s want=%s", updated.EffectiveRole(), models.RoleAdmin)
	}
	assertLatestAuditAction(t, app, "user_update_role")
}

func TestAdminRoleAssignInvalidRole(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "form-role-invalid-actor", models.RoleSuperAdmin)
	target := createAdminAccessAPIUser(t, app, "form-role-invalid-target", models.RoleMember)

	form := url.Values{}
	form.Set("user_id", strconv.FormatUint(uint64(target.ID), 10))
	form.Set("role", "nope")
	req := httptest.NewRequest(http.MethodPost, "/admin/roles/assign", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &actor)
	recorder := httptest.NewRecorder()

	app.handleAdminRoleAssign(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "/admin/roles/new") || !strings.Contains(location, "err=Invalid+role+value") {
		t.Fatalf("unexpected redirect location: %s", location)
	}
}

func TestAdminUserRoleUpdateSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "form-user-role-actor", models.RoleSuperAdmin)
	target := createAdminAccessAPIUser(t, app, "form-user-role-target", models.RoleMember)

	form := url.Values{}
	form.Set("role", string(models.RoleAdmin))
	req := httptest.NewRequest(
		http.MethodPost,
		"/admin/users/"+strconv.FormatUint(uint64(target.ID), 10)+"/role?section=access",
		strings.NewReader(form.Encode()),
	)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &actor)
	req = withURLParams(req, map[string]string{
		"userID":  strconv.FormatUint(uint64(target.ID), 10),
		"section": "access",
	})
	recorder := httptest.NewRecorder()

	app.handleAdminUserRoleUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "/admin/access") || !strings.Contains(location, "msg=User+role+updated") {
		t.Fatalf("unexpected redirect location: %s", location)
	}

	updated, err := app.authService.GetUserByID(context.Background(), target.ID)
	if err != nil {
		t.Fatalf("failed to read updated target user: %v", err)
	}
	if updated.EffectiveRole() != models.RoleAdmin {
		t.Fatalf("unexpected updated role: got=%s want=%s", updated.EffectiveRole(), models.RoleAdmin)
	}
	assertLatestAuditAction(t, app, "user_update_role")
}

func TestAdminUserRoleUpdateInvalidRole(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	actor := createAdminAccessAPIUser(t, app, "form-user-role-invalid-actor", models.RoleSuperAdmin)
	target := createAdminAccessAPIUser(t, app, "form-user-role-invalid-target", models.RoleMember)

	form := url.Values{}
	form.Set("role", "invalid")
	req := httptest.NewRequest(
		http.MethodPost,
		"/admin/users/"+strconv.FormatUint(uint64(target.ID), 10)+"/role?section=access",
		strings.NewReader(form.Encode()),
	)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &actor)
	req = withURLParams(req, map[string]string{
		"userID":  strconv.FormatUint(uint64(target.ID), 10),
		"section": "access",
	})
	recorder := httptest.NewRecorder()

	app.handleAdminUserRoleUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "/admin/access") || !strings.Contains(location, "err=Invalid+role+value") {
		t.Fatalf("unexpected redirect location: %s", location)
	}
}
