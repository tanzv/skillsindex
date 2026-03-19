package web

import (
	"html/template"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestResolveServerURL(t *testing.T) {
	req := httptest.NewRequest("GET", "http://example.com/openapi.json", nil)
	req.Host = "api.example.com"
	req.Header.Set("X-Forwarded-Proto", "https")

	got := resolveServerURL(req)
	if got != "https://api.example.com" {
		t.Fatalf("unexpected server url: got=%s", got)
	}
}

func TestMarshalOpenAPIYAML(t *testing.T) {
	spec := buildOpenAPISpec("http://127.0.0.1:8080")
	raw, err := marshalOpenAPIYAML(spec)
	if err != nil {
		t.Fatalf("marshal openapi yaml failed: %v", err)
	}
	body := string(raw)
	if !strings.Contains(body, "openapi: 3.0.3") {
		t.Fatalf("yaml should contain openapi version, got=%s", body)
	}
	if !strings.Contains(body, "/api/v1/skills/search:") {
		t.Fatalf("yaml should contain search path")
	}
}

func TestHandleOpenAPIYAML(t *testing.T) {
	app := &App{}
	req := httptest.NewRequest(http.MethodGet, "http://example.com/openapi.yaml", nil)
	req.Host = "api.example.com"
	req.Header.Set("X-Forwarded-Proto", "https")
	recorder := httptest.NewRecorder()

	app.handleOpenAPIYAML(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if contentType := recorder.Header().Get("Content-Type"); !strings.Contains(contentType, "yaml") {
		t.Fatalf("unexpected content type: %s", contentType)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, "openapi: 3.0.3") {
		t.Fatalf("yaml response missing openapi version")
	}
	if !strings.Contains(body, "url: https://api.example.com") {
		t.Fatalf("yaml response missing resolved server url")
	}
}

func TestHandleSwaggerDocs(t *testing.T) {
	app := &App{
		templates: template.Must(template.New("layout").Parse(`{{define "layout"}}{{.Page}}|{{.Title}}{{end}}`)),
	}
	req := httptest.NewRequest(http.MethodGet, "http://example.com/docs/swagger", nil)
	recorder := httptest.NewRecorder()

	app.handleSwaggerDocs(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	if body := recorder.Body.String(); body != "swagger|API Explorer" {
		t.Fatalf("unexpected rendered body: %s", body)
	}
}
