package web

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestRouterBlocksNonAPIPathsInAPIOnlyMode(t *testing.T) {
	app := &App{apiOnly: true}
	router := app.Router()

	req := httptest.NewRequest(http.MethodGet, "/login", nil)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
	if !strings.Contains(recorder.Body.String(), `"error":"api_only_mode"`) {
		t.Fatalf("expected api_only_mode response body")
	}
}

func TestRouterAllowsOpenAPIPathsInAPIOnlyMode(t *testing.T) {
	app := &App{apiOnly: true}
	router := app.Router()

	req := httptest.NewRequest(http.MethodGet, "/openapi.json", nil)
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)
	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if !strings.Contains(recorder.Body.String(), `"openapi":"3.0.3"`) {
		t.Fatalf("unexpected openapi payload body: %s", recorder.Body.String())
	}
}

func TestRouterHandlesCORSPreflightForAPIPath(t *testing.T) {
	app := &App{
		apiOnly: true,
		corsOrigins: map[string]struct{}{
			"http://localhost:5173": {},
		},
	}
	router := app.Router()

	req := httptest.NewRequest(http.MethodOptions, "/api/v1/auth/login", nil)
	req.Header.Set("Origin", "http://localhost:5173")
	req.Header.Set("Access-Control-Request-Method", "POST")
	recorder := httptest.NewRecorder()

	router.ServeHTTP(recorder, req)

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNoContent)
	}
	if recorder.Header().Get("Access-Control-Allow-Origin") != "http://localhost:5173" {
		t.Fatalf("unexpected allow origin header: %s", recorder.Header().Get("Access-Control-Allow-Origin"))
	}
}

func TestNewAppSkipsTemplateParsingInAPIOnlyMode(t *testing.T) {
	app, err := NewApp(
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		nil,
		true,
		false,
		true,
		nil,
		nil,
		"",
		"./storage",
	)
	if err != nil {
		t.Fatalf("expected no error when template glob is empty in api-only mode, got: %v", err)
	}
	if app == nil {
		t.Fatalf("expected app instance")
	}
	if app.templates != nil {
		t.Fatalf("expected templates to be nil in api-only mode")
	}
}

func TestRenderWithStatusReturnsJSONInAPIOnlyMode(t *testing.T) {
	app := &App{apiOnly: true}
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	recorder := httptest.NewRecorder()

	app.renderWithStatus(recorder, req, http.StatusForbidden, ViewData{Page: "home"})

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusForbidden)
	}
	if got := recorder.Header().Get("Content-Type"); !strings.Contains(got, "application/json") {
		t.Fatalf("unexpected content-type: %s", got)
	}

	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("expected valid json response, got err=%v body=%s", err, recorder.Body.String())
	}
	if payload["error"] != "api_only_mode" {
		t.Fatalf("unexpected error code: %#v", payload["error"])
	}
}
