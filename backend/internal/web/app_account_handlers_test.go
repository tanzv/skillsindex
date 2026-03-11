package web

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupAccountHandlersTestApp(t *testing.T) (*App, *services.AuthService, *services.UserSessionService, models.User) {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.User{}, &models.UserSession{}, &models.PasswordResetToken{}, &models.SystemSetting{}); err != nil {
		t.Fatalf("failed to migrate user models: %v", err)
	}

	authSvc := services.NewAuthService(db)
	userSessionSvc := services.NewUserSessionService(db)
	settingsSvc := services.NewSettingsService(db)
	user, err := authSvc.Register(context.Background(), "account-user", "Account123!")
	if err != nil {
		t.Fatalf("failed to create account user: %v", err)
	}

	app := &App{
		authService:    authSvc,
		sessionService: services.NewSessionService("test-secret", false),
		userSessionSvc: userSessionSvc,
		settingsService: settingsSvc,
		cookieSecure:   false,
	}
	return app, authSvc, userSessionSvc, user
}

func TestHandleAccountRootRedirect(t *testing.T) {
	app, _, _, user := setupAccountHandlersTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/account", nil)
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleAccountRoot(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if got := recorder.Header().Get("Location"); got != "/account/profile" {
		t.Fatalf("unexpected redirect location: %s", got)
	}
}

func TestHandleMobileLoginAlias(t *testing.T) {
	app := &App{}
	req := httptest.NewRequest(http.MethodGet, "/mobile/light/login?locale=zh", nil)
	recorder := httptest.NewRecorder()

	app.handleMobileLoginAlias(recorder, req)

	if recorder.Code != http.StatusTemporaryRedirect {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusTemporaryRedirect)
	}
	if got := recorder.Header().Get("Location"); got != "/light/login?locale=zh" {
		t.Fatalf("unexpected redirect location: %s", got)
	}
}

