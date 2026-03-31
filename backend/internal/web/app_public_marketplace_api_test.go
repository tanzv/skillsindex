package web

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupPublicMarketplaceAPITestApp(t *testing.T) (*App, *gorm.DB, models.User) {
	t.Helper()
	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
	database, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open sqlite db: %v", err)
	}
	if err := database.AutoMigrate(
		&models.User{},
		&models.Organization{},
		&models.Skill{},
		&models.SkillVersion{},
		&models.Tag{},
		&models.SkillTag{},
		&models.SystemSetting{},
	); err != nil {
		t.Fatalf("failed to migrate sqlite db: %v", err)
	}

	admin := models.User{Username: "market-admin", Role: models.RoleAdmin}
	if err := database.Create(&admin).Error; err != nil {
		t.Fatalf("failed to create admin user: %v", err)
	}

	now := time.Now().UTC()
	skills := []models.Skill{
		{
			OwnerID:         admin.ID,
			Name:            "React Dashboard Builder",
			Description:     "Prototype-driven dashboard workflow",
			Content:         "React, reusable components, and release automation",
			CategorySlug:    "development",
			SubcategorySlug: "frontend",
			Visibility:      models.VisibilityPublic,
			SourceType:      models.SourceTypeManual,
			RecordOrigin:    models.RecordOriginImported,
			StarCount:       452,
			QualityScore:    9.4,
			UpdatedAt:       now,
		},
		{
			OwnerID:         admin.ID,
			Name:            "Ops Governance Toolkit",
			Description:     "Audit and compliance operations",
			Content:         "incident process and operational controls",
			CategorySlug:    "devops",
			SubcategorySlug: "monitoring",
			Visibility:      models.VisibilityPublic,
			SourceType:      models.SourceTypeRepository,
			RecordOrigin:    models.RecordOriginImported,
			StarCount:       188,
			QualityScore:    8.1,
			UpdatedAt:       now.Add(-12 * time.Hour),
		},
	}
	createdSkills := make([]models.Skill, 0, len(skills))
	for _, skill := range skills {
		item := skill
		if err := database.Create(&item).Error; err != nil {
			t.Fatalf("failed to create skill %q: %v", item.Name, err)
		}
		createdSkills = append(createdSkills, item)
	}

	skillService := services.NewSkillService(database)
	if err := skillService.ReplaceSkillTags(context.Background(), createdSkills[0].ID, []string{"react", "prototype", "frontend"}); err != nil {
		t.Fatalf("failed to replace tags for skill 1: %v", err)
	}
	if err := skillService.ReplaceSkillTags(context.Background(), createdSkills[1].ID, []string{"ops", "governance"}); err != nil {
		t.Fatalf("failed to replace tags for skill 2: %v", err)
	}

	return &App{
		skillService:    skillService,
		settingsService: services.NewSettingsService(database),
	}, database, admin
}

