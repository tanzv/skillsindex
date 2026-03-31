package web

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWriteAPIErrorFromErrorUsesRawMessageForClientErrors(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/example", nil)
	req.Header.Set("X-Request-ID", "req-api-error-bad-request")
	recorder := httptest.NewRecorder()

	writeAPIErrorFromError(
		recorder,
		req,
		http.StatusBadRequest,
		"invalid_payload",
		errors.New("payload field is required"),
		"Invalid request payload",
	)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "payload field is required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-api-error-bad-request" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestWriteAPIErrorFromErrorHidesInternalMessageForServerErrors(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/example", nil)
	req.Header.Set("X-Request-ID", "req-api-error-internal")
	recorder := httptest.NewRecorder()

	writeAPIErrorFromError(
		recorder,
		req,
		http.StatusInternalServerError,
		"query_failed",
		errors.New("dial tcp 10.0.0.8:5432: connect: connection refused"),
		"Failed to load current API spec",
	)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusInternalServerError)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "query_failed" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Failed to load current API spec" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-api-error-internal" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
