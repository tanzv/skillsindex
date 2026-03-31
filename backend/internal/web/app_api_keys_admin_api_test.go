package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAdminAPIKeyAPITestApp(t *testing.T) (*App, *services.APIKeyService, models.User, models.User, models.User) {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.APIKey{}); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	superAdmin := models.User{Username: "super", PasswordHash: "hash", Role: models.RoleSuperAdmin}
	member := models.User{Username: "member", PasswordHash: "hash", Role: models.RoleMember}
	other := models.User{Username: "other", PasswordHash: "hash", Role: models.RoleMember}
	if err := db.Create(&superAdmin).Error; err != nil {
		t.Fatalf("failed to seed super admin: %v", err)
	}
	if err := db.Create(&member).Error; err != nil {
		t.Fatalf("failed to seed member: %v", err)
	}
	if err := db.Create(&other).Error; err != nil {
		t.Fatalf("failed to seed other user: %v", err)
	}

	svc := services.NewAPIKeyService(db)
	app := &App{
		authService:   services.NewAuthService(db),
		apiKeyService: svc,
	}
	return app, svc, superAdmin, member, other
}

func TestAPIAdminAPIKeysListUnauthorized(t *testing.T) {
	app, _, _, _, _ := setupAdminAPIKeyAPITestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/apikeys", nil)
	req.Header.Set("X-Request-ID", "req-admin-apikey-list-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeys(recorder, req)
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
	if payload["request_id"] != "req-admin-apikey-list-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAPIKeysListOwnOnlyForMember(t *testing.T) {
	app, svc, _, member, other := setupAdminAPIKeyAPITestApp(t)
	_, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{UserID: member.ID, Name: "member-key"})
	if err != nil {
		t.Fatalf("failed to create member key: %v", err)
	}
	_, _, err = svc.Create(context.Background(), services.CreateAPIKeyInput{UserID: other.ID, Name: "other-key"})
	if err != nil {
		t.Fatalf("failed to create other key: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/apikeys", nil)
	req = withCurrentUser(req, &member)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeys(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if total, ok := payload["total"].(float64); !ok || int(total) != 1 {
		t.Fatalf("unexpected total: %#v", payload["total"])
	}
	items, ok := payload["items"].([]any)
	if !ok || len(items) != 1 {
		t.Fatalf("unexpected items payload: %#v", payload["items"])
	}
	item, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected item shape: %#v", items[0])
	}
	if got, ok := item["user_id"].(float64); !ok || uint(got) != member.ID {
		t.Fatalf("unexpected owner user id: %#v", item["user_id"])
	}
}

func TestAPIAdminAPIKeysListSuperAdminFilters(t *testing.T) {
	app, svc, superAdmin, member, other := setupAdminAPIKeyAPITestApp(t)
	_, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{UserID: member.ID, Name: "member-active"})
	if err != nil {
		t.Fatalf("failed to create member key: %v", err)
	}
	otherKey, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{UserID: other.ID, Name: "other-revoked"})
	if err != nil {
		t.Fatalf("failed to create other key: %v", err)
	}
	if err := svc.Revoke(context.Background(), otherKey.ID, other.ID); err != nil {
		t.Fatalf("failed to revoke key: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/apikeys?owner=member&status=active", nil)
	req = withCurrentUser(req, &superAdmin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeys(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if total, ok := payload["total"].(float64); !ok || int(total) != 1 {
		t.Fatalf("unexpected total: %#v", payload["total"])
	}
	items := payload["items"].([]any)
	item := items[0].(map[string]any)
	if item["owner_username"] != member.Username {
		t.Fatalf("unexpected owner username: %#v", item["owner_username"])
	}
}

func TestAPIAdminAPIKeysCreatePermissionDeniedForForeignOwner(t *testing.T) {
	app, _, _, member, other := setupAdminAPIKeyAPITestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/apikeys",
		strings.NewReader(fmt.Sprintf(`{"name":"forbidden","owner_user_id":%d}`, other.ID)),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &member)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeysCreate(recorder, req)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
}

func TestAPIAdminAPIKeysCreateBySuperAdminForTargetOwner(t *testing.T) {
	app, svc, superAdmin, member, _ := setupAdminAPIKeyAPITestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/apikeys",
		strings.NewReader(fmt.Sprintf(`{"name":"delegated","owner_user_id":%d,"expires_in_days":7,"scopes":["skills.search.read"]}`, member.ID)),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &superAdmin)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeysCreate(recorder, req)
	if recorder.Code != http.StatusCreated {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusCreated)
	}
	payload := decodeBodyMap(t, recorder)
	token, ok := payload["plaintext_key"].(string)
	if !ok || !strings.HasPrefix(token, "sk_live_") {
		t.Fatalf("unexpected plaintext key: %#v", payload["plaintext_key"])
	}
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item: %#v", payload)
	}
	if got, ok := item["user_id"].(float64); !ok || uint(got) != member.ID {
		t.Fatalf("unexpected item user_id: %#v", item["user_id"])
	}

	key, valid, err := svc.Validate(context.Background(), token)
	if err != nil {
		t.Fatalf("validate new key failed: %v", err)
	}
	if !valid || key.UserID != member.ID {
		t.Fatalf("validated key mismatch: valid=%v owner=%d", valid, key.UserID)
	}
}

