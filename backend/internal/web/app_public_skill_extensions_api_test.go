package web

import (
	"context"
	"encoding/json"
	"fmt"
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

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
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

func setupPublicSkillExtensionAPITestApp(t *testing.T) (*App, models.User, models.Skill, models.Skill) {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	database, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := database.AutoMigrate(
		&models.User{},
		&models.Skill{},
		&models.SkillVersion{},
		&models.Tag{},
		&models.SkillTag{},
		&models.SystemSetting{},
	); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	owner := models.User{
		Username: "market-owner",
		Role:     models.RoleAdmin,
	}
	if err := database.Create(&owner).Error; err != nil {
		t.Fatalf("failed to create owner: %v", err)
	}

	skillService := services.NewSkillService(database)

	leftSkill, err := skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Repository Sync Guard",
		Description:     "Guard repository-based skill sync health.",
		Content:         "# Repository Sync Guard\n\nInitial content.",
		Tags:            []string{"sync", "repo"},
		CategorySlug:    "development",
		SubcategorySlug: "automation",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeRepository,
		RecordOrigin:    models.RecordOriginImported,
		SourceURL:       "https://github.com/example/repository-sync-guard",
		SourceBranch:    "main",
		SourcePath:      "skills/repository-sync-guard/SKILL.md",
		RepoURL:         "https://github.com/example/repository-sync-guard",
		InstallCommand:  "codex skill install github:example/repository-sync-guard",
		StarCount:       240,
		QualityScore:    8.9,
	})
	if err != nil {
		t.Fatalf("failed to create left skill: %v", err)
	}

	rightSkill, err := skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Quality Signal Lens",
		Description:     "Inspect quality signals across imported skills.",
		Content:         "# Quality Signal Lens\n\nQuality-first market insights.",
		Tags:            []string{"quality", "analytics"},
		CategorySlug:    "operations",
		SubcategorySlug: "insights",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeManual,
		RecordOrigin:    models.RecordOriginImported,
		SourceURL:       "https://skills.example.com/quality-signal-lens",
		SourceBranch:    "stable",
		SourcePath:      "catalog/quality-signal-lens/SKILL.md",
		RepoURL:         "https://github.com/example/quality-signal-lens",
		InstallCommand:  "codex skill install github:example/quality-signal-lens",
		StarCount:       188,
		QualityScore:    9.3,
	})
	if err != nil {
		t.Fatalf("failed to create right skill: %v", err)
	}

	if _, err := skillService.UpdateSyncedSkill(context.Background(), services.SyncUpdateInput{
		SkillID:      leftSkill.ID,
		OwnerID:      owner.ID,
		SourceType:   models.SourceTypeRepository,
		SourceURL:    "https://github.com/example/repository-sync-guard",
		SourceBranch: "main",
		SourcePath:   "skills/repository-sync-guard/SKILL.md",
		Meta: services.ExtractedSkill{
			Name:        "Repository Sync Guard",
			Description: "Guard repository-based skill sync health with tracked releases.",
			Content:     "# Repository Sync Guard\n\nUpdated content.",
			Tags:        []string{"sync", "repo", "release"},
		},
	}); err != nil {
		t.Fatalf("failed to update left skill for version history: %v", err)
	}

	app := &App{
		skillService:    skillService,
		settingsService: services.NewSettingsService(database),
	}
	return app, owner, leftSkill, rightSkill
}

func TestHandleAPIPublicSkillCompareReturnsRequestedSkills(t *testing.T) {
	app, _, leftSkill, rightSkill := setupPublicSkillExtensionAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/public/skills/compare?left="+strconv.FormatUint(uint64(leftSkill.ID), 10)+"&right="+strconv.FormatUint(uint64(rightSkill.ID), 10),
		nil,
	)
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillCompare(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	var payload struct {
		LeftSkill struct {
			Name                  string `json:"name"`
			CategoryGroup         string `json:"category_group"`
			CategoryGroupLabel    string `json:"category_group_label"`
			SubcategoryGroup      string `json:"subcategory_group"`
			SubcategoryGroupLabel string `json:"subcategory_group_label"`
		} `json:"left_skill"`
		RightSkill struct {
			Name                  string `json:"name"`
			CategoryGroup         string `json:"category_group"`
			CategoryGroupLabel    string `json:"category_group_label"`
			SubcategoryGroup      string `json:"subcategory_group"`
			SubcategoryGroupLabel string `json:"subcategory_group_label"`
		} `json:"right_skill"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode compare payload: %v", err)
	}
	if payload.LeftSkill.Name != "Repository Sync Guard" || payload.RightSkill.Name != "Quality Signal Lens" {
		t.Fatalf("missing requested compare skills: %+v", payload)
	}
	if payload.LeftSkill.CategoryGroup == "" || payload.LeftSkill.SubcategoryGroup == "" {
		t.Fatalf("expected grouped fields on left compare skill: %+v", payload.LeftSkill)
	}
	if payload.RightSkill.CategoryGroupLabel == "" || payload.RightSkill.SubcategoryGroupLabel == "" {
		t.Fatalf("expected grouped labels on right compare skill: %+v", payload.RightSkill)
	}
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
}

func TestHandleAPIPublicSkillVersionsReturnsCapturedVersions(t *testing.T) {
	app, _, leftSkill, _ := setupPublicSkillExtensionAPITestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/"+strconv.FormatUint(uint64(leftSkill.ID), 10)+"/versions", nil)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(leftSkill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillVersions(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"version_number":2`) {
		t.Fatalf("expected latest sync version in response: %s", body)
	}
	if !strings.Contains(body, `"trigger":"sync"`) {
		t.Fatalf("expected sync trigger in response: %s", body)
	}
	if !strings.Contains(body, `"trigger":"create"`) {
		t.Fatalf("expected create trigger in response: %s", body)
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

func TestHandleAPIPublicSkillResourceContentReturnsSelectedFile(t *testing.T) {
	app, owner, _, _ := setupPublicSkillExtensionAPITestApp(t)
	repoPath := createPublicSkillExtensionRepository(t)
	app.repositoryService = services.NewRepositorySyncService()

	repositorySkill, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Repository Content Skill",
		Description:     "Read real repository file content.",
		Content:         "# Repository Content Skill\n\nFallback content.",
		Tags:            []string{"repo", "content"},
		CategorySlug:    "development",
		SubcategorySlug: "automation",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeRepository,
		RecordOrigin:    models.RecordOriginImported,
		SourceURL:       repoPath,
		RepoURL:         repoPath,
		InstallCommand:  "codex skill install local/repository-content-skill",
		StarCount:       77,
		QualityScore:    9.0,
	})
	if err != nil {
		t.Fatalf("failed to create repository skill: %v", err)
	}

	req := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/public/skills/"+strconv.FormatUint(uint64(repositorySkill.ID), 10)+"/resource-file?path=docs%2Fguide.md",
		nil,
	)
	req = withURLParams(req, map[string]string{
		"skillID": strconv.FormatUint(uint64(repositorySkill.ID), 10),
	})
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillResourceContent(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"path":"docs/guide.md"`) {
		t.Fatalf("expected selected file path in resource content response: %s", body)
	}
	if !strings.Contains(body, `"language":"Markdown"`) {
		t.Fatalf("expected markdown language in resource content response: %s", body)
	}
	if !strings.Contains(body, `Use the repository guide.`) {
		t.Fatalf("expected repository file content in response: %s", body)
	}
}
