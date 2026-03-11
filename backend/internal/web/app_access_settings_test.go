package web

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"github.com/go-chi/chi/v5"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAccessSettingsTestApp(t *testing.T) *App {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.SystemSetting{}); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.SyncJobRun{}, &models.AsyncJob{}, &models.AuditLog{}); err != nil {
		t.Fatalf("failed to migrate sqlite db for sync jobs, async jobs, and audit logs: %v", err)
	}
	settingsSvc := services.NewSettingsService(db)
	return &App{
		authService:     services.NewAuthService(db),
		settingsService: settingsSvc,
		syncPolicyService: services.NewRepositorySyncPolicyService(settingsSvc, services.RepositorySyncPolicy{
			Enabled:   false,
			Interval:  30 * time.Minute,
			Timeout:   10 * time.Minute,
			BatchSize: 20,
		}),
		syncJobSvc:        services.NewSyncJobService(db),
		asyncJobSvc:       services.NewAsyncJobService(db),
		auditService:      services.NewAuditService(db),
		opsService:        services.NewOpsService(db),
		allowRegistration: true,
	}
}

func withCurrentUser(req *http.Request, user *models.User) *http.Request {
	ctx := context.WithValue(req.Context(), currentUserKey, user)
	return req.WithContext(ctx)
}

func withURLParam(req *http.Request, key string, value string) *http.Request {
	routeCtx := chi.NewRouteContext()
	routeCtx.URLParams.Add(key, value)
	ctx := context.WithValue(req.Context(), chi.RouteCtxKey, routeCtx)
	return req.WithContext(ctx)
}

func decodeBodyMap(t *testing.T, recorder *httptest.ResponseRecorder) map[string]any {
	t.Helper()
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode response body: %v", err)
	}
	return payload
}

func TestAPIAdminRegistrationSettingUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/registration", nil)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRegistrationSetting(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
}

func TestAPIAdminRegistrationSettingForbidden(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/registration", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRegistrationSetting(recorder, req)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
}

func TestAPIAdminRegistrationSettingSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	if err := app.settingsService.SetBool(context.Background(), services.SettingAllowRegistration, false); err != nil {
		t.Fatalf("failed to seed registration setting: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/registration", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRegistrationSetting(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	allowRegistration, ok := payload["allow_registration"].(bool)
	if !ok {
		t.Fatalf("missing allow_registration in response: %#v", payload)
	}
	if allowRegistration {
		t.Fatalf("expected allow_registration=false")
	}
}

func TestAPIAdminRegistrationSettingUpdateSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/settings/registration",
		strings.NewReader(`{"allow_registration":false}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRegistrationSettingUpdate(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	allowRegistration, ok := payload["allow_registration"].(bool)
	if !ok {
		t.Fatalf("missing allow_registration in response: %#v", payload)
	}
	if allowRegistration {
		t.Fatalf("expected allow_registration=false")
	}

	persisted, err := app.settingsService.GetBool(context.Background(), services.SettingAllowRegistration, true)
	if err != nil {
		t.Fatalf("failed to read persisted setting: %v", err)
	}
	if persisted {
		t.Fatalf("expected persisted allow_registration=false")
	}
}

func TestAPIAdminRegistrationSettingUpdateInvalidPayload(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/settings/registration",
		strings.NewReader(`{"allow_registration":"maybe"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRegistrationSettingUpdate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
}

func TestAdminAccessRegistrationUpdateForm(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	form := url.Values{}
	form.Set("allow_registration", "true")
	req := httptest.NewRequest(
		http.MethodPost,
		"/admin/access/registration?section=access",
		strings.NewReader(form.Encode()),
	)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAdminAccessRegistrationUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.HasPrefix(location, "/admin/access?msg=") {
		t.Fatalf("unexpected redirect location: %s", location)
	}

	persisted, err := app.settingsService.GetBool(context.Background(), services.SettingAllowRegistration, false)
	if err != nil {
		t.Fatalf("failed to read persisted setting: %v", err)
	}
	if !persisted {
		t.Fatalf("expected persisted allow_registration=true")
	}
}

func TestAdminAccessRegistrationUpdatePermissionDenied(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/admin/access/registration", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAdminAccessRegistrationUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "err=Permission+denied") {
		t.Fatalf("expected permission denied redirect, got=%s", location)
	}
}

func TestAdminAccessAuthProvidersUpdateForm(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	form := url.Values{}
	form.Add("auth_providers", "github")
	form.Add("auth_providers", "microsoft")
	form.Add("auth_providers", "invalid-provider")
	req := httptest.NewRequest(
		http.MethodPost,
		"/admin/access/auth-providers?section=access",
		strings.NewReader(form.Encode()),
	)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAdminAccessAuthProvidersUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.HasPrefix(location, "/admin/access?msg=") {
		t.Fatalf("unexpected redirect location: %s", location)
	}

	persisted, err := app.settingsService.Get(context.Background(), services.SettingAuthEnabledProviders, "")
	if err != nil {
		t.Fatalf("failed to read persisted auth providers setting: %v", err)
	}
	if persisted != "github,microsoft" {
		t.Fatalf("unexpected persisted auth providers: got=%s want=github,microsoft", persisted)
	}
}

func TestAdminAccessAuthProvidersUpdatePermissionDenied(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/admin/access/auth-providers", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAdminAccessAuthProvidersUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "err=Permission+denied") {
		t.Fatalf("expected permission denied redirect, got=%s", location)
	}
}

func TestAdminAccessAuthProvidersUpdateAllowsEmptySelection(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/admin/access/auth-providers?section=access",
		strings.NewReader(""),
	)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAdminAccessAuthProvidersUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}

	persisted, err := app.settingsService.Get(context.Background(), services.SettingAuthEnabledProviders, "fallback")
	if err != nil {
		t.Fatalf("failed to read persisted auth providers setting: %v", err)
	}
	if persisted != "" {
		t.Fatalf("unexpected persisted auth providers: got=%s want=<empty>", persisted)
	}
}

