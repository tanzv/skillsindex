package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupUserCenterTestApp(t *testing.T) (*App, *services.AuthService, *services.OAuthGrantService, models.User, models.User) {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.OAuthGrant{}, &models.SystemSetting{}, &models.AuditLog{}); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	authSvc := services.NewAuthService(db)
	oauthSvc := services.NewOAuthGrantService(db)
	settingsSvc := services.NewSettingsService(db)
	auditSvc := services.NewAuditService(db)

	superAdmin, err := authSvc.Register(context.Background(), "user-center-super-admin", "Admin123!")
	if err != nil {
		t.Fatalf("failed to create super admin: %v", err)
	}
	if err := authSvc.SetUserRole(context.Background(), superAdmin.ID, models.RoleSuperAdmin); err != nil {
		t.Fatalf("failed to set super admin role: %v", err)
	}
	superAdmin, err = authSvc.GetUserByID(context.Background(), superAdmin.ID)
	if err != nil {
		t.Fatalf("failed to reload super admin: %v", err)
	}

	member, err := authSvc.Register(context.Background(), "user-center-member", "Member123!")
	if err != nil {
		t.Fatalf("failed to create member: %v", err)
	}
	member, err = authSvc.GetUserByID(context.Background(), member.ID)
	if err != nil {
		t.Fatalf("failed to reload member: %v", err)
	}

	app := &App{
		authService:       authSvc,
		oauthGrantService: oauthSvc,
		settingsService:   settingsSvc,
		auditService:      auditSvc,
	}
	return app, authSvc, oauthSvc, superAdmin, member
}

