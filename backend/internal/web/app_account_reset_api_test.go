package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHandleAPIAccountPasswordResetRequestReturnsGenericMessage(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/account/password-reset/request",
		strings.NewReader(`{"username":"missing-user"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIAccountPasswordResetRequest(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"ok":true`) {
		t.Fatalf("expected ok response body, got=%s", body)
	}
	if !strings.Contains(body, `If the account exists`) {
		t.Fatalf("expected generic response message, got=%s", body)
	}
}

func TestHandleAPIAccountPasswordResetRequestServiceUnavailableIncludesRequestID(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)
	app.authService = nil

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/account/password-reset/request",
		strings.NewReader(`{"username":"account-user"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-password-reset-request-service-unavailable")
	recorder := httptest.NewRecorder()

	app.handleAPIAccountPasswordResetRequest(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusServiceUnavailable)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "service_unavailable" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Authentication service unavailable" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-password-reset-request-service-unavailable" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIAccountPasswordResetRequestInvalidPayloadIncludesRequestID(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/account/password-reset/request",
		strings.NewReader(`{"username":`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-password-reset-request-invalid-payload")
	recorder := httptest.NewRecorder()

	app.handleAPIAccountPasswordResetRequest(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Invalid request payload" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-password-reset-request-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIAccountPasswordResetConfirmSuccess(t *testing.T) {
	app, authSvc, _, user := setupAccountHandlersTestApp(t)
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
	recorder := httptest.NewRecorder()

	app.handleAPIAccountPasswordResetConfirm(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !strings.Contains(recorder.Body.String(), `"ok":true`) {
		t.Fatalf("unexpected response body: %s", recorder.Body.String())
	}
	if cookie := recorder.Header().Get("Set-Cookie"); !strings.Contains(cookie, "skillsindex_session=") {
		t.Fatalf("expected session cookie to be set, got=%s", cookie)
	}
	if _, err := authSvc.Authenticate(context.Background(), user.Username, "Account234!"); err != nil {
		t.Fatalf("expected updated password to authenticate, got=%v", err)
	}
}

func TestHandleAPIAccountPasswordResetConfirmInvalidToken(t *testing.T) {
	app, _, _, _ := setupAccountHandlersTestApp(t)
	applyAPITestTranslations(app)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/account/password-reset/confirm",
		strings.NewReader(`{"token":"invalid-token","new_password":"Account234!"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-password-reset-confirm-invalid-token")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9")
	recorder := httptest.NewRecorder()

	app.handleAPIAccountPasswordResetConfirm(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	if !strings.Contains(recorder.Body.String(), `"error":"invalid_reset_token"`) {
		t.Fatalf("unexpected response body: %s", recorder.Body.String())
	}
	payload := decodeBodyMap(t, recorder)
	message, ok := payload["message"].(string)
	if !ok {
		t.Fatalf("missing message field in response payload: %#v", payload)
	}
	if message != "localized-reset-invalid-token" {
		t.Fatalf("unexpected localized message: got=%q", message)
	}
	if payload["request_id"] != "req-password-reset-confirm-invalid-token" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
