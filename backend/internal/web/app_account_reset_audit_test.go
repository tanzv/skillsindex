package web

import (
	"context"
	"errors"
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

func setupPasswordResetAuditTestApp(t *testing.T) (*App, *services.AuthService, *gorm.DB, models.User) {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.UserSession{}, &models.PasswordResetToken{}, &models.SystemSetting{}, &models.AuditLog{}); err != nil {
		t.Fatalf("failed to migrate password reset audit models: %v", err)
	}

	authSvc := services.NewAuthService(db)
	userSessionSvc := services.NewUserSessionService(db)
	settingsSvc := services.NewSettingsService(db)
	user, err := authSvc.Register(context.Background(), "account-user", "Account123!")
	if err != nil {
		t.Fatalf("failed to create account user: %v", err)
	}

	app := &App{
		authService:     authSvc,
		sessionService:  services.NewSessionService("test-secret", false),
		userSessionSvc:  userSessionSvc,
		auditService:    services.NewAuditService(db),
		settingsService: settingsSvc,
		cookieSecure:    false,
	}
	return app, authSvc, db, user
}

func latestAuditLogForAction(t *testing.T, app *App, action string) models.AuditLog {
	t.Helper()

	logs, err := app.auditService.ListRecent(context.Background(), services.ListAuditInput{Limit: 20})
	if err != nil {
		t.Fatalf("failed to list audit logs: %v", err)
	}
	for _, item := range logs {
		if item.Action == action {
			return item
		}
	}
	t.Fatalf("missing audit log for action %s", action)
	return models.AuditLog{}
}

