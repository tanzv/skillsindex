package web

import (
	"fmt"
	"html/template"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
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

func TestHandleOpenAPIReadsCurrentPublishedSnapshot(t *testing.T) {
	app := setupOpenAPIRuntimeApp(t, "openapi: 3.0.3\ninfo:\n  title: Runtime Snapshot\n  version: 1.2.3\n")
	req := httptest.NewRequest(http.MethodGet, "http://example.com/openapi.json", nil)
	recorder := httptest.NewRecorder()

	app.handleOpenAPI(recorder, req)

	if !strings.Contains(recorder.Body.String(), "Runtime Snapshot") {
		t.Fatalf("expected published snapshot body")
	}
}

func TestHandleOpenAPILoadFailureIncludesRequestID(t *testing.T) {
	app := setupOpenAPIRuntimeApp(t, "openapi: 3.0.3\ninfo:\n  title: Runtime Snapshot\n  version: 1.2.3\n")
	current, err := app.apiSpecRegistrySvc.CurrentPublished(t.Context())
	if err != nil {
		t.Fatalf("failed to load current published spec: %v", err)
	}
	if err := os.Remove(current.BundlePath); err != nil {
		t.Fatalf("failed to remove snapshot file: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "http://example.com/openapi.json", nil)
	req.Header.Set("X-Request-ID", "req-openapi-load-failed")
	recorder := httptest.NewRecorder()

	app.handleOpenAPI(recorder, req)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusInternalServerError)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "openapi_load_failed" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Failed to load OpenAPI document" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-openapi-load-failed" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleOpenAPIYAMLReadsCurrentPublishedSnapshotWithResolvedServerURL(t *testing.T) {
	app := setupOpenAPIRuntimeApp(t, "openapi: 3.0.3\ninfo:\n  title: Runtime Snapshot\n  version: 1.2.3\nservers:\n  - url: http://stale.example.com\n")
	req := httptest.NewRequest(http.MethodGet, "http://example.com/openapi.yaml", nil)
	req.Host = "api.example.com"
	req.Header.Set("X-Forwarded-Proto", "https")
	recorder := httptest.NewRecorder()

	app.handleOpenAPIYAML(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, "Runtime Snapshot") {
		t.Fatalf("expected published snapshot body")
	}
	if !strings.Contains(body, "url: https://api.example.com") {
		t.Fatalf("expected resolved server url in published yaml, got=%s", body)
	}
	if strings.Contains(body, "http://stale.example.com") {
		t.Fatalf("expected stale server url to be replaced, got=%s", body)
	}
}

func TestHandleOpenAPIYAMLLoadFailureIncludesRequestID(t *testing.T) {
	app := setupOpenAPIRuntimeApp(t, "openapi: 3.0.3\ninfo:\n  title: Runtime Snapshot\n  version: 1.2.3\n")
	current, err := app.apiSpecRegistrySvc.CurrentPublished(t.Context())
	if err != nil {
		t.Fatalf("failed to load current published spec: %v", err)
	}
	if err := os.Remove(current.BundlePath); err != nil {
		t.Fatalf("failed to remove snapshot file: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "http://example.com/openapi.yaml", nil)
	req.Header.Set("X-Request-ID", "req-openapi-yaml-failed")
	recorder := httptest.NewRecorder()

	app.handleOpenAPIYAML(recorder, req)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusInternalServerError)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "openapi_yaml_failed" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Failed to generate OpenAPI YAML" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-openapi-yaml-failed" {
		t.Fatalf("unexpected request id: %#v", payload)
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

func setupOpenAPIRuntimeApp(t *testing.T, raw string) *App {
	t.Helper()

	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := db.AutoMigrate(&models.APISpec{}); err != nil {
		t.Fatalf("failed to migrate api spec model: %v", err)
	}

	dir := t.TempDir()
	bundlePath := filepath.Join(dir, "current.yaml")
	if err := os.WriteFile(bundlePath, []byte(raw), 0o644); err != nil {
		t.Fatalf("failed to write snapshot file: %v", err)
	}

	publishedAt := mustParseTime(t, "2026-03-23T15:00:00Z")
	spec := models.APISpec{
		Name:            "SkillsIndex API",
		Slug:            "skillsindex-api",
		SourceType:      "repository",
		Status:          models.APISpecStatusPublished,
		SemanticVersion: "1.2.3",
		IsCurrent:       true,
		SourcePath:      "../../api/openapi/root.yaml",
		BundlePath:      bundlePath,
		Checksum:        "snapshot",
		CreatedBy:       1,
		PublishedBy:     uintPtr(1),
		PublishedAt:     &publishedAt,
	}
	if err := db.Create(&spec).Error; err != nil {
		t.Fatalf("failed to create published spec: %v", err)
	}

	return &App{
		apiRuntimeDependencies: apiRuntimeDependencies{
			apiSpecRegistrySvc: services.NewAPISpecRegistryService(db, dir),
		},
	}
}

func mustParseTime(t *testing.T, value string) time.Time {
	t.Helper()
	parsed, err := time.Parse(time.RFC3339, value)
	if err != nil {
		t.Fatalf("failed to parse time: %v", err)
	}
	return parsed
}

func uintPtr(value uint) *uint {
	return &value
}
