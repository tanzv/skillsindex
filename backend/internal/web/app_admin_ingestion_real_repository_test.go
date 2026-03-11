package web

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
)

func TestRealRepositoryIngestionFlowsIntoMarketplaceDisplayAndSearch(t *testing.T) {
	if os.Getenv("SKILLSINDEX_RUN_REAL_REPO_TESTS") != "1" {
		t.Skip("set SKILLSINDEX_RUN_REAL_REPO_TESTS=1 to run real repository integration tests")
	}

	repoURL := strings.TrimSpace(os.Getenv("SKILLSINDEX_REAL_REPO_URL"))
	if repoURL == "" {
		repoURL = "https://github.com/anthropics/skills"
	}
	repoPath := strings.TrimSpace(os.Getenv("SKILLSINDEX_REAL_REPO_PATH"))
	if repoPath == "" {
		repoPath = "skills/webapp-testing"
	}

	app, owner := setupAdminIngestionAPITestApp(t)
	requestBody := fmt.Sprintf(
		`{"repo_url":%q,"repo_path":%q,"visibility":"public","tags":"real-repo,playwright"}`,
		repoURL,
		repoPath,
	)

	importRequest := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/ingestion/repository",
		strings.NewReader(requestBody),
	)
	importRequest.Header.Set("Content-Type", "application/json")
	importRequest = withCurrentUser(importRequest, &owner)
	importRecorder := httptest.NewRecorder()

	app.handleAPIAdminIngestionRepository(importRecorder, importRequest)

	assertAdminIngestionCreated(t, importRecorder, "Repository skill synced", "repository", owner.Username)
	importBody := importRecorder.Body.String()
	if !strings.Contains(importBody, `"name":"webapp-testing"`) {
		t.Fatalf("expected imported skill name in ingestion response: %s", importBody)
	}

	displayRequest := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace?page=1", nil)
	displayRecorder := httptest.NewRecorder()
	app.handleAPIPublicMarketplace(displayRecorder, displayRequest)

	if displayRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected display status code: got=%d want=%d body=%s", displayRecorder.Code, http.StatusOK, displayRecorder.Body.String())
	}
	displayBody := displayRecorder.Body.String()
	if !strings.Contains(displayBody, `"name":"webapp-testing"`) {
		t.Fatalf("expected imported skill in marketplace payload: %s", displayBody)
	}

	searchRequest := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace?q=Playwright", nil)
	searchRecorder := httptest.NewRecorder()
	app.handleAPIPublicMarketplace(searchRecorder, searchRequest)

	if searchRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected search status code: got=%d want=%d body=%s", searchRecorder.Code, http.StatusOK, searchRecorder.Body.String())
	}
	searchBody := searchRecorder.Body.String()
	if !strings.Contains(searchBody, `"matching_skills":1`) {
		t.Fatalf("expected real repository skill to be searchable by Playwright: %s", searchBody)
	}
	if !strings.Contains(searchBody, `"name":"webapp-testing"`) {
		t.Fatalf("expected searchable skill payload in marketplace search response: %s", searchBody)
	}
}