func TestHandleAPIPublicMarketplaceReturnsExpectedPayload(t *testing.T) {
	app, _, _ := setupPublicMarketplaceAPITestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace?q=react&category=development&sort=stars&mode=keyword&page=1", nil)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIPublicMarketplace(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"total_skills":2`) {
		t.Fatalf("missing total_skills in response: %s", body)
	}
	if !strings.Contains(body, `"matching_skills":1`) {
		t.Fatalf("missing matching_skills in response: %s", body)
	}
	if !strings.Contains(body, `"React Dashboard Builder"`) {
		t.Fatalf("missing expected skill payload: %s", body)
	}
	if !strings.Contains(body, `"react"`) {
		t.Fatalf("missing top tags payload: %s", body)
	}
	if !strings.Contains(body, `"filter_options"`) {
		t.Fatalf("missing filter_options payload: %s", body)
	}
	if !strings.Contains(body, `"summary"`) {
		t.Fatalf("missing summary payload: %s", body)
	}
	if !strings.Contains(body, `"landing"`) || !strings.Contains(body, `"category_hub"`) {
		t.Fatalf("missing marketplace summary sections: %s", body)
	}
	if !strings.Contains(body, `"category_detail"`) || !strings.Contains(body, `"category_slug":"development"`) {
		t.Fatalf("missing category detail summary payload: %s", body)
	}
	if !strings.Contains(body, `"subcategory_count":1`) {
		t.Fatalf("missing expected category detail subcategory count: %s", body)
	}
	if !strings.Contains(body, `"value":"recent"`) || !strings.Contains(body, `"value":"ai"`) {
		t.Fatalf("missing expected default filter option values: %s", body)
	}
	if !strings.Contains(body, `"category_overrides"`) {
		t.Fatalf("missing category_overrides payload: %s", body)
	}
	if !strings.Contains(body, `"category_slug":"devops"`) {
		t.Fatalf("missing expected devops category override payload: %s", body)
	}

	var payload struct {
		Categories []struct {
			Slug string `json:"slug"`
		} `json:"categories"`
		Items []struct {
			Name                  string `json:"name"`
			Category              string `json:"category"`
			Subcategory           string `json:"subcategory"`
			CategoryGroup         string `json:"category_group"`
			CategoryGroupLabel    string `json:"category_group_label"`
			SubcategoryGroup      string `json:"subcategory_group"`
			SubcategoryGroupLabel string `json:"subcategory_group_label"`
		} `json:"items"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode marketplace payload: %v", err)
	}
	if len(payload.Categories) == 0 {
		t.Fatalf("expected grouped categories in payload")
	}
	if payload.Categories[0].Slug != "programming-development" {
		t.Fatalf("expected grouped category slug in payload, got=%s", payload.Categories[0].Slug)
	}
	if len(payload.Items) == 0 {
		t.Fatalf("expected marketplace items in payload")
	}
	if payload.Items[0].CategoryGroup == "" || payload.Items[0].SubcategoryGroup == "" {
		t.Fatalf("expected grouped category fields in marketplace items: %+v", payload.Items[0])
	}
	if payload.Items[0].CategoryGroupLabel == "" || payload.Items[0].SubcategoryGroupLabel == "" {
		t.Fatalf("expected grouped category labels in marketplace items: %+v", payload.Items[0])
	}
}

func TestHandleAPIPublicMarketplaceSupportsGroupedCategoryFilters(t *testing.T) {
	app, _, _ := setupPublicMarketplaceAPITestApp(t)

	req := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/public/marketplace?category_group=programming-development&subcategory_group=devops-cloud",
		nil,
	)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIPublicMarketplace(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	body := recorder.Body.String()
	if !strings.Contains(body, `"matching_skills":1`) {
		t.Fatalf("expected grouped filters to narrow marketplace matches: %s", body)
	}
	if !strings.Contains(body, `"Ops Governance Toolkit"`) {
		t.Fatalf("expected grouped subcategory filter to keep matching devops skill: %s", body)
	}
	if strings.Contains(body, `"React Dashboard Builder"`) {
		t.Fatalf("expected grouped subcategory filter to exclude non-matching programming skills: %s", body)
	}
	if !strings.Contains(body, `"category_group":"programming-development"`) {
		t.Fatalf("expected grouped category filter to echo into response filters: %s", body)
	}
	if !strings.Contains(body, `"subcategory_group":"devops-cloud"`) {
		t.Fatalf("expected grouped subcategory filter to echo into response filters: %s", body)
	}
	if !strings.Contains(body, `"category_slug":"programming-development"`) {
		t.Fatalf("expected grouped category detail summary payload: %s", body)
	}
	if !strings.Contains(body, `"total_skills":2`) {
		t.Fatalf("expected grouped category detail total to reflect full grouped category: %s", body)
	}
	if !strings.Contains(body, `"subcategory_count":2`) {
		t.Fatalf("expected grouped category detail to report grouped subcategory count: %s", body)
	}
}

func TestHandleAPIPublicMarketplaceUsesStableLowercaseTopTagKeys(t *testing.T) {
	app, _, _ := setupPublicMarketplaceAPITestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace", nil)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIPublicMarketplace(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	var payload struct {
		TopTags []map[string]any `json:"top_tags"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode marketplace payload: %v", err)
	}
	if len(payload.TopTags) == 0 {
		t.Fatalf("expected top_tags payload to be populated")
	}
	if _, ok := payload.TopTags[0]["name"]; !ok {
		t.Fatalf("expected lowercase name key in top_tags payload: %+v", payload.TopTags[0])
	}
	if _, ok := payload.TopTags[0]["count"]; !ok {
		t.Fatalf("expected lowercase count key in top_tags payload: %+v", payload.TopTags[0])
	}
	if _, ok := payload.TopTags[0]["Name"]; ok {
		t.Fatalf("unexpected exported Go field key in top_tags payload: %+v", payload.TopTags[0])
	}
	if _, ok := payload.TopTags[0]["Count"]; ok {
		t.Fatalf("unexpected exported Go field key in top_tags payload: %+v", payload.TopTags[0])
	}
}

