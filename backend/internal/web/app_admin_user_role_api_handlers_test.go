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

func TestAPIAdminUserRoleUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/users/10/role", strings.NewReader(`{"role":"admin"}`))
	req.Header.Set("Content-Type", "application/json")
	req = withURLParam(req, "userID", "10")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminUserRoleUpdate(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
}

func TestAPIAdminUserRoleForbidden(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/users/10/role", strings.NewReader(`{"role":"admin"}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	req = withURLParam(req, "userID", "10")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminUserRoleUpdate(recorder, req)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
}

func TestAPIAdminUserRoleServiceUnavailable(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	app.authService = nil
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/users/10/role", strings.NewReader(`{"role":"admin"}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	req = withURLParam(req, "userID", "10")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminUserRoleUpdate(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusServiceUnavailable)
	}
}

func TestAPIAdminUserRoleInvalidUserID(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/users/abc/role", strings.NewReader(`{"role":"admin"}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	req = withURLParam(req, "userID", "abc")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminUserRoleUpdate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
}

func TestAPIAdminUserRoleInvalidPayload(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/users/10/role", strings.NewReader(`{"role":123}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	req = withURLParam(req, "userID", "10")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminUserRoleUpdate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
}

func TestAPIAdminUserRoleInvalidRole(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/users/10/role", strings.NewReader(`{"role":"nope"}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	req = withURLParam(req, "userID", "10")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminUserRoleUpdate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
}

func TestAPIAdminUserRoleUserNotFound(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/users/999/role", strings.NewReader(`{"role":"admin"}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	req = withURLParam(req, "userID", "999")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminUserRoleUpdate(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
}

func TestAPIAdminUserRoleLastSuperAdminConflict(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	superAdmin, err := app.authService.Register(context.Background(), "role-superadmin", "Password123!")
	if err != nil {
		t.Fatalf("failed to create super admin user: %v", err)
	}
	if err := app.authService.SetUserRole(context.Background(), superAdmin.ID, models.RoleSuperAdmin); err != nil {
		t.Fatalf("failed to elevate user to super admin: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/users/1/role", strings.NewReader(`{"role":"member"}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: superAdmin.ID, Role: models.RoleSuperAdmin})
	req = withURLParam(req, "userID", strconv.FormatUint(uint64(superAdmin.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminUserRoleUpdate(recorder, req)

	if recorder.Code != http.StatusConflict {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusConflict)
	}
}

func TestAPIAdminUserRoleSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	targetUser, err := app.authService.Register(context.Background(), "role-target", "Password123!")
	if err != nil {
		t.Fatalf("failed to create target user: %v", err)
	}
	actor := &models.User{ID: 1, Role: models.RoleSuperAdmin}
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/users/1/role", strings.NewReader(`{"role":"admin"}`))
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, actor)
	req = withURLParam(req, "userID", strconv.FormatUint(uint64(targetUser.ID), 10))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminUserRoleUpdate(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if ok, _ := payload["ok"].(bool); !ok {
		t.Fatalf("expected ok=true, got=%#v", payload)
	}
	role, _ := payload["role"].(string)
	if role != string(models.RoleAdmin) {
		t.Fatalf("unexpected role in response: got=%s want=%s", role, models.RoleAdmin)
	}
	userID, _ := payload["user_id"].(float64)
	if uint(userID) != targetUser.ID {
		t.Fatalf("unexpected user_id in response: got=%v want=%d", userID, targetUser.ID)
	}
	updated, err := app.authService.GetUserByID(context.Background(), targetUser.ID)
	if err != nil {
		t.Fatalf("failed to read updated target user: %v", err)
	}
	if updated.EffectiveRole() != models.RoleAdmin {
		t.Fatalf("unexpected updated role: got=%s want=%s", updated.EffectiveRole(), models.RoleAdmin)
	}
	assertLatestAuditAction(t, app, "api_admin_user_role_update")
}
