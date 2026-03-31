package web

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupDingTalkHandlersTestApp(t *testing.T) (*App, *gorm.DB, models.User) {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.OAuthGrant{}); err != nil {
		t.Fatalf("failed to migrate dingtalk handler models: %v", err)
	}

	authSvc := services.NewAuthService(db)
	oauthSvc := services.NewOAuthGrantService(db)

	user, err := authSvc.Register(context.Background(), "dingtalk-user", "DingTalk123!")
	if err != nil {
		t.Fatalf("failed to create dingtalk user: %v", err)
	}
	user, err = authSvc.GetUserByID(context.Background(), user.ID)
	if err != nil {
		t.Fatalf("failed to reload dingtalk user: %v", err)
	}

	app := &App{
		authService:       authSvc,
		oauthGrantService: oauthSvc,
	}
	return app, db, user
}

func newDingTalkServiceForTest(serverURL string) *services.DingTalkService {
	return services.NewDingTalkService(services.DingTalkConfig{
		ClientID:     "test-client-id",
		ClientSecret: "test-client-secret",
		RedirectURL:  "https://example.com/auth/dingtalk/callback",
		APIBaseURL:   serverURL,
	})
}

func TestHandleDingTalkMeUnauthorizedIncludesRequestID(t *testing.T) {
	app, _, _ := setupDingTalkHandlersTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/dingtalk/me", nil)
	req.Header.Set("X-Request-ID", "req-dingtalk-me-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleDingTalkMe(recorder, req)

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
	if payload["request_id"] != "req-dingtalk-me-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleDingTalkMeServiceUnavailableIncludesRequestID(t *testing.T) {
	app, _, user := setupDingTalkHandlersTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/dingtalk/me", nil)
	req.Header.Set("X-Request-ID", "req-dingtalk-me-service-unavailable")
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleDingTalkMe(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusServiceUnavailable)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "service_unavailable" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "DingTalk integration is not configured" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-dingtalk-me-service-unavailable" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleDingTalkMeGrantQueryFailureHidesInternalError(t *testing.T) {
	app, db, user := setupDingTalkHandlersTestApp(t)
	app.dingTalkService = newDingTalkServiceForTest("https://api.dingtalk.test")

	if err := db.Migrator().DropTable(&models.OAuthGrant{}); err != nil {
		t.Fatalf("failed to drop oauth grants table: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/dingtalk/me", nil)
	req.Header.Set("X-Request-ID", "req-dingtalk-me-grant-query-failed")
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleDingTalkMe(recorder, req)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusInternalServerError)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "grant_query_failed" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Failed to query authorization grant" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-dingtalk-me-grant-query-failed" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleDingTalkMeAPIQueryFailureIncludesRequestID(t *testing.T) {
	app, _, user := setupDingTalkHandlersTestApp(t)

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1.0/contact/users/me" {
			http.NotFound(w, r)
			return
		}
		http.Error(w, "upstream exploded", http.StatusInternalServerError)
	}))
	defer server.Close()

	app.dingTalkService = newDingTalkServiceForTest(server.URL)
	_, err := app.oauthGrantService.UpsertGrant(context.Background(), services.UpsertOAuthGrantInput{
		UserID:         user.ID,
		Provider:       models.OAuthProviderDingTalk,
		ExternalUserID: "dd-user-1",
		AccessToken:    "token-123",
		ExpiresAt:      time.Now().UTC().Add(1 * time.Hour),
	})
	if err != nil {
		t.Fatalf("failed to seed oauth grant: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/dingtalk/me", nil)
	req.Header.Set("X-Request-ID", "req-dingtalk-me-api-failed")
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleDingTalkMe(recorder, req)

	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadGateway)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "dingtalk_api_failed" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Failed to query DingTalk personal profile" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-dingtalk-me-api-failed" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleDingTalkMeSuccess(t *testing.T) {
	app, _, user := setupDingTalkHandlersTestApp(t)

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1.0/contact/users/me" {
			http.NotFound(w, r)
			return
		}
		_ = json.NewEncoder(w).Encode(map[string]any{
			"nick":      "DingTalk User",
			"openId":    "open-123",
			"unionId":   "union-123",
			"avatarUrl": "https://example.com/avatar.png",
		})
	}))
	defer server.Close()

	app.dingTalkService = newDingTalkServiceForTest(server.URL)
	grantExpiresAt := time.Now().UTC().Add(1 * time.Hour)
	_, err := app.oauthGrantService.UpsertGrant(context.Background(), services.UpsertOAuthGrantInput{
		UserID:         user.ID,
		Provider:       models.OAuthProviderDingTalk,
		ExternalUserID: "dd-user-1",
		AccessToken:    "token-123",
		ExpiresAt:      grantExpiresAt,
	})
	if err != nil {
		t.Fatalf("failed to seed oauth grant: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/dingtalk/me", nil)
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleDingTalkMe(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["profile_display"] != "DingTalk User" {
		t.Fatalf("unexpected profile display: %#v", payload)
	}
	if payload["profile_open_id"] != "open-123" {
		t.Fatalf("unexpected profile open id: %#v", payload)
	}
	if payload["provider"] != string(models.OAuthProviderDingTalk) {
		t.Fatalf("unexpected provider: %#v", payload)
	}
}
