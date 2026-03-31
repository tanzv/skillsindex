package web

import (
	"context"
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
		repoURL = "https://github.com/obra/superpowers/tree/main/skills/using-superpowers"
	}
	repoPath := strings.TrimSpace(os.Getenv("SKILLSINDEX_REAL_REPO_PATH"))

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
	if !strings.Contains(importBody, `"name":"using-superpowers"`) {
		t.Fatalf("expected imported skill name in ingestion response: %s", importBody)
	}

	items, err := app.skillService.ListSkillsByOwner(context.Background(), owner.ID)
	if err != nil {
		t.Fatalf("failed to list owner skills: %v", err)
	}
	if len(items) != 1 {
		t.Fatalf("expected one imported skill, got=%d", len(items))
	}
	importedSkill := items[0]
	if importedSkill.SourceURL != "https://github.com/obra/superpowers.git" {
		t.Fatalf("expected normalized source url, got=%q", importedSkill.SourceURL)
	}
	if importedSkill.SourceBranch != "main" {
		t.Fatalf("expected normalized source branch, got=%q", importedSkill.SourceBranch)
	}
	if importedSkill.SourcePath != "skills/using-superpowers" {
		t.Fatalf("expected normalized source path, got=%q", importedSkill.SourcePath)
	}

	displayRequest := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace?page=1", nil)
	displayRecorder := httptest.NewRecorder()
	app.handleAPIPublicMarketplace(displayRecorder, displayRequest)

	if displayRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected display status code: got=%d want=%d body=%s", displayRecorder.Code, http.StatusOK, displayRecorder.Body.String())
	}
	displayBody := displayRecorder.Body.String()
	if !strings.Contains(displayBody, `"name":"using-superpowers"`) {
		t.Fatalf("expected imported skill in marketplace payload: %s", displayBody)
	}

	detailRequest := httptest.NewRequest(
		http.MethodGet,
		fmt.Sprintf("/api/v1/public/skills/%d", importedSkill.ID),
		nil,
	)
	detailRequest = withURLParams(detailRequest, map[string]string{
		"skillID": fmt.Sprintf("%d", importedSkill.ID),
	})
	detailRecorder := httptest.NewRecorder()
	app.handleAPIPublicSkillDetail(detailRecorder, detailRequest)

	if detailRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected detail status code: got=%d want=%d body=%s", detailRecorder.Code, http.StatusOK, detailRecorder.Body.String())
	}
	if !strings.Contains(detailRecorder.Body.String(), `"name":"using-superpowers"`) {
		t.Fatalf("expected imported skill in detail payload: %s", detailRecorder.Body.String())
	}
	if !strings.Contains(detailRecorder.Body.String(), `"category":"devops"`) {
		t.Fatalf("expected imported category in detail payload: %s", detailRecorder.Body.String())
	}

	resourcesRequest := httptest.NewRequest(
		http.MethodGet,
		fmt.Sprintf("/api/v1/public/skills/%d/resources", importedSkill.ID),
		nil,
	)
	resourcesRequest = withURLParams(resourcesRequest, map[string]string{
		"skillID": fmt.Sprintf("%d", importedSkill.ID),
	})
	resourcesRecorder := httptest.NewRecorder()
	app.handleAPIPublicSkillResources(resourcesRecorder, resourcesRequest)

	if resourcesRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected resources status code: got=%d want=%d body=%s", resourcesRecorder.Code, http.StatusOK, resourcesRecorder.Body.String())
	}
	if !strings.Contains(resourcesRecorder.Body.String(), `"entry_file":"SKILL.md"`) {
		t.Fatalf("expected entry file in resources payload: %s", resourcesRecorder.Body.String())
	}
	if !strings.Contains(resourcesRecorder.Body.String(), `"mechanism":"skill_markdown_frontmatter"`) {
		t.Fatalf("expected skill mechanism in resources payload: %s", resourcesRecorder.Body.String())
	}
	if !strings.Contains(resourcesRecorder.Body.String(), `"metadata_sources":["SKILL.md.frontmatter"]`) {
		t.Fatalf("expected metadata sources in resources payload: %s", resourcesRecorder.Body.String())
	}
	if !strings.Contains(resourcesRecorder.Body.String(), `"reference_count":1`) {
		t.Fatalf("expected reference count in resources payload: %s", resourcesRecorder.Body.String())
	}
	if !strings.Contains(resourcesRecorder.Body.String(), `"dependency_count":1`) {
		t.Fatalf("expected dependency count in resources payload: %s", resourcesRecorder.Body.String())
	}
	if !strings.Contains(resourcesRecorder.Body.String(), `"name":"SKILL.md"`) {
		t.Fatalf("expected SKILL.md in resource payload: %s", resourcesRecorder.Body.String())
	}
	if !strings.Contains(resourcesRecorder.Body.String(), `"name":"references/codex-tools.md"`) {
		t.Fatalf("expected codex reference file in resource payload: %s", resourcesRecorder.Body.String())
	}
	if !strings.Contains(resourcesRecorder.Body.String(), `"name":"references/gemini-tools.md"`) {
		t.Fatalf("expected gemini reference file in resource payload: %s", resourcesRecorder.Body.String())
	}
	if !strings.Contains(resourcesRecorder.Body.String(), `"reference_paths":["references/codex-tools.md"]`) {
		t.Fatalf("expected reference topology in resource payload: %s", resourcesRecorder.Body.String())
	}
	if !strings.Contains(resourcesRecorder.Body.String(), `"kind":"file"`) || !strings.Contains(resourcesRecorder.Body.String(), `"target":"references/codex-tools.md"`) {
		t.Fatalf("expected parsed file dependency in resource payload: %s", resourcesRecorder.Body.String())
	}

	contentRequest := httptest.NewRequest(
		http.MethodGet,
		fmt.Sprintf("/api/v1/public/skills/%d/resources/content?path=SKILL.md", importedSkill.ID),
		nil,
	)
	contentRequest = withURLParams(contentRequest, map[string]string{
		"skillID": fmt.Sprintf("%d", importedSkill.ID),
	})
	contentRecorder := httptest.NewRecorder()
	app.handleAPIPublicSkillResourceContent(contentRecorder, contentRequest)

	if contentRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected resource content status code: got=%d want=%d body=%s", contentRecorder.Code, http.StatusOK, contentRecorder.Body.String())
	}
	if !strings.Contains(contentRecorder.Body.String(), "superpowers") {
		t.Fatalf("expected SKILL.md content payload to contain searchable content: %s", contentRecorder.Body.String())
	}

	referenceContentRequest := httptest.NewRequest(
		http.MethodGet,
		fmt.Sprintf("/api/v1/public/skills/%d/resources/content?path=references/codex-tools.md", importedSkill.ID),
		nil,
	)
	referenceContentRequest = withURLParams(referenceContentRequest, map[string]string{
		"skillID": fmt.Sprintf("%d", importedSkill.ID),
	})
	referenceContentRecorder := httptest.NewRecorder()
	app.handleAPIPublicSkillResourceContent(referenceContentRecorder, referenceContentRequest)

	if referenceContentRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected reference content status code: got=%d want=%d body=%s", referenceContentRecorder.Code, http.StatusOK, referenceContentRecorder.Body.String())
	}
	if !strings.Contains(referenceContentRecorder.Body.String(), "Codex") {
		t.Fatalf("expected referenced codex file content in payload: %s", referenceContentRecorder.Body.String())
	}

	searchRequest := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace?q=conversation", nil)
	searchRecorder := httptest.NewRecorder()
	app.handleAPIPublicMarketplace(searchRecorder, searchRequest)

	if searchRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected search status code: got=%d want=%d body=%s", searchRecorder.Code, http.StatusOK, searchRecorder.Body.String())
	}
	searchBody := searchRecorder.Body.String()
	if !strings.Contains(searchBody, `"matching_skills":1`) {
		t.Fatalf("expected real repository skill to be searchable by conversation: %s", searchBody)
	}
	if !strings.Contains(searchBody, `"name":"using-superpowers"`) {
		t.Fatalf("expected searchable skill payload in marketplace search response: %s", searchBody)
	}

	categoryRequest := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/public/marketplace?category=devops&subcategory=git-workflows",
		nil,
	)
	categoryRecorder := httptest.NewRecorder()
	app.handleAPIPublicMarketplace(categoryRecorder, categoryRequest)

	if categoryRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected category status code: got=%d want=%d body=%s", categoryRecorder.Code, http.StatusOK, categoryRecorder.Body.String())
	}
	if !strings.Contains(categoryRecorder.Body.String(), `"matching_skills":1`) {
		t.Fatalf("expected category filter to isolate imported skill: %s", categoryRecorder.Body.String())
	}
	if !strings.Contains(categoryRecorder.Body.String(), `"name":"using-superpowers"`) {
		t.Fatalf("expected imported skill in category filter payload: %s", categoryRecorder.Body.String())
	}
}
