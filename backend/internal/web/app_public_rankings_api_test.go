package web

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestHandleAPIPublicRankingsReturnsBackendOwnedRankingPayload(t *testing.T) {
	app, admin := setupPublicMarketplaceAPITestApp(t)

	qualityLeader, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         admin.ID,
		Name:            "Quality Leader",
		Description:     "Highest quality public marketplace skill.",
		Content:         "quality leader content",
		CategorySlug:    "development",
		SubcategorySlug: "backend",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeRepository,
		RecordOrigin:    models.RecordOriginImported,
		StarCount:       188,
		QualityScore:    9.8,
		Tags:            []string{"quality", "ranking"},
	})
	if err != nil {
		t.Fatalf("failed to create quality leader: %v", err)
	}
	if err := app.skillService.ReplaceSkillTags(context.Background(), qualityLeader.ID, []string{"quality", "ranking"}); err != nil {
		t.Fatalf("failed to tag quality leader: %v", err)
	}
	if _, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         admin.ID,
		Name:            "Seed Hidden Leader",
		Description:     "Should not appear because it is seed data.",
		Content:         "seed hidden content",
		CategorySlug:    "development",
		SubcategorySlug: "backend",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeManual,
		RecordOrigin:    models.RecordOriginSeed,
		StarCount:       999,
		QualityScore:    10,
	}); err != nil {
		t.Fatalf("failed to create seed hidden skill: %v", err)
	}
	if _, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         admin.ID,
		Name:            "Private Hidden Leader",
		Description:     "Should not appear because it is private.",
		Content:         "private hidden content",
		CategorySlug:    "development",
		SubcategorySlug: "backend",
		Visibility:      models.VisibilityPrivate,
		SourceType:      models.SourceTypeManual,
		RecordOrigin:    models.RecordOriginImported,
		StarCount:       700,
		QualityScore:    9.9,
	}); err != nil {
		t.Fatalf("failed to create private hidden skill: %v", err)
	}
	if err := app.settingsService.Set(context.Background(), services.SettingMarketplaceRankingDefaultSort, "quality"); err != nil {
		t.Fatalf("failed to seed ranking default sort: %v", err)
	}
	if err := app.settingsService.SetInt(context.Background(), services.SettingMarketplaceRankingLimit, 3); err != nil {
		t.Fatalf("failed to seed ranking limit: %v", err)
	}
	if err := app.settingsService.SetInt(context.Background(), services.SettingMarketplaceRankingHighlightLimit, 2); err != nil {
		t.Fatalf("failed to seed highlight limit: %v", err)
	}
	if err := app.settingsService.SetInt(context.Background(), services.SettingMarketplaceRankingCategoryLeaderLimit, 1); err != nil {
		t.Fatalf("failed to seed category leader limit: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/rankings", nil)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIPublicRankings(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	var payload struct {
		Sort        string `json:"sort"`
		RankedItems []struct {
			ID   uint   `json:"id"`
			Name string `json:"name"`
		} `json:"ranked_items"`
		Highlights []struct {
			ID uint `json:"id"`
		} `json:"highlights"`
		ListItems []struct {
			ID uint `json:"id"`
		} `json:"list_items"`
		Summary struct {
			TotalCompared  int     `json:"total_compared"`
			TopStars       int     `json:"top_stars"`
			TopQuality     float64 `json:"top_quality"`
			AverageQuality float64 `json:"average_quality"`
		} `json:"summary"`
		CategoryLeaders []struct {
			CategorySlug string `json:"category_slug"`
			Count        int    `json:"count"`
			LeadingSkill struct {
				ID   uint   `json:"id"`
				Name string `json:"name"`
			} `json:"leading_skill"`
		} `json:"category_leaders"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode rankings payload: %v", err)
	}

	if payload.Sort != "quality" {
		t.Fatalf("unexpected ranking sort: got=%s want=quality", payload.Sort)
	}
	if len(payload.RankedItems) != 3 {
		t.Fatalf("expected ranked items payload to honor ranking limit, got=%d", len(payload.RankedItems))
	}
	if payload.RankedItems[0].ID != qualityLeader.ID {
		t.Fatalf("expected quality leader first: got=%d want=%d", payload.RankedItems[0].ID, qualityLeader.ID)
	}
	if len(payload.Highlights) != 2 {
		t.Fatalf("expected highlight payload to honor highlight limit, got=%d", len(payload.Highlights))
	}
	if payload.Summary.TotalCompared != len(payload.RankedItems) {
		t.Fatalf("summary should reflect ranked item count: got=%d want=%d", payload.Summary.TotalCompared, len(payload.RankedItems))
	}
	if payload.Summary.TopQuality < 9.8 {
		t.Fatalf("expected top quality to include the strongest skill: got=%.1f", payload.Summary.TopQuality)
	}
	if len(payload.CategoryLeaders) != 1 {
		t.Fatalf("expected category leaders payload to honor category leader limit, got=%d", len(payload.CategoryLeaders))
	}
	for _, item := range payload.RankedItems {
		if item.Name == "Seed Hidden Leader" || item.Name == "Private Hidden Leader" {
			t.Fatalf("hidden skills must not appear in ranking payload: %+v", payload.RankedItems)
		}
	}
}
