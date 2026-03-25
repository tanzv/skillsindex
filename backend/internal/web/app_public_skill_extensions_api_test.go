package web

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

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

func TestHandleAPIPublicSkillCompareRejectsInvalidQuery(t *testing.T) {
	app, _, leftSkill, _ := setupPublicSkillExtensionAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/public/skills/compare?left="+strconv.FormatUint(uint64(leftSkill.ID), 10),
		nil,
	)
	req.Header.Set("X-Request-ID", "req-public-skill-compare-invalid-query")
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillCompare(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_compare_query" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Both left and right skill identifiers are required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-public-skill-compare-invalid-query" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIPublicSkillCompareServiceUnavailable(t *testing.T) {
	app, _, _, _ := setupPublicSkillExtensionAPITestApp(t)
	app.skillService = nil

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/skills/compare?left=1&right=2", nil)
	req.Header.Set("X-Request-ID", "req-public-skill-compare-service-unavailable")
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillCompare(recorder, req)

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
	if payload["request_id"] != "req-public-skill-compare-service-unavailable" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIPublicSkillCompareLeftSkillNotFoundIncludesRequestID(t *testing.T) {
	app, _, _, rightSkill := setupPublicSkillExtensionAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/public/skills/compare?left=99999&right="+strconv.FormatUint(uint64(rightSkill.ID), 10),
		nil,
	)
	req.Header.Set("X-Request-ID", "req-public-skill-compare-left-not-found")
	recorder := httptest.NewRecorder()

	app.handleAPIPublicSkillCompare(recorder, req)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusNotFound)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "skill_not_found" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "left skill not found" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-public-skill-compare-left-not-found" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
