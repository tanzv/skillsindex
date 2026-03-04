package web

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHandleAPIAuthLoginSuccess(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/login",
		strings.NewReader(`{"username":"account-user","password":"Account123!"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIAuthLogin(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"ok":true`) {
		t.Fatalf("missing ok marker in response body: %s", body)
	}
	if !strings.Contains(body, `"username":"account-user"`) {
		t.Fatalf("missing user payload in response body: %s", body)
	}
	if !strings.Contains(recorder.Header().Get("Set-Cookie"), "skillsindex_session=") {
		t.Fatalf("expected session cookie in login response")
	}
}

func TestHandleAPIAuthCSRFSuccess(t *testing.T) {
	app := &App{}
	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/csrf", nil)
	recorder := httptest.NewRecorder()

	app.handleAPIAuthCSRF(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !strings.Contains(recorder.Body.String(), `"csrf_token":"`) {
		t.Fatalf("missing csrf token payload: %s", recorder.Body.String())
	}
	if !strings.Contains(recorder.Header().Get("Set-Cookie"), "skillsindex_csrf=") {
		t.Fatalf("expected csrf cookie in response headers")
	}
}

func TestHandleAPIAuthLoginInvalidCredentials(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/login",
		strings.NewReader(`{"username":"account-user","password":"wrong-password"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIAuthLogin(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	if !strings.Contains(recorder.Body.String(), `"error":"unauthorized"`) {
		t.Fatalf("expected unauthorized error payload")
	}
}

func TestHandleAPIAuthMeReturnsCurrentUser(t *testing.T) {
	app, _, _, user := setupAccountHandlersTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	req.Header.Set("Accept", "application/json")
	req = withCurrentUser(req, &user)
	recorder := httptest.NewRecorder()

	app.handleAPIAuthMe(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !strings.Contains(recorder.Body.String(), `"username":"account-user"`) {
		t.Fatalf("missing current user in response body")
	}
}

func TestHandleAPIAuthMeReturnsNilForAnonymousSession(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/auth/me", nil)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIAuthMe(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !strings.Contains(recorder.Body.String(), `"user":null`) {
		t.Fatalf("expected nil user payload in response body: %s", recorder.Body.String())
	}
}

func TestRequireAuthReturnsJSONForAPIRequest(t *testing.T) {
	app := &App{}
	handler := app.requireAuth(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/account/profile", nil)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	if !strings.Contains(recorder.Body.String(), `"error":"unauthorized"`) {
		t.Fatalf("expected unauthorized error payload")
	}
}
