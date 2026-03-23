package web

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func seedPublicMarketplaceScopeSkills(
	t *testing.T,
	app *App,
	owner models.User,
	count int,
	categorySlug string,
	subcategorySlug string,
) {
	t.Helper()
	if app == nil || app.skillService == nil {
		t.Fatalf("expected skill service for scope seed")
	}

	now := time.Now().UTC()
	for index := 0; index < count; index++ {
		item, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
			OwnerID:         owner.ID,
			Name:            fmt.Sprintf("Scope Skill %s %02d", categorySlug, index),
			Description:     "Scope-aware public marketplace coverage",
			Content:         "category scope regression coverage",
			CategorySlug:    categorySlug,
			SubcategorySlug: subcategorySlug,
			Visibility:      models.VisibilityPublic,
			SourceType:      models.SourceTypeRepository,
			RecordOrigin:    models.RecordOriginImported,
			StarCount:       100 - index,
			QualityScore:    8.5,
			LastSyncedAt:    &now,
		})
		if err != nil {
			t.Fatalf("failed to create scope skill %d: %v", index, err)
		}
		if err := app.skillService.ReplaceSkillTags(context.Background(), item.ID, []string{"scope"}); err != nil {
			t.Fatalf("failed to set scope tags for %q: %v", item.Name, err)
		}
	}
}

func TestHandleAPIPublicMarketplaceCategoryHubScopeReturnsAllVisibleSkills(t *testing.T) {
	app, admin := setupPublicMarketplaceAPITestApp(t)
	seedPublicMarketplaceScopeSkills(t, app, admin, 28, "development", "backend")

	req := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace?scope=category_hub", nil)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIPublicMarketplace(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	var payload struct {
		Filters struct {
			Scope string `json:"scope"`
		} `json:"filters"`
		Stats struct {
			MatchingSkills int `json:"matching_skills"`
		} `json:"stats"`
		Pagination struct {
			PageSize   int `json:"page_size"`
			TotalItems int `json:"total_items"`
			TotalPages int `json:"total_pages"`
		} `json:"pagination"`
		Items []struct {
			Name string `json:"name"`
		} `json:"items"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode scope payload: %v body=%s", err, recorder.Body.String())
	}

	if payload.Filters.Scope != "category_hub" {
		t.Fatalf("expected scope echo for category hub payload, got=%q", payload.Filters.Scope)
	}
	if payload.Stats.MatchingSkills != 30 {
		t.Fatalf("expected scope request to count all 30 visible skills, got=%d", payload.Stats.MatchingSkills)
	}
	if len(payload.Items) != 30 {
		t.Fatalf("expected category hub scope to return all 30 visible skills, got=%d", len(payload.Items))
	}
	if payload.Pagination.PageSize != 30 || payload.Pagination.TotalItems != 30 || payload.Pagination.TotalPages != 1 {
		t.Fatalf("expected category hub scope pagination to collapse to one full page, got=%+v", payload.Pagination)
	}
}

func TestHandleAPIPublicMarketplaceCategoryDetailScopeReturnsAllGroupedMatches(t *testing.T) {
	app, admin := setupPublicMarketplaceAPITestApp(t)
	seedPublicMarketplaceScopeSkills(t, app, admin, 28, "devops", "monitoring")

	req := httptest.NewRequest(
		http.MethodGet,
		"/api/v1/public/marketplace?scope=category_detail&category_group=programming-development&subcategory_group=devops-cloud",
		nil,
	)
	req.Header.Set("Accept", "application/json")
	recorder := httptest.NewRecorder()

	app.handleAPIPublicMarketplace(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	var payload struct {
		Filters struct {
			Scope            string `json:"scope"`
			CategoryGroup    string `json:"category_group"`
			SubcategoryGroup string `json:"subcategory_group"`
		} `json:"filters"`
		Stats struct {
			MatchingSkills int `json:"matching_skills"`
		} `json:"stats"`
		Pagination struct {
			PageSize   int `json:"page_size"`
			TotalItems int `json:"total_items"`
			TotalPages int `json:"total_pages"`
		} `json:"pagination"`
		Summary struct {
			CategoryDetail struct {
				CategorySlug   string `json:"category_slug"`
				MatchingSkills int    `json:"matching_skills"`
			} `json:"category_detail"`
		} `json:"summary"`
		Items []struct {
			Category string `json:"category"`
		} `json:"items"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed to decode grouped scope payload: %v body=%s", err, recorder.Body.String())
	}

	if payload.Filters.Scope != "category_detail" {
		t.Fatalf("expected scope echo for category detail payload, got=%q", payload.Filters.Scope)
	}
	if payload.Filters.CategoryGroup != "programming-development" || payload.Filters.SubcategoryGroup != "devops-cloud" {
		t.Fatalf("expected grouped filters to echo into response, got=%+v", payload.Filters)
	}
	if payload.Stats.MatchingSkills != 29 {
		t.Fatalf("expected grouped detail scope to count all 29 matching skills, got=%d", payload.Stats.MatchingSkills)
	}
	if len(payload.Items) != 29 {
		t.Fatalf("expected grouped detail scope to return all 29 matching skills, got=%d", len(payload.Items))
	}
	if payload.Pagination.PageSize != 29 || payload.Pagination.TotalItems != 29 || payload.Pagination.TotalPages != 1 {
		t.Fatalf("expected grouped detail scope pagination to collapse to one full page, got=%+v", payload.Pagination)
	}
	if payload.Summary.CategoryDetail.CategorySlug != "programming-development" || payload.Summary.CategoryDetail.MatchingSkills != 29 {
		t.Fatalf("expected grouped detail summary to match full scope payload, got=%+v", payload.Summary.CategoryDetail)
	}
}
