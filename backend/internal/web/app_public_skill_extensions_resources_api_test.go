package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func runGitCommand(t *testing.T, repoPath string, args ...string) {
	t.Helper()
	cmd := exec.Command("git", args...)
	cmd.Dir = repoPath
	output, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("git %s failed: %v: %s", strings.Join(args, " "), err, strings.TrimSpace(string(output)))
	}
}

func createPublicSkillExtensionRepository(t *testing.T) string {
	t.Helper()
	repoPath := filepath.Join(t.TempDir(), "public-skill-repo")
	if err := os.MkdirAll(filepath.Join(repoPath, "docs"), 0o755); err != nil {
		t.Fatalf("failed to create repository layout: %v", err)
	}
	runGitCommand(t, repoPath, "init")
	runGitCommand(t, repoPath, "config", "user.name", "test")
	runGitCommand(t, repoPath, "config", "user.email", "test@example.com")

	if err := os.WriteFile(filepath.Join(repoPath, "skill.json"), []byte(`{
  "name": "Repository Skill",
  "description": "Repository sourced skill",
  "tags": ["repo", "docs"],
  "content_file": "README.md"
}`), 0o644); err != nil {
		t.Fatalf("failed to write skill.json: %v", err)
	}
	if err := os.WriteFile(filepath.Join(repoPath, "README.md"), []byte("# Repository Skill\n\nPrimary repository file.\n"), 0o644); err != nil {
		t.Fatalf("failed to write README.md: %v", err)
	}
	if err := os.WriteFile(filepath.Join(repoPath, "docs", "guide.md"), []byte("## Guide\n\nUse the repository guide.\n"), 0o644); err != nil {
		t.Fatalf("failed to write docs/guide.md: %v", err)
	}
	if err := os.WriteFile(filepath.Join(repoPath, "docs", "query.sql"), []byte("SELECT 1;\n"), 0o644); err != nil {
		t.Fatalf("failed to write docs/query.sql: %v", err)
	}

	runGitCommand(t, repoPath, "add", "skill.json", "README.md", "docs/guide.md", "docs/query.sql")
	runGitCommand(t, repoPath, "commit", "-m", "init")
	return repoPath
}

func TestHandleAPIPublicSkillResourcesReturnsRealFields(t *testing.T) {
	app, _, leftSkill, _ := setupPublicSkillExtensionAPITestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(leftSkill.ID), 10)+"/resources", nil)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(leftSkill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillResources(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"source_branch":"main"`) {
		t.Fatalf("missing source branch in resources response: %s", body)
	}
	if !strings.Contains(body, `"source_path":"skills/repository-sync-guard/SKILL.md"`) {
		t.Fatalf("missing source path in resources response: %s", body)
	}
	if !strings.Contains(body, `"repo_url":"https://github.com/example/repository-sync-guard"`) {
		t.Fatalf("missing repo url in resources response: %s", body)
	}
	if !strings.Contains(body, `"file_count":1`) {
		t.Fatalf("missing file count in resources response: %s", body)
	}
	if !strings.Contains(body, `"entry_file":"skills/repository-sync-guard/SKILL.md"`) {
		t.Fatalf("missing fallback entry file in resources response: %s", body)
	}
	if !strings.Contains(body, `"mechanism":"fallback"`) {
		t.Fatalf("missing fallback mechanism in resources response: %s", body)
	}
	if !strings.Contains(body, `"reference_count":0`) {
		t.Fatalf("missing fallback reference count in resources response: %s", body)
	}
}

func TestHandleAPIPublicSkillResourcesFallsBackToPersistedAnalysis(t *testing.T) {
	app, owner, _, _ := setupPublicSkillExtensionAPITestApp(t)

	skill, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Persisted Analysis Skill",
		Description:     "Uses persisted source analysis when remote source is unavailable.",
		Content:         "# Persisted Analysis Skill",
		Tags:            []string{"repository", "analysis"},
		CategorySlug:    "devops",
		SubcategorySlug: "git-workflows",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeRepository,
		SourceURL:       "/path/that/does/not/exist",
		SourceBranch:    "main",
		SourcePath:      "skills/persisted-analysis/SKILL.md",
		RepoURL:         "/path/that/does/not/exist",
		InstallCommand:  "codex skill install github:test/persisted-analysis",
		Analysis: services.SourceTopologySnapshot{
			EntryFile:       "SKILL.md",
			Mechanism:       "skill_manifest",
			MetadataSources: []string{"skill.json", "skill.json.content_file"},
			ReferencePaths:  []string{"references/guide.md"},
			Dependencies: []services.SourceDependency{
				{Kind: "file", Target: "references/guide.md"},
				{Kind: "skill", Target: "superpowers:systematic-debugging"},
			},
		},
	})
	if err != nil {
		t.Fatalf("failed to create skill: %v", err)
	}
	app.repositoryService = services.NewRepositorySyncService()

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/resources", nil)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillResources(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"mechanism":"skill_manifest"`) {
		t.Fatalf("missing persisted mechanism in resources response: %s", body)
	}
	if !strings.Contains(body, `"reference_count":1`) {
		t.Fatalf("missing persisted reference count in resources response: %s", body)
	}
	if !strings.Contains(body, `"dependency_count":2`) {
		t.Fatalf("missing persisted dependency count in resources response: %s", body)
	}
	if !strings.Contains(body, `"reference_paths":["references/guide.md"]`) {
		t.Fatalf("missing persisted reference paths in resources response: %s", body)
	}
}