func TestHandleAPIPublicMarketplaceServiceUnavailable(t *testing.T) {
	app, _, _ := setupPublicMarketplaceAPITestApp(t)
	app.skillService = nil

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace", nil)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Request-ID", "req-public-marketplace-service-unavailable")
	recorder := httptest.NewRecorder()

	app.handleAPIPublicMarketplace(recorder, req)

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
	if payload["request_id"] != "req-public-marketplace-service-unavailable" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPISearchFailureHidesInternalError(t *testing.T) {
	app, db, _ := setupPublicMarketplaceAPITestApp(t)
	if err := db.Migrator().DropTable(&models.Skill{}); err != nil {
		t.Fatalf("failed to drop skills table: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/search?q=react", nil)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Request-ID", "req-public-search-failed")
	recorder := httptest.NewRecorder()

	app.handleAPISearch(recorder, req)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusInternalServerError)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "search_failed" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Failed to search marketplace skills" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-public-search-failed" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIAISearchFailureHidesInternalError(t *testing.T) {
	app, db, _ := setupPublicMarketplaceAPITestApp(t)
	if err := db.Migrator().DropTable(&models.Skill{}); err != nil {
		t.Fatalf("failed to drop skills table: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/search/ai?q=react", nil)
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Request-ID", "req-public-ai-search-failed")
	recorder := httptest.NewRecorder()

	app.handleAPIAISearch(recorder, req)

	if recorder.Code != http.StatusInternalServerError {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusInternalServerError)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "ai_search_failed" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Failed to run AI search" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-public-ai-search-failed" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestHandleAPIPublicMarketplaceRespectsRequestedPageSize(t *testing.T) {
	app, _, _ := setupPublicMarketplaceAPITestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace?sort=quality&page=1&page_size=1", nil)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIPublicMarketplace(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	var payload struct {
		Filters struct {
			PageSize int `json:"page_size"`
		} `json:"filters"`
		Pagination struct {
			PageSize int `json:"page_size"`
		} `json:"pagination"`
		Items []struct {
			Name string `json:"name"`
		} `json:"items"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode marketplace payload: %v body=%s", err, recorder.Body.String())
	}

	if payload.Filters.PageSize != 1 {
		t.Fatalf("expected response filters to echo page_size=1, got=%d", payload.Filters.PageSize)
	}
	if payload.Pagination.PageSize != 1 {
		t.Fatalf("expected pagination page_size to be 1, got=%d", payload.Pagination.PageSize)
	}
	if len(payload.Items) != 1 {
		t.Fatalf("expected one marketplace item when page_size=1, got=%d", len(payload.Items))
	}
	if payload.Items[0].Name != "React Dashboard Builder" {
		t.Fatalf("expected top quality skill to remain first item, got=%q", payload.Items[0].Name)
	}
}

func TestHandleAPIPublicMarketplaceIncludesSessionUserContext(t *testing.T) {
	app, _, admin := setupPublicMarketplaceAPITestApp(t)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace", nil)
	req.Header.Set("Accept", "application/json")
	req = withCurrentUser(req, &admin)
	recorder := httptest.NewRecorder()

	app.handleAPIPublicMarketplace(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	body := recorder.Body.String()
	if !strings.Contains(body, `"session_user"`) {
		t.Fatalf("missing session user payload: %s", body)
	}
	if !strings.Contains(body, `"username":"market-admin"`) {
		t.Fatalf("missing session user details: %s", body)
	}
	if !strings.Contains(body, `"can_access_dashboard":true`) {
		t.Fatalf("missing can_access_dashboard flag: %s", body)
	}
}

func TestHandleAPIPublicMarketplaceRequiresAuthenticationWhenMarketplaceIsPrivate(t *testing.T) {
	app, _, admin := setupPublicMarketplaceAPITestApp(t)
	if err := app.settingsService.SetBool(context.Background(), services.SettingMarketplacePublicAccess, false); err != nil {
		t.Fatalf("failed to seed marketplace access setting: %v", err)
	}

	anonymousReq := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace", nil)
	anonymousReq.Header.Set("Accept", "application/json")
	anonymousRecorder := httptest.NewRecorder()

	app.handleAPIPublicMarketplace(anonymousRecorder, anonymousReq)

	if anonymousRecorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected anonymous status code: got=%d want=%d", anonymousRecorder.Code, http.StatusUnauthorized)
	}
	if !strings.Contains(anonymousRecorder.Body.String(), `"error":"unauthorized"`) {
		t.Fatalf("missing unauthorized payload: %s", anonymousRecorder.Body.String())
	}

	authenticatedReq := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace", nil)
	authenticatedReq.Header.Set("Accept", "application/json")
	authenticatedReq = withCurrentUser(authenticatedReq, &admin)
	authenticatedRecorder := httptest.NewRecorder()

	app.handleAPIPublicMarketplace(authenticatedRecorder, authenticatedReq)

	if authenticatedRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected authenticated status code: got=%d want=%d", authenticatedRecorder.Code, http.StatusOK)
	}
}

func TestHandleAPIPublicMarketplaceExcludesSeedRecords(t *testing.T) {
	app, _, admin := setupPublicMarketplaceAPITestApp(t)

	seedSkill, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         admin.ID,
		Name:            "Seed Marketplace Skill",
		Description:     "Seed data should stay hidden from public marketplace payloads",
		Content:         "seed-content",
		CategorySlug:    "development",
		SubcategorySlug: "frontend",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeManual,
		RecordOrigin:    models.RecordOriginSeed,
	})
	if err != nil {
		t.Fatalf("failed to create seed skill: %v", err)
	}
	if err := app.skillService.ReplaceSkillTags(context.Background(), seedSkill.ID, []string{"seed"}); err != nil {
		t.Fatalf("failed to replace seed skill tags: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace", nil)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIPublicMarketplace(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}

	body := recorder.Body.String()
	if strings.Contains(body, `"Seed Marketplace Skill"`) {
		t.Fatalf("seed skill should not appear in public marketplace payload: %s", body)
	}
	if !strings.Contains(body, `"total_skills":2`) {
		t.Fatalf("seed records should not change marketplace totals: %s", body)
	}
}
