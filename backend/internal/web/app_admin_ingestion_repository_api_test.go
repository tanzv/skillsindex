package web

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHandleAPIAdminIngestionRepositoryCreate(t *testing.T) {
	app, owner := setupAdminIngestionAPITestApp(t)
	repoDir := createRepositoryFixture(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/repository",
		strings.NewReader(fmt.Sprintf(`{"repo_url":%q,"repo_branch":"","repo_path":"","tags":"repository,api","visibility":"private","install_command":"codex skill install github:test/repository-api"}`, repoDir)),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionRepository(recorder, req)

	assertAdminIngestionCreated(t, recorder, "Repository skill synced", "repository", owner.Username)

	payload := decodeBodyMap(t, recorder)
	item, ok := payload["item"].(map[string]any)
	if !ok {
		t.Fatalf("missing item payload: %#v", payload)
	}
	sourceAnalysis, ok := item["source_analysis"].(map[string]any)
	if !ok {
		t.Fatalf("missing source_analysis payload: %#v", item)
	}
	if got, _ := sourceAnalysis["entry_file"].(string); got != "README.md" {
		t.Fatalf("unexpected source_analysis.entry_file: got=%q payload=%#v", got, sourceAnalysis)
	}
	if got, _ := sourceAnalysis["mechanism"].(string); got != "skill_manifest" {
		t.Fatalf("unexpected source_analysis.mechanism: got=%q payload=%#v", got, sourceAnalysis)
	}
}

func TestHandleAPIAdminIngestionRepositoryReportsActionableParserError(t *testing.T) {
	app, owner := setupAdminIngestionAPITestApp(t)
	repoDir := t.TempDir()
	createRepositoryFixtureFiles(t, repoDir, map[string]string{
		"skill.json": `{"name":"Repository API Skill","content_file":"README.md"}`,
		"README.md":  "   \n",
	})
	runCommand(t, repoDir, "git", "init")
	runCommand(t, repoDir, "git", "config", "user.email", "test@example.com")
	runCommand(t, repoDir, "git", "config", "user.name", "Test User")
	runCommand(t, repoDir, "git", "add", ".")
	runCommand(t, repoDir, "git", "commit", "-m", "init")

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/repository",
		strings.NewReader(fmt.Sprintf(`{"repo_url":%q,"visibility":"private"}`, repoDir)),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionRepository(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusBadRequest, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	message, _ := payload["message"].(string)
	if !strings.Contains(message, "README.md") || !strings.Contains(message, "content_file") {
		t.Fatalf("expected actionable repository error message, got=%q payload=%#v", message, payload)
	}
}

func TestHandleAPIAdminIngestionRepositoryInvalidPayload(t *testing.T) {
	app, owner := setupAdminIngestionAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/repository",
		strings.NewReader(`{"repo_url":`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-admin-ingestion-repository-invalid-payload")
	req = withCurrentUser(req, &owner)
	recorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionRepository(recorder, req)
	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}

	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-admin-ingestion-repository-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