func TestAPIUserCenterAccountsPermissionDeniedWithoutPermission(t *testing.T) {
	app, _, _, _, member := setupUserCenterTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/user-center/accounts", nil)
	req.Header.Set("X-Request-ID", "req-user-center-accounts-permission-denied")
	req = withCurrentUser(req, &member)
	recorder := httptest.NewRecorder()

	app.handleAPIUserCenterAccounts(recorder, req)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "permission_denied" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Permission denied" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-user-center-accounts-permission-denied" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIUserCenterAccountsUnauthorized(t *testing.T) {
	app, _, _, _, _ := setupUserCenterTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/user-center/accounts", nil)
	req.Header.Set("X-Request-ID", "req-user-center-accounts-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIUserCenterAccounts(recorder, req)

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
	if payload["request_id"] != "req-user-center-accounts-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIUserCenterSyncCreatesFeishuAccounts(t *testing.T) {
	app, authSvc, oauthSvc, superAdmin, _ := setupUserCenterTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/user-center/sync",
		strings.NewReader(`{"provider":"feishu","mode":"incremental","users":[{"external_user_id":"fs-1001","username":"feishu.jack","display_name":"Jack Feishu","role":"admin","status":"active","permissions":["user_center.accounts.read"]}]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &superAdmin)
	recorder := httptest.NewRecorder()

	app.handleAPIUserCenterSync(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if got, ok := payload["created_count"].(float64); !ok || int(got) != 1 {
		t.Fatalf("unexpected created_count: %#v", payload["created_count"])
	}

	mappedUser, err := oauthSvc.FindUserByExternalID(context.Background(), models.OAuthProviderFeishuSync, "fs-1001")
	if err != nil {
		t.Fatalf("failed to find mapped user: %v", err)
	}
	loaded, err := authSvc.GetUserByID(context.Background(), mappedUser.ID)
	if err != nil {
		t.Fatalf("failed to load mapped user: %v", err)
	}
	if loaded.EffectiveRole() != models.RoleAdmin {
		t.Fatalf("unexpected role: got=%s want=%s", loaded.EffectiveRole(), models.RoleAdmin)
	}
	overrides, err := app.loadUserCenterPermissionOverrides(context.Background())
	if err != nil {
		t.Fatalf("failed to read permission overrides: %v", err)
	}
	permissions := overrides[loaded.ID]
	if len(permissions) != 1 || permissions[0] != userCenterPermissionAccountsRead {
		t.Fatalf("unexpected permission override: %#v", permissions)
	}
}

func TestAPIUserCenterSyncFullDisablesMissingAccounts(t *testing.T) {
	app, authSvc, oauthSvc, superAdmin, _ := setupUserCenterTestApp(t)

	existing, err := authSvc.Register(context.Background(), "sync-existing", "Member123!")
	if err != nil {
		t.Fatalf("failed to create existing account: %v", err)
	}
	_, err = oauthSvc.UpsertGrant(context.Background(), services.UpsertOAuthGrantInput{
		UserID:         existing.ID,
		Provider:       models.OAuthProviderDingTalkSync,
		ExternalUserID: "dd-legacy-1",
		AccessToken:    "sync-token-legacy",
		ExpiresAt:      time.Now().UTC().Add(2 * time.Hour),
	})
	if err != nil {
		t.Fatalf("failed to create legacy mapping: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/user-center/sync",
		strings.NewReader(`{"provider":"dingtalk","mode":"full","force_sign_out_disabled":true,"users":[{"external_user_id":"dd-2002","username":"sync-new","role":"member","status":"active"}]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &superAdmin)
	recorder := httptest.NewRecorder()

	app.handleAPIUserCenterSync(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if got, ok := payload["disabled_count"].(float64); !ok || int(got) != 1 {
		t.Fatalf("unexpected disabled_count: %#v", payload["disabled_count"])
	}

	updated, err := authSvc.GetUserByID(context.Background(), existing.ID)
	if err != nil {
		t.Fatalf("failed to reload existing account: %v", err)
	}
	if updated.Status != models.UserStatusDisabled {
		t.Fatalf("expected disabled status, got=%s", updated.Status)
	}
	if updated.ForceLogoutAt == nil {
		t.Fatalf("expected force logout timestamp for disabled account")
	}
}

func TestAPIUserCenterPermissionsUpdateAndGet(t *testing.T) {
	app, authSvc, _, superAdmin, _ := setupUserCenterTestApp(t)

	target, err := authSvc.Register(context.Background(), "permissions-target", "Member123!")
	if err != nil {
		t.Fatalf("failed to create target user: %v", err)
	}

	updateReq := httptest.NewRequest(
		http.MethodPost,
		fmt.Sprintf("/api/v1/admin/user-center/permissions/%d", target.ID),
		strings.NewReader(`{"permissions":["user_center.accounts.sync","user_center.accounts.read"]}`),
	)
	updateReq.Header.Set("Content-Type", "application/json")
	updateReq = withCurrentUser(updateReq, &superAdmin)
	updateReq = withURLParam(updateReq, "userID", fmt.Sprintf("%d", target.ID))
	updateRecorder := httptest.NewRecorder()

	app.handleAPIUserCenterPermissionsUpdate(updateRecorder, updateReq)

	if updateRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", updateRecorder.Code, http.StatusOK)
	}

	getReq := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/user-center/permissions/%d", target.ID), nil)
	getReq = withCurrentUser(getReq, &superAdmin)
	getReq = withURLParam(getReq, "userID", fmt.Sprintf("%d", target.ID))
	getRecorder := httptest.NewRecorder()

	app.handleAPIUserCenterPermissionsGet(getRecorder, getReq)

	if getRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", getRecorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, getRecorder)
	if source, _ := payload["permission_source"].(string); source != "override" {
		t.Fatalf("unexpected permission source: %#v", payload["permission_source"])
	}
	effective := decodeStringSliceField(t, payload, "effective_permissions")
	if strings.Join(effective, ",") != "user_center.accounts.read,user_center.accounts.sync" {
		t.Fatalf("unexpected effective permissions: %#v", effective)
	}
}

func TestAPIUserCenterPermissionsGetUnauthorized(t *testing.T) {
	app, _, _, _, _ := setupUserCenterTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/user-center/permissions/12", nil)
	req.Header.Set("X-Request-ID", "req-user-center-permissions-unauthorized")
	req = withURLParam(req, "userID", "12")
	recorder := httptest.NewRecorder()

	app.handleAPIUserCenterPermissionsGet(recorder, req)

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
	if payload["request_id"] != "req-user-center-permissions-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIUserCenterPermissionsGetInvalidUserID(t *testing.T) {
	app, _, _, superAdmin, _ := setupUserCenterTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/user-center/permissions/invalid", nil)
	req.Header.Set("X-Request-ID", "req-user-center-permissions-invalid-user")
	req = withCurrentUser(req, &superAdmin)
	req = withURLParam(req, "userID", "invalid")
	recorder := httptest.NewRecorder()

	app.handleAPIUserCenterPermissionsGet(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_user_id" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Invalid user id" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-user-center-permissions-invalid-user" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIUserCenterPermissionOverrideAllowsMemberRead(t *testing.T) {
	app, _, _, _, member := setupUserCenterTestApp(t)

	if err := app.setUserCenterPermissionOverride(context.Background(), member.ID, []string{userCenterPermissionAccountsRead}); err != nil {
		t.Fatalf("failed to set permission override: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/user-center/accounts", nil)
	req = withCurrentUser(req, &member)
	recorder := httptest.NewRecorder()

	app.handleAPIUserCenterAccounts(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if got, ok := payload["total"].(float64); !ok || int(got) < 2 {
		t.Fatalf("unexpected total count: %#v", payload["total"])
	}
}

func TestAPIUserCenterSyncInvalidProvider(t *testing.T) {
	app, _, _, superAdmin, _ := setupUserCenterTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/user-center/sync",
		strings.NewReader(`{"provider":"unknown","mode":"incremental","users":[{"external_user_id":"x-1","username":"sync-user"}]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-user-center-sync-invalid-provider")
	req = withCurrentUser(req, &superAdmin)
	recorder := httptest.NewRecorder()

	app.handleAPIUserCenterSync(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_provider" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Invalid sync provider" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-user-center-sync-invalid-provider" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
