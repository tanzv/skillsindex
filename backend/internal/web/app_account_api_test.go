package web

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/services"
)

func issueAccountTestSession(t *testing.T, app *App, userID uint) *http.Cookie {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", nil)
	recorder := httptest.NewRecorder()

	if err := app.startUserSession(recorder, req, userID); err != nil {
		t.Fatalf("failed to issue test session: %v", err)
	}
	result := recorder.Result()
	defer result.Body.Close()
	for _, cookie := range result.Cookies() {
		if cookie.Name == "skillsindex_session" {
			return cookie
		}
	}
	t.Fatalf("failed to find session cookie in response")
	return nil
}

func TestHandleAPIAccountProfileSuccess(t *testing.T) {
	app, _, _, user := setupAccountHandlersTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/account/profile", nil)
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleAPIAccountProfile(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !strings.Contains(recorder.Body.String(), `"username":"account-user"`) {
		t.Fatalf("unexpected profile payload: %s", recorder.Body.String())
	}
}

func TestHandleAPIAccountProfileUpdateSuccess(t *testing.T) {
	app, authSvc, _, user := setupAccountHandlersTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/account/profile",
		strings.NewReader(`{"display_name":"API Account User","avatar_url":"https://example.com/api.png","bio":"Updated from API"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleAPIAccountProfileUpdate(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	updated, err := authSvc.GetUserByID(context.Background(), user.ID)
	if err != nil {
		t.Fatalf("failed to load updated user: %v", err)
	}
	if updated.DisplayName != "API Account User" {
		t.Fatalf("unexpected display name: %s", updated.DisplayName)
	}
}

func TestHandleAPIAccountPasswordUpdateInvalidCurrentPassword(t *testing.T) {
	app, _, _, user := setupAccountHandlersTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/account/security/password",
		strings.NewReader(`{"current_password":"wrong-password","new_password":"Account234!"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleAPIAccountPasswordUpdate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	if !strings.Contains(recorder.Body.String(), `"error":"invalid_current_password"`) {
		t.Fatalf("unexpected payload: %s", recorder.Body.String())
	}
}

func TestHandleAPIAccountSessionsSuccess(t *testing.T) {
	app, _, userSessionSvc, user := setupAccountHandlersTestApp(t)
	currentSessionCookie := issueAccountTestSession(t, app, user.ID)
	if _, err := userSessionSvc.CreateSession(context.Background(), services.CreateUserSessionInput{
		UserID:     user.ID,
		SessionID:  "other-session-id",
		UserAgent:  "test-agent",
		IssuedIP:   "127.0.0.1",
		ExpiresAt:  time.Now().UTC().Add(6 * time.Hour),
		LastSeenAt: time.Now().UTC(),
	}); err != nil {
		t.Fatalf("failed to create extra session: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/account/sessions", nil)
	req.AddCookie(currentSessionCookie)
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleAPIAccountSessions(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode response payload: %v", err)
	}
	total, _ := payload["total"].(float64)
	if total < 2 {
		t.Fatalf("expected at least 2 sessions, got payload: %#v", payload)
	}
}

func TestHandleAPIAccountSessionRevokeCurrentDenied(t *testing.T) {
	app, _, _, user := setupAccountHandlersTestApp(t)
	currentSessionCookie := issueAccountTestSession(t, app, user.ID)

	decodedReq := httptest.NewRequest(http.MethodGet, "/", nil)
	decodedReq.AddCookie(currentSessionCookie)
	_, _, currentSessionID, ok := app.sessionService.GetSessionWithID(decodedReq)
	if !ok || strings.TrimSpace(currentSessionID) == "" {
		t.Fatalf("failed to decode current session id from cookie")
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/account/sessions/"+currentSessionID+"/revoke", nil)
	req.AddCookie(currentSessionCookie)
	req = withCurrentUser(req, &user)
	req = withURLParams(req, map[string]string{"sessionID": currentSessionID})
	recorder := httptest.NewRecorder()

	app.handleAPIAccountSessionRevoke(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	if !strings.Contains(recorder.Body.String(), `"error":"cannot_revoke_current_session"`) {
		t.Fatalf("unexpected payload: %s", recorder.Body.String())
	}
}

func TestHandleAPIAccountSessionsRevokeOthersSuccess(t *testing.T) {
	app, _, userSessionSvc, user := setupAccountHandlersTestApp(t)
	currentSessionCookie := issueAccountTestSession(t, app, user.ID)
	if _, err := userSessionSvc.CreateSession(context.Background(), services.CreateUserSessionInput{
		UserID:     user.ID,
		SessionID:  "other-session-id",
		UserAgent:  "test-agent",
		IssuedIP:   "127.0.0.1",
		ExpiresAt:  time.Now().UTC().Add(6 * time.Hour),
		LastSeenAt: time.Now().UTC(),
	}); err != nil {
		t.Fatalf("failed to create extra session: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/api/v1/account/sessions/revoke-others", nil)
	req.AddCookie(currentSessionCookie)
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleAPIAccountSessionsRevokeOthers(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	active, err := userSessionSvc.ValidateSession(context.Background(), user.ID, "other-session-id", time.Now().UTC())
	if err != nil {
		t.Fatalf("failed to validate other session: %v", err)
	}
	if active {
		t.Fatalf("expected other session to be revoked")
	}
}
