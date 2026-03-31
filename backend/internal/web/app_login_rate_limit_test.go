package web

import (
	"html/template"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func newTestLoginThrottleState(now time.Time, threshold int) *loginThrottleState {
	return &loginThrottleState{
		now:          func() time.Time { return now },
		threshold:    threshold,
		window:       time.Hour,
		lockDuration: time.Hour,
		buckets:      map[string]loginThrottleBucket{},
	}
}

func TestHandleAPIAuthLoginRateLimitedAfterRepeatedFailures(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)
	app.loginThrottle = newTestLoginThrottleState(time.Date(2026, 3, 12, 10, 0, 0, 0, time.UTC), 2)

	for index := 0; index < 2; index++ {
		req := httptest.NewRequest(
			http.MethodPost,
			"/api/v1/auth/login",
			strings.NewReader(`{"username":"account-user","password":"wrong-password"}`),
		)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Accept", "application/json")
		req.Header.Set("X-Real-IP", "203.0.113.10")
		recorder := httptest.NewRecorder()

		app.handleAPIAuthLogin(recorder, req)

		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("unexpected status code on failed login attempt %d: got=%d want=%d", index+1, recorder.Code, http.StatusUnauthorized)
		}
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/login",
		strings.NewReader(`{"username":"account-user","password":"Account123!"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Real-IP", "203.0.113.10")
	req.Header.Set("X-Request-ID", "req-auth-login-rate-limited")
	recorder := httptest.NewRecorder()

	app.handleAPIAuthLogin(recorder, req)

	if recorder.Code != http.StatusTooManyRequests {
		t.Fatalf("unexpected status code after lock: got=%d want=%d", recorder.Code, http.StatusTooManyRequests)
	}
	if !strings.Contains(recorder.Body.String(), `"error":"too_many_requests"`) {
		t.Fatalf("expected too_many_requests payload, got=%s", recorder.Body.String())
	}
	payload := decodeBodyMap(t, recorder)
	if payload["request_id"] != "req-auth-login-rate-limited" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleLoginRateLimitedAfterRepeatedFailures(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)
	app.loginThrottle = newTestLoginThrottleState(time.Date(2026, 3, 12, 10, 0, 0, 0, time.UTC), 2)
	app.templates = template.Must(template.New("layout").Parse(`{{define "layout"}}{{.Error}}{{end}}`))

	for index := 0; index < 2; index++ {
		req := httptest.NewRequest(
			http.MethodPost,
			"/login",
			strings.NewReader("username=account-user&password=wrong-password"),
		)
		req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
		req.Header.Set("X-Real-IP", "203.0.113.10")
		recorder := httptest.NewRecorder()

		app.handleLogin(recorder, req)

		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("unexpected status code on failed form login attempt %d: got=%d want=%d", index+1, recorder.Code, http.StatusUnauthorized)
		}
	}

	req := httptest.NewRequest(
		http.MethodPost,
		"/login",
		strings.NewReader("username=account-user&password=Account123!"),
	)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("X-Real-IP", "203.0.113.10")
	recorder := httptest.NewRecorder()

	app.handleLogin(recorder, req)

	if recorder.Code != http.StatusTooManyRequests {
		t.Fatalf("unexpected status code after form lock: got=%d want=%d", recorder.Code, http.StatusTooManyRequests)
	}
	if !strings.Contains(recorder.Body.String(), "Too many failed sign-in attempts") {
		t.Fatalf("expected throttling message, got=%s", recorder.Body.String())
	}
}

func TestHandleAPIAuthLoginSuccessClearsThrottleState(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)
	app.loginThrottle = newTestLoginThrottleState(time.Date(2026, 3, 12, 10, 0, 0, 0, time.UTC), 2)

	firstFailure := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/login",
		strings.NewReader(`{"username":"account-user","password":"wrong-password"}`),
	)
	firstFailure.Header.Set("Content-Type", "application/json")
	firstFailure.Header.Set("Accept", "application/json")
	firstFailure.Header.Set("X-Real-IP", "203.0.113.10")
	firstFailureRecorder := httptest.NewRecorder()

	app.handleAPIAuthLogin(firstFailureRecorder, firstFailure)

	if firstFailureRecorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code on first failed login: got=%d want=%d", firstFailureRecorder.Code, http.StatusUnauthorized)
	}

	successReq := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/login",
		strings.NewReader(`{"username":"account-user","password":"Account123!"}`),
	)
	successReq.Header.Set("Content-Type", "application/json")
	successReq.Header.Set("Accept", "application/json")
	successReq.Header.Set("X-Real-IP", "203.0.113.10")
	successRecorder := httptest.NewRecorder()

	app.handleAPIAuthLogin(successRecorder, successReq)

	if successRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code on successful login: got=%d want=%d", successRecorder.Code, http.StatusOK)
	}

	secondFailure := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/auth/login",
		strings.NewReader(`{"username":"account-user","password":"wrong-password"}`),
	)
	secondFailure.Header.Set("Content-Type", "application/json")
	secondFailure.Header.Set("Accept", "application/json")
	secondFailure.Header.Set("X-Real-IP", "203.0.113.10")
	secondFailureRecorder := httptest.NewRecorder()

	app.handleAPIAuthLogin(secondFailureRecorder, secondFailure)

	if secondFailureRecorder.Code != http.StatusUnauthorized {
		t.Fatalf("expected throttle state to clear after success, got=%d want=%d", secondFailureRecorder.Code, http.StatusUnauthorized)
	}
}

func TestHandleLoginSuccessRedirectsToRequestedTarget(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/light/login?redirect=%2Flight%2Fskills%2F11%3Ftab%3Dfiles",
		strings.NewReader("username=account-user&password=Account123!"),
	)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("X-Real-IP", "203.0.113.10")
	recorder := httptest.NewRecorder()

	app.handleLogin(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if got := recorder.Header().Get("Location"); got != "/light/skills/11?tab=files" {
		t.Fatalf("unexpected redirect location: got=%s", got)
	}
}

func TestHandleLoginSuccessIgnoresUnsafeRedirectTarget(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/login?redirect=%2F%2Fevil.example",
		strings.NewReader("username=account-user&password=Account123!"),
	)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("X-Real-IP", "203.0.113.10")
	recorder := httptest.NewRecorder()

	app.handleLogin(recorder, req)

	if recorder.Code != http.StatusSeeOther {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusSeeOther)
	}
	if got := recorder.Header().Get("Location"); got != "/admin?msg=Signed+in" {
		t.Fatalf("unexpected redirect location: got=%s", got)
	}
}