func TestHandleAPIPublicSkillResourcesReturnsParsedReferenceTopology(t *testing.T) {
	app, owner := setupAdminIngestionAPITestApp(t)
	repoDir := t.TempDir()
	createRepositoryFixtureFiles(t, repoDir, map[string]string{
		"skill.json": `{"name":"Repository API Skill","description":"Imported from repository","tags":["repository","api"],"content_file":"SKILL.md"}`,
		"SKILL.md": `---
name: repository-api-skill
description: Repository sourced skill
---

# Repository API Skill

Read [guide](references/guide.md) and [query](references/query.sql).
`,
		"references/guide.md":  "# Guide\n\nDetailed guidance.\n",
		"references/query.sql": "SELECT 1;\n",
	})
	runCommand(t, repoDir, "git", "init")
	runCommand(t, repoDir, "git", "config", "user.email", "test@example.com")
	runCommand(t, repoDir, "git", "config", "user.name", "Test User")
	runCommand(t, repoDir, "git", "add", ".")
	runCommand(t, repoDir, "git", "commit", "-m", "init")

	skill, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Repository API Skill",
		Description:     "Imported from repository",
		Content:         "# Repository API Skill",
		Tags:            []string{"repository", "api"},
		CategorySlug:    "devops",
		SubcategorySlug: "git-workflows",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeRepository,
		SourceURL:       repoDir,
		SourceBranch:    "main",
		SourcePath:      "",
		RepoURL:         repoDir,
		InstallCommand:  "codex skill install github:test/repository-api",
	})
	if err != nil {
		t.Fatalf("failed to create repository skill: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(skill.ID), 10)+"/resources", nil)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(skill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillResources(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"entry_file":"SKILL.md"`) {
		t.Fatalf("missing parsed entry file in resources response: %s", body)
	}
	if !strings.Contains(body, `"mechanism":"skill_manifest"`) {
		t.Fatalf("missing parsed mechanism in resources response: %s", body)
	}
	if !strings.Contains(body, `"metadata_sources":["SKILL.md.frontmatter","skill.json","skill.json.content_file"]`) {
		t.Fatalf("missing parsed metadata sources in resources response: %s", body)
	}
	if !strings.Contains(body, `"reference_count":2`) {
		t.Fatalf("missing parsed reference count in resources response: %s", body)
	}
	if !strings.Contains(body, `"reference_paths":["references/guide.md","references/query.sql"]`) {
		t.Fatalf("missing parsed reference paths in resources response: %s", body)
	}
	if !strings.Contains(body, `"dependency_count":2`) {
		t.Fatalf("missing parsed dependency count in resources response: %s", body)
	}
	if !strings.Contains(body, `"file_count":4`) {
		t.Fatalf("expected all repository files in resources response: %s", body)
	}
}

func TestHandleAPIPublicSkillResourcesReturnsRepositoryFiles(t *testing.T) {
	app, owner, _, _ := setupPublicSkillExtensionAPITestApp(t)
	repoPath := createPublicSkillExtensionRepository(t)
	app.repositoryService = services.NewRepositorySyncService()

	repositorySkill, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Repository Files Skill",
		Description:     "Browse real repository files.",
		Content:         "# Repository Files Skill\n\nFallback content.",
		Tags:            []string{"repo", "files"},
		CategorySlug:    "development",
		SubcategorySlug: "automation",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeRepository,
		RecordOrigin:    models.RecordOriginImported,
		SourceURL:       repoPath,
		SourceBranch:    "",
		SourcePath:      "",
		RepoURL:         repoPath,
		InstallCommand:  "codex skill install local/repository-files-skill",
		StarCount:       99,
		QualityScore:    9.1,
	})
	if err != nil {
		t.Fatalf("failed to create repository skill: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(repositorySkill.ID), 10)+"/resources", nil)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(repositorySkill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillResources(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"name":"README.md"`) {
		t.Fatalf("expected README.md in resources response: %s", body)
	}
	if !strings.Contains(body, `"name":"docs/guide.md"`) {
		t.Fatalf("expected docs/guide.md in resources response: %s", body)
	}
	if !strings.Contains(body, `"name":"docs/query.sql"`) {
		t.Fatalf("expected docs/query.sql in resources response: %s", body)
	}
}

func TestHandleAPIPublicSkillResourcesServiceUnavailable(t *testing.T) {
	app, _, leftSkill, _ := setupPublicSkillExtensionAPITestApp(t)
	app.skillService = nil

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(leftSkill.ID), 10)+"/resources", nil)
	req.Header.Set("X-Request-ID", "req-public-skill-resources-service-unavailable")
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(leftSkill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillResources(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusServiceUnavailable)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "service_unavailable" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Skill service unavailable" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-public-skill-resources-service-unavailable" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIPublicSkillResourcesInvalidSkillIDIncludesRequestID(t *testing.T) {
	app, _, _, _ := setupPublicSkillExtensionAPITestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/invalid/resources", nil)
	req.Header.Set("X-Request-ID", "req-public-skill-resources-invalid-skill")
	req = withURLParams(req, map[string]string{
		"skillID": "invalid",
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillResources(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "skill_not_found" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Skill not found" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-public-skill-resources-invalid-skill" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIPublicSkillVersionsInvalidSkillIDIncludesRequestID(t *testing.T) {
	app, _, _, _ := setupPublicSkillExtensionAPITestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/invalid/versions", nil)
	req.Header.Set("X-Request-ID", "req-public-skill-versions-invalid-skill")
	req = withURLParams(req, map[string]string{
		"skillID": "invalid",
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillVersions(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "skill_not_found" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Skill not found" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-public-skill-versions-invalid-skill" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