func TestAPIAdminAPIKeysCreateInvalidScope(t *testing.T) {
	app, _, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/apikeys",
		strings.NewReader(`{"name":"bad-scope","scopes":["invalid.scope"]}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &member)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeysCreate(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
}

func TestAPIAdminAPIKeysCreateInvalidPayload(t *testing.T) {
	app, _, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/apikeys",
		strings.NewReader(`{"name":`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-admin-apikey-create-invalid-payload")
	req = withCurrentUser(req, &member)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeysCreate(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-admin-apikey-create-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAPIKeysRevokePermissionDenied(t *testing.T) {
	app, svc, _, member, other := setupAdminAPIKeyAPITestApp(t)
	key, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{UserID: other.ID, Name: "other-key"})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/v1/admin/apikeys/%d/revoke", key.ID), nil)
	req = withCurrentUser(req, &member)
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", key.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeyRevoke(recorder, req)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
}

func TestAPIAdminAPIKeysRevokeInvalidKeyID(t *testing.T) {
	app, _, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/apikeys/invalid/revoke", nil)
	req.Header.Set("X-Request-ID", "req-admin-apikey-revoke-invalid-key")
	req = withCurrentUser(req, &member)
	req = withRouteParam(req, "keyID", "invalid")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeyRevoke(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_key_id" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-admin-apikey-revoke-invalid-key" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminAPIKeysRotateSuccess(t *testing.T) {
	app, svc, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	created, oldToken, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: member.ID,
		Name:   "rotate-key",
		Scopes: []string{services.APIKeyScopeSkillsSearchRead},
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/v1/admin/apikeys/%d/rotate", created.ID), nil)
	req = withCurrentUser(req, &member)
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", created.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeyRotate(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	newToken, ok := payload["plaintext_key"].(string)
	if !ok || !strings.HasPrefix(newToken, "sk_live_") {
		t.Fatalf("unexpected plaintext key: %#v", payload["plaintext_key"])
	}

	_, oldValid, err := svc.Validate(context.Background(), oldToken)
	if err != nil {
		t.Fatalf("validate old token failed: %v", err)
	}
	if oldValid {
		t.Fatalf("old token should be invalid after rotate")
	}
	rotated, newValid, err := svc.Validate(context.Background(), newToken)
	if err != nil {
		t.Fatalf("validate new token failed: %v", err)
	}
	if !newValid || rotated.UserID != member.ID {
		t.Fatalf("new token validation mismatch: valid=%v owner=%d", newValid, rotated.UserID)
	}
}

func TestAPIAdminAPIKeysRotateUnauthorized(t *testing.T) {
	app, svc, _, member, _ := setupAdminAPIKeyAPITestApp(t)
	created, _, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: member.ID,
		Name:   "rotate-unauthorized",
	})
	if err != nil {
		t.Fatalf("failed to create key: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/v1/admin/apikeys/%d/rotate", created.ID), nil)
	req.Header.Set("X-Request-ID", "req-admin-apikey-rotate-unauthorized")
	req = withRouteParam(req, "keyID", fmt.Sprintf("%d", created.ID))
	recorder := httptest.NewRecorder()

	app.handleAPIAdminAPIKeyRotate(recorder, req)
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
	if payload["request_id"] != "req-admin-apikey-rotate-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
