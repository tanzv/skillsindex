package web

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
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

func setupAPIKeyMiddlewareTestApp(t *testing.T) (*App, uint, *services.APIKeyService, *gorm.DB) {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.APIKey{}); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}
	user := models.User{
		Username:     "scope-member",
		PasswordHash: "hash",
		Role:         models.RoleMember,
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	svc := services.NewAPIKeyService(db)
	app := &App{
		apiKeyService: svc,
		apiKeys:       map[string]struct{}{},
	}
	return app, user.ID, svc, db
}

func hashAPIKeyForMiddlewareTest(raw string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(raw)))
	return hex.EncodeToString(sum[:])
}

func TestRequireAPIKeyAllowsMatchingScope(t *testing.T) {
	app, userID, svc, _ := setupAPIKeyMiddlewareTestApp(t)
	_, token, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: userID,
		Scopes: []string{services.APIKeyScopeSkillsSearchRead},
	})
	if err != nil {
		t.Fatalf("failed to create scoped key: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/search?api_key="+token, nil)
	recorder := httptest.NewRecorder()
	handler := app.requireAPIKey(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	handler.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusNoContent {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNoContent)
	}
}

func TestRequireAPIKeyRejectsMissingScope(t *testing.T) {
	app, userID, svc, _ := setupAPIKeyMiddlewareTestApp(t)
	_, token, err := svc.Create(context.Background(), services.CreateAPIKeyInput{
		UserID: userID,
		Scopes: []string{services.APIKeyScopeSkillsSearchRead},
	})
	if err != nil {
		t.Fatalf("failed to create scoped key: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/ai-search?api_key="+token, nil)
	req.Header.Set("X-Request-ID", "req-api-key-scope-denied-stored")
	recorder := httptest.NewRecorder()
	handler := app.requireAPIKey(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	handler.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode response payload: %v", err)
	}
	if got, _ := payload["error"].(string); got != "api_key_scope_denied" {
		t.Fatalf("unexpected error code: %#v", payload["error"])
	}
	if payload["request_id"] != "req-api-key-scope-denied-stored" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestRequireAPIKeyRejectsEmptyStoredScopesForProtectedRoute(t *testing.T) {
	app, userID, _, db := setupAPIKeyMiddlewareTestApp(t)
	token := "sk_live_empty_scope_case"
	key := models.APIKey{
		UserID:  userID,
		Name:    "Empty Stored Scope Token",
		Prefix:  token[:16],
		KeyHash: hashAPIKeyForMiddlewareTest(token),
		Scopes:  "",
	}
	if err := db.Create(&key).Error; err != nil {
		t.Fatalf("failed to create api key with empty scopes: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/search?api_key="+token, nil)
	req.Header.Set("X-Request-ID", "req-api-key-scope-denied-empty")
	recorder := httptest.NewRecorder()
	handler := app.requireAPIKey(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	handler.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode response payload: %v", err)
	}
	if got, _ := payload["error"].(string); got != "api_key_scope_denied" {
		t.Fatalf("unexpected error code: %#v", payload["error"])
	}
	if payload["request_id"] != "req-api-key-scope-denied-empty" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestRequireAPIKeyRejectsStaticKeyOnProtectedRoute(t *testing.T) {
	app, _, _, _ := setupAPIKeyMiddlewareTestApp(t)
	app.apiKeys["static-token"] = struct{}{}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/search?api_key=static-token", nil)
	req.Header.Set("X-Request-ID", "req-api-key-scope-denied-static")
	recorder := httptest.NewRecorder()
	handler := app.requireAPIKey(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	handler.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode response payload: %v", err)
	}
	if got, _ := payload["error"].(string); got != "api_key_scope_denied" {
		t.Fatalf("unexpected error code: %#v", payload["error"])
	}
	if payload["request_id"] != "req-api-key-scope-denied-static" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestRequireAPIKeyRejectsInvalidToken(t *testing.T) {
	app, _, _, _ := setupAPIKeyMiddlewareTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/skills/search?api_key=invalid", nil)
	req.Header.Set("X-Request-ID", "req-api-key-invalid")
	recorder := httptest.NewRecorder()
	handler := app.requireAPIKey(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	handler.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode response payload: %v", err)
	}
	if got, _ := payload["error"].(string); got != "api_key_invalid" {
		t.Fatalf("unexpected error code: %#v", payload["error"])
	}
	if payload["request_id"] != "req-api-key-invalid" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