func TestAPIAdminRepositorySyncPolicy(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-policy/repository", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRepositorySyncPolicy(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if _, ok := payload["batch_size"].(float64); !ok {
		t.Fatalf("missing batch_size in response: %#v", payload)
	}
}

func TestAPIAdminRepositorySyncPolicyUpdate(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/sync-policy/repository",
		strings.NewReader(`{"enabled":true,"interval":"15m","timeout":"3m","batch_size":42}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminRepositorySyncPolicyUpdate(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	enabled, ok := payload["enabled"].(bool)
	if !ok || !enabled {
		t.Fatalf("unexpected enabled in response: %#v", payload)
	}
}

func TestAPIAdminSyncJobDetailPermission(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(11)
	recorded, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:     "manual",
		Scope:       "owned",
		OwnerUserID: &ownerID,
		Candidates:  2,
		Synced:      2,
		Failed:      0,
		StartedAt:   time.Now().UTC().Add(-2 * time.Second),
		FinishedAt:  time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create sync run: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/sync-jobs/%d", recorded.ID), nil)
	req = withCurrentUser(req, &models.User{ID: 99, Role: models.RoleMember})
	req = withURLParam(req, "runID", fmt.Sprintf("%d", recorded.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncJobDetail(recorder, req)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}

	reqOwner := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/sync-jobs/%d", recorded.ID), nil)
	reqOwner = withCurrentUser(reqOwner, &models.User{ID: ownerID, Role: models.RoleMember})
	reqOwner = withURLParam(reqOwner, "runID", fmt.Sprintf("%d", recorded.ID))
	recorderOwner := httptest.NewRecorder()

	app.handleAPIAdminSyncJobDetail(recorderOwner, reqOwner)
	if recorderOwner.Code != http.StatusOK {
		t.Fatalf("unexpected owner status code: got=%d want=%d", recorderOwner.Code, http.StatusOK)
	}
}

func TestAPIAdminSyncJobDetailUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-jobs/1", nil)
	req = withURLParam(req, "runID", "1")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncJobDetail(recorder, req)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
}

func TestAPIAdminSyncJobDetailInvalidRunID(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-jobs/invalid", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	req = withURLParam(req, "runID", "invalid")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncJobDetail(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
}

func TestAPIAdminSyncJobDetailNotFound(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/sync-jobs/777", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleAdmin})
	req = withURLParam(req, "runID", "777")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncJobDetail(recorder, req)
	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
}

func TestAPIAdminSyncJobDetailActorCanRead(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	ownerID := uint(7)
	actorID := uint(22)
	recorded, err := app.syncJobSvc.RecordRun(context.Background(), services.RecordSyncRunInput{
		Trigger:     "scheduled",
		Scope:       "all",
		OwnerUserID: &ownerID,
		ActorUserID: &actorID,
		Candidates:  3,
		Synced:      3,
		Failed:      0,
		StartedAt:   time.Now().UTC().Add(-3 * time.Second),
		FinishedAt:  time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to create sync run: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/admin/sync-jobs/%d", recorded.ID), nil)
	req = withCurrentUser(req, &models.User{ID: actorID, Role: models.RoleMember})
	req = withURLParam(req, "runID", fmt.Sprintf("%d", recorded.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminSyncJobDetail(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
}