func TestHandleAPIAccountPasswordResetRequestWritesAcceptedAudit(t *testing.T) {
	app, _, _, _ := setupPasswordResetAuditTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/account/password-reset/request",
		strings.NewReader(`{"username":"missing-user"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-reset-request-accepted")
	req.Header.Set("X-Real-IP", "203.0.113.30")
	recorder := httptest.NewRecorder()

	app.handleAPIAccountPasswordResetRequest(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	logItem := latestAuditLogForAction(t, app, "password_reset_request")
	if logItem.ActorUserID != nil {
		t.Fatalf("expected anonymous password reset request audit, got actor=%v", *logItem.ActorUserID)
	}
	if logItem.Result != "accepted" {
		t.Fatalf("unexpected result: got=%q want=%q", logItem.Result, "accepted")
	}
	if logItem.RequestID != "req-reset-request-accepted" {
		t.Fatalf("unexpected request id: got=%q want=%q", logItem.RequestID, "req-reset-request-accepted")
	}
	if logItem.SourceIP != "203.0.113.30" {
		t.Fatalf("unexpected source ip: got=%q want=%q", logItem.SourceIP, "203.0.113.30")
	}
}

func TestHandleAPIAccountPasswordResetRequestWritesRateLimitedAudit(t *testing.T) {
	app, authSvc, _, user := setupPasswordResetAuditTestApp(t)

	for index := 0; index < 5; index++ {
		if _, err := authSvc.RequestPasswordReset(context.Background(), user.Username, "203.0.113.31"); err != nil {
			t.Fatalf("failed to seed password reset request %d: %v", index+1, err)
		}
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/account/password-reset/request",
		strings.NewReader(`{"username":"`+user.Username+`"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-reset-request-rate-limited")
	req.Header.Set("X-Real-IP", "203.0.113.31")
	recorder := httptest.NewRecorder()

	app.handleAPIAccountPasswordResetRequest(recorder, req)

	if recorder.Code != http.StatusTooManyRequests {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusTooManyRequests)
	}

	logItem := latestAuditLogForAction(t, app, "password_reset_request")
	if logItem.Result != "rate_limited" {
		t.Fatalf("unexpected result: got=%q want=%q", logItem.Result, "rate_limited")
	}
	if logItem.Reason != "password reset request rate limited" {
		t.Fatalf("unexpected reason: got=%q want=%q", logItem.Reason, "password reset request rate limited")
	}
	if logItem.RequestID != "req-reset-request-rate-limited" {
		t.Fatalf("unexpected request id: got=%q want=%q", logItem.RequestID, "req-reset-request-rate-limited")
	}
	if logItem.SourceIP != "203.0.113.31" {
		t.Fatalf("unexpected source ip: got=%q want=%q", logItem.SourceIP, "203.0.113.31")
	}
}

func TestHandleAPIAccountPasswordResetConfirmWritesSuccessAudit(t *testing.T) {
	app, authSvc, _, user := setupPasswordResetAuditTestApp(t)
	token, err := authSvc.RequestPasswordReset(context.Background(), user.Username, "127.0.0.1")
	if err != nil {
		t.Fatalf("failed to request password reset token: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/account/password-reset/confirm",
		strings.NewReader(`{"token":"`+token+`","new_password":"Account234!"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-reset-confirm-success")
	req.Header.Set("X-Real-IP", "203.0.113.32")
	recorder := httptest.NewRecorder()

	app.handleAPIAccountPasswordResetConfirm(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	logItem := latestAuditLogForAction(t, app, "password_reset_confirm")
	if logItem.ActorUserID == nil || *logItem.ActorUserID != user.ID {
		t.Fatalf("unexpected actor user id: got=%v want=%d", logItem.ActorUserID, user.ID)
	}
	if logItem.Result != "success" {
		t.Fatalf("unexpected result: got=%q want=%q", logItem.Result, "success")
	}
	if logItem.RequestID != "req-reset-confirm-success" {
		t.Fatalf("unexpected request id: got=%q want=%q", logItem.RequestID, "req-reset-confirm-success")
	}
	if logItem.SourceIP != "203.0.113.32" {
		t.Fatalf("unexpected source ip: got=%q want=%q", logItem.SourceIP, "203.0.113.32")
	}
}

func TestHandleAPIAccountPasswordResetConfirmWritesRejectedAudit(t *testing.T) {
	testCases := []struct {
		name       string
		setupToken func(t *testing.T, db *gorm.DB, authSvc *services.AuthService, user models.User) string
		wantError  string
		wantReason string
	}{
		{
			name: "invalid",
			setupToken: func(_ *testing.T, _ *gorm.DB, _ *services.AuthService, _ models.User) string {
				return "invalid-token"
			},
			wantError:  "invalid_reset_token",
			wantReason: "password reset token is invalid",
		},
		{
			name: "expired",
			setupToken: func(t *testing.T, db *gorm.DB, authSvc *services.AuthService, user models.User) string {
				t.Helper()
				token, err := authSvc.RequestPasswordReset(context.Background(), user.Username, "127.0.0.1")
				if err != nil {
					t.Fatalf("failed to request password reset token: %v", err)
				}
				if err := db.Model(&models.PasswordResetToken{}).
					Where("user_id = ?", user.ID).
					Update("expires_at", time.Now().UTC().Add(-time.Minute)).Error; err != nil {
					t.Fatalf("failed to expire password reset token: %v", err)
				}
				return token
			},
			wantError:  "expired_reset_token",
			wantReason: "password reset token is expired",
		},
		{
			name: "used",
			setupToken: func(t *testing.T, db *gorm.DB, authSvc *services.AuthService, user models.User) string {
				t.Helper()
				token, err := authSvc.RequestPasswordReset(context.Background(), user.Username, "127.0.0.1")
				if err != nil {
					t.Fatalf("failed to request password reset token: %v", err)
				}
				usedAt := time.Now().UTC()
				if err := db.Model(&models.PasswordResetToken{}).
					Where("user_id = ?", user.ID).
					Update("used_at", &usedAt).Error; err != nil {
					t.Fatalf("failed to mark password reset token as used: %v", err)
				}
				return token
			},
			wantError:  "used_reset_token",
			wantReason: "password reset token was already used",
		},
	}

	for _, testCase := range testCases {
		t.Run(testCase.name, func(t *testing.T) {
			app, authSvc, db, user := setupPasswordResetAuditTestApp(t)
			token := testCase.setupToken(t, db, authSvc, user)

			req := httptest.NewRequest(
				http.MethodPost,
				"/api/v1/account/password-reset/confirm",
				strings.NewReader(`{"token":"`+token+`","new_password":"Account234!"}`),
			)
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("X-Request-ID", "req-reset-confirm-"+testCase.name)
			req.Header.Set("X-Real-IP", "203.0.113.33")
			recorder := httptest.NewRecorder()

			app.handleAPIAccountPasswordResetConfirm(recorder, req)

			if recorder.Code != http.StatusBadRequest {
				t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
			}
			if !strings.Contains(recorder.Body.String(), `"`+testCase.wantError+`"`) {
				t.Fatalf("unexpected response body: %s", recorder.Body.String())
			}

			logItem := latestAuditLogForAction(t, app, "password_reset_confirm")
			if logItem.ActorUserID != nil {
				t.Fatalf("expected anonymous rejected audit, got actor=%v", *logItem.ActorUserID)
			}
			if logItem.Result != "rejected" {
				t.Fatalf("unexpected result: got=%q want=%q", logItem.Result, "rejected")
			}
			if logItem.Reason != testCase.wantReason {
				t.Fatalf("unexpected reason: got=%q want=%q", logItem.Reason, testCase.wantReason)
			}
			if logItem.RequestID != "req-reset-confirm-"+testCase.name {
				t.Fatalf("unexpected request id: got=%q want=%q", logItem.RequestID, "req-reset-confirm-"+testCase.name)
			}
			if logItem.SourceIP != "203.0.113.33" {
				t.Fatalf("unexpected source ip: got=%q want=%q", logItem.SourceIP, "203.0.113.33")
			}
		})
	}
}

func TestHandleAPIAccountPasswordResetConfirmWritesSessionStartFailedAudit(t *testing.T) {
	app, authSvc, _, user := setupPasswordResetAuditTestApp(t)
	token, err := authSvc.RequestPasswordReset(context.Background(), user.Username, "127.0.0.1")
	if err != nil {
		t.Fatalf("failed to request password reset token: %v", err)
	}

	app.sessionStarter = func(http.ResponseWriter, *http.Request, uint) error {
		return errors.New("session start failed")
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/account/password-reset/confirm",
		strings.NewReader(`{"token":"`+token+`","new_password":"Account234!"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-reset-confirm-session-failed")
	req.Header.Set("X-Real-IP", "203.0.113.34")
	recorder := httptest.NewRecorder()

	app.handleAPIAccountPasswordResetConfirm(recorder, req)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusInternalServerError)
	}
	if !strings.Contains(recorder.Body.String(), `"error":"session_start_failed"`) {
		t.Fatalf("unexpected response body: %s", recorder.Body.String())
	}

	logItem := latestAuditLogForAction(t, app, "password_reset_confirm")
	if logItem.ActorUserID == nil || *logItem.ActorUserID != user.ID {
		t.Fatalf("unexpected actor user id: got=%v want=%d", logItem.ActorUserID, user.ID)
	}
	if logItem.Result != "error" {
		t.Fatalf("unexpected result: got=%q want=%q", logItem.Result, "error")
	}
	if logItem.Reason != "password reset completed but session start failed" {
		t.Fatalf("unexpected reason: got=%q want=%q", logItem.Reason, "password reset completed but session start failed")
	}
	if logItem.RequestID != "req-reset-confirm-session-failed" {
		t.Fatalf("unexpected request id: got=%q want=%q", logItem.RequestID, "req-reset-confirm-session-failed")
	}
	if logItem.SourceIP != "203.0.113.34" {
		t.Fatalf("unexpected source ip: got=%q want=%q", logItem.SourceIP, "203.0.113.34")
	}
}