func TestHandleAccountProfileUpdate(t *testing.T) {
	app, authSvc, _, user := setupAccountHandlersTestApp(t)
	form := url.Values{}
	form.Set("display_name", "Account User")
	form.Set("avatar_url", "https://example.com/avatar.png")
	form.Set("bio", "Updated profile bio")

	req := httptest.NewRequest(http.MethodPost, "/account/profile", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleAccountProfileUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if !strings.HasPrefix(recorder.Header().Get("Location"), "/account/profile?msg=") {
		t.Fatalf("unexpected redirect location: %s", recorder.Header().Get("Location"))
	}

	updated, err := authSvc.GetUserByID(context.Background(), user.ID)
	if err != nil {
		t.Fatalf("failed to load updated user: %v", err)
	}
	if updated.DisplayName != "Account User" {
		t.Fatalf("unexpected display name: %s", updated.DisplayName)
	}
	if updated.AvatarURL != "https://example.com/avatar.png" {
		t.Fatalf("unexpected avatar url: %s", updated.AvatarURL)
	}
	if updated.Bio != "Updated profile bio" {
		t.Fatalf("unexpected bio: %s", updated.Bio)
	}
}

func TestHandleAccountPasswordUpdateRevokeOthers(t *testing.T) {
	app, authSvc, _, user := setupAccountHandlersTestApp(t)
	form := url.Values{}
	form.Set("current_password", "Account123!")
	form.Set("new_password", "Account234!")
	form.Set("revoke_other_sessions", "on")

	req := httptest.NewRequest(http.MethodPost, "/account/security/password", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleAccountPasswordUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if !strings.HasPrefix(recorder.Header().Get("Location"), "/account/security?msg=") {
		t.Fatalf("unexpected redirect location: %s", recorder.Header().Get("Location"))
	}
	if cookie := recorder.Header().Get("Set-Cookie"); !strings.Contains(cookie, "skillsindex_session=") {
		t.Fatalf("expected session cookie to be refreshed, got=%s", cookie)
	}

	if _, err := authSvc.Authenticate(context.Background(), "account-user", "Account123!"); err == nil {
		t.Fatalf("expected old password to be invalid")
	}
	if _, err := authSvc.Authenticate(context.Background(), "account-user", "Account234!"); err != nil {
		t.Fatalf("expected new password to authenticate, got=%v", err)
	}

	updated, err := authSvc.GetUserByID(context.Background(), user.ID)
	if err != nil {
		t.Fatalf("failed to load updated user: %v", err)
	}
	if updated.ForceLogoutAt == nil {
		t.Fatalf("expected force logout timestamp to be set")
	}
}

func TestHandleAccountPasswordUpdateInvalidCurrentPassword(t *testing.T) {
	app, _, _, user := setupAccountHandlersTestApp(t)
	form := url.Values{}
	form.Set("current_password", "wrong-password")
	form.Set("new_password", "Account234!")

	req := httptest.NewRequest(http.MethodPost, "/account/security/password", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleAccountPasswordUpdate(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if !strings.Contains(recorder.Header().Get("Location"), "err=") {
		t.Fatalf("expected error redirect, got=%s", recorder.Header().Get("Location"))
	}
}

func TestHandlePasswordResetRequestAlwaysRedirectsWithGenericMessage(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)
	form := url.Values{}
	form.Set("username", "non-existing-user")

	req := httptest.NewRequest(http.MethodPost, "/account/password-reset/request", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	recorder := httptest.NewRecorder()

	app.handlePasswordResetRequest(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if got := recorder.Header().Get("Location"); !strings.HasPrefix(got, "/account/password-reset/request?msg=") {
		t.Fatalf("unexpected redirect location: %s", got)
	}
}

func TestHandlePasswordResetConfirmSuccess(t *testing.T) {
	app, authSvc, _, user := setupAccountHandlersTestApp(t)
	token, err := authSvc.RequestPasswordReset(context.Background(), user.Username, "127.0.0.1")
	if err != nil {
		t.Fatalf("failed to request password reset token: %v", err)
	}

	form := url.Values{}
	form.Set("token", token)
	form.Set("new_password", "Account234!")
	req := httptest.NewRequest(http.MethodPost, "/account/password-reset/confirm", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	recorder := httptest.NewRecorder()

	app.handlePasswordResetConfirm(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if got := recorder.Header().Get("Location"); !strings.HasPrefix(got, "/admin?msg=") {
		t.Fatalf("unexpected redirect location: %s", got)
	}
	if cookie := recorder.Header().Get("Set-Cookie"); !strings.Contains(cookie, "skillsindex_session=") {
		t.Fatalf("expected session cookie to be set, got=%s", cookie)
	}
}

func TestHandlePasswordResetConfirmInvalidToken(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)
	form := url.Values{}
	form.Set("token", "invalid-token")
	form.Set("new_password", "Account234!")
	req := httptest.NewRequest(http.MethodPost, "/account/password-reset/confirm", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	recorder := httptest.NewRecorder()

	app.handlePasswordResetConfirm(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if got := recorder.Header().Get("Location"); !strings.HasPrefix(got, "/account/password-reset/confirm?err=") {
		t.Fatalf("unexpected redirect location: %s", got)
	}
}

func TestHandleAccountSessionRevokeRejectsCurrentSession(t *testing.T) {
	app, _, userSessionSvc, user := setupAccountHandlersTestApp(t)

	loginRecorder := httptest.NewRecorder()
	issued, err := app.sessionService.SetLoginWithMeta(loginRecorder, user.ID)
	if err != nil {
		t.Fatalf("failed to issue login session: %v", err)
	}
	_, err = userSessionSvc.CreateSession(context.Background(), services.CreateUserSessionInput{
		UserID:     user.ID,
		SessionID:  issued.SessionID,
		UserAgent:  "unit-test",
		IssuedIP:   "127.0.0.1",
		ExpiresAt:  issued.ExpiresAt,
		LastSeenAt: issued.IssuedAt,
	})
	if err != nil {
		t.Fatalf("failed to persist current session: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/account/sessions/"+issued.SessionID+"/revoke", nil)
	req = withCurrentUser(req, &user)
	req = withRouteParam(req, "sessionID", issued.SessionID)
	req.AddCookie(loginRecorder.Result().Cookies()[0])
	recorder := httptest.NewRecorder()

	app.handleAccountSessionRevoke(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if got := recorder.Header().Get("Location"); !strings.Contains(got, "err=Cannot+revoke+current+session+directly") {
		t.Fatalf("unexpected redirect location: %s", got)
	}
}

func TestHandleAccountSessionRevokeSuccess(t *testing.T) {
	app, _, userSessionSvc, user := setupAccountHandlersTestApp(t)

	currentRecorder := httptest.NewRecorder()
	currentIssued, err := app.sessionService.SetLoginWithMeta(currentRecorder, user.ID)
	if err != nil {
		t.Fatalf("failed to issue current session: %v", err)
	}
	_, err = userSessionSvc.CreateSession(context.Background(), services.CreateUserSessionInput{
		UserID:     user.ID,
		SessionID:  currentIssued.SessionID,
		UserAgent:  "unit-test-current",
		IssuedIP:   "127.0.0.1",
		ExpiresAt:  currentIssued.ExpiresAt,
		LastSeenAt: currentIssued.IssuedAt,
	})
	if err != nil {
		t.Fatalf("failed to persist current session: %v", err)
	}

	targetSession := "target-session-1"
	_, err = userSessionSvc.CreateSession(context.Background(), services.CreateUserSessionInput{
		UserID:     user.ID,
		SessionID:  targetSession,
		UserAgent:  "unit-test-target",
		IssuedIP:   "127.0.0.1",
		ExpiresAt:  time.Now().UTC().Add(time.Hour),
		LastSeenAt: time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("failed to persist target session: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/account/sessions/"+targetSession+"/revoke", nil)
	req = withCurrentUser(req, &user)
	req = withRouteParam(req, "sessionID", targetSession)
	req.AddCookie(currentRecorder.Result().Cookies()[0])
	recorder := httptest.NewRecorder()

	app.handleAccountSessionRevoke(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if got := recorder.Header().Get("Location"); !strings.HasPrefix(got, "/account/sessions?msg=") {
		t.Fatalf("unexpected redirect location: %s", got)
	}

	valid, err := userSessionSvc.ValidateSession(context.Background(), user.ID, targetSession, time.Now().UTC())
	if err != nil {
		t.Fatalf("failed to validate target session: %v", err)
	}
	if valid {
		t.Fatalf("expected target session to be revoked")
	}
}
