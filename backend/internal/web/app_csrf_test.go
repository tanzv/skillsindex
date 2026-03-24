package web

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestRequireCSRFRejectsMissingTokenForJSONRequests(t *testing.T) {
	app := &App{}
	handler := app.requireCSRF(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	req := httptest.NewRequest(http.MethodPost, "/api/v1/demo", strings.NewReader(`{"name":"demo"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}

	payload := decodeBodyMap(t, recorder)
	if code, _ := payload["error"].(string); code != "csrf_validation_failed" {
		t.Fatalf("unexpected error code: got=%q want=%q", code, "csrf_validation_failed")
	}
	if message, _ := payload["message"].(string); message != "CSRF validation failed" {
		t.Fatalf("unexpected error message: got=%q want=%q", message, "CSRF validation failed")
	}
}
