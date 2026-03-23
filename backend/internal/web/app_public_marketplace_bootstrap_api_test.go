package web

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	skilldb "skillsindex/internal/db"
	"skillsindex/internal/models"
	"skillsindex/internal/services"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestHandleAPIPublicMarketplaceReturnsBootstrapShowcaseData(t *testing.T) {
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
	if err := skilldb.EnsureSeedData(database); err != nil {
		t.Fatalf("failed to seed bootstrap marketplace data: %v", err)
	}

	app := &App{
		skillService:    services.NewSkillService(database),
		settingsService: services.NewSettingsService(database),
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace", nil)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIPublicMarketplace(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	var payload struct {
		Stats struct {
			TotalSkills    int `json:"total_skills"`
			MatchingSkills int `json:"matching_skills"`
		} `json:"stats"`
		Summary struct {
			Landing struct {
				TotalSkills   int `json:"total_skills"`
				CategoryCount int `json:"category_count"`
				TopTagCount   int `json:"top_tag_count"`
			} `json:"landing"`
			CategoryHub struct {
				TotalCategories int `json:"total_categories"`
			} `json:"category_hub"`
		} `json:"summary"`
		Pagination struct {
			TotalItems int `json:"total_items"`
		} `json:"pagination"`
		Categories []struct {
			Slug  string `json:"slug"`
			Count int    `json:"count"`
		} `json:"categories"`
		TopTags []struct {
			Name string `json:"name"`
		} `json:"top_tags"`
		Items []struct {
			Name string `json:"name"`
		} `json:"items"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode marketplace payload: %v body=%s", err, recorder.Body.String())
	}

	if payload.Stats.TotalSkills == 0 {
		t.Fatalf("expected bootstrap marketplace data to contribute to total skills")
	}
	if payload.Summary.Landing.TotalSkills == 0 || payload.Summary.Landing.CategoryCount == 0 || payload.Summary.Landing.TopTagCount == 0 {
		t.Fatalf("expected bootstrap marketplace summary to include landing metrics: %+v", payload.Summary.Landing)
	}
	if payload.Summary.CategoryHub.TotalCategories == 0 {
		t.Fatalf("expected bootstrap marketplace summary to include category hub metrics: %+v", payload.Summary.CategoryHub)
	}
	if payload.Stats.MatchingSkills == 0 || payload.Pagination.TotalItems == 0 {
		t.Fatalf("expected bootstrap marketplace payload to include visible items: %+v", payload)
	}
	if len(payload.Items) == 0 {
		t.Fatalf("expected bootstrap marketplace payload to include visible items")
	}
	if payload.Items[0].Name == "" {
		t.Fatalf("expected bootstrap marketplace payload to include item names: %+v", payload.Items)
	}
	if len(payload.TopTags) == 0 {
		t.Fatalf("expected bootstrap marketplace payload to include top tags")
	}

	hasVisibleCategory := false
	for _, category := range payload.Categories {
		if category.Count > 0 {
			hasVisibleCategory = true
			break
		}
	}
	if !hasVisibleCategory {
		t.Fatalf("expected bootstrap marketplace payload to include non-empty category counts: %+v", payload.Categories)
	}
}
