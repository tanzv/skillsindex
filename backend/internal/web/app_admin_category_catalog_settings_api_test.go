package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPIAdminCategoryCatalogSettingUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/category-catalog", nil)
	req.Header.Set("X-Request-ID", "req-category-catalog-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminCategoryCatalogSetting(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Authentication required" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-category-catalog-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminCategoryCatalogSettingSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/category-catalog", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminCategoryCatalogSetting(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	payload := decodeBodyMap(t, recorder)
	items, ok := payload["items"].([]any)
	if !ok || len(items) == 0 {
		t.Fatalf("expected non-empty category catalog payload: %#v", payload["items"])
	}

	firstItem, ok := items[0].(map[string]any)
	if !ok {
		t.Fatalf("unexpected category catalog item shape: %#v", items[0])
	}
	if firstItem["slug"] == "" {
		t.Fatalf("expected category slug in payload: %#v", firstItem)
	}
	if enabled, ok := firstItem["enabled"].(bool); !ok || !enabled {
		t.Fatalf("expected enabled category catalog item: %#v", firstItem)
	}
	if _, ok := firstItem["sort_order"].(float64); !ok {
		t.Fatalf("expected sort_order in payload: %#v", firstItem)
	}
}

func TestAPIAdminCategoryCatalogSettingUpdatePersistsAndFeedsSelection(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/settings/category-catalog",
		strings.NewReader(`{
			"items": [
				{
					"slug": "team-ops",
					"name": "Team Operations",
					"description": "Operational workflows for delivery teams.",
					"enabled": true,
					"sort_order": 10,
					"subcategories": [
						{
							"slug": "release-management",
							"name": "Release Management",
							"enabled": true,
							"sort_order": 20
						}
					]
				},
				{
					"slug": "disabled-category",
					"name": "Disabled Category",
					"description": "Should not be available for selection.",
					"enabled": false,
					"sort_order": 30,
					"subcategories": [
						{
							"slug": "disabled-subcategory",
							"name": "Disabled Subcategory",
							"enabled": true,
							"sort_order": 10
						}
					]
				}
			]
		}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminCategoryCatalogSettingUpdate(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}

	loadedCatalog, err := app.loadMarketplaceCategoryCatalog(context.Background())
	if err != nil {
		t.Fatalf("failed to load persisted category catalog: %v", err)
	}
	if len(loadedCatalog) != 2 {
		t.Fatalf("unexpected catalog length: got=%d want=%d", len(loadedCatalog), 2)
	}
	if loadedCatalog[0].Slug != "team-ops" {
		t.Fatalf("unexpected first catalog slug: got=%s want=team-ops", loadedCatalog[0].Slug)
	}

	selectedCategory, selectedSubcategory := app.resolveCategorySelection(
		context.Background(),
		"team-ops",
		"release-management",
		"fallback-category",
		"fallback-subcategory",
	)
	if selectedCategory != "team-ops" || selectedSubcategory != "release-management" {
		t.Fatalf("expected dynamic catalog selection, got category=%s subcategory=%s", selectedCategory, selectedSubcategory)
	}

	fallbackCategory, fallbackSubcategory := app.resolveCategorySelection(
		context.Background(),
		"disabled-category",
		"disabled-subcategory",
		"fallback-category",
		"fallback-subcategory",
	)
	if fallbackCategory != "fallback-category" || fallbackSubcategory != "fallback-subcategory" {
		t.Fatalf("expected disabled category to fall back, got category=%s subcategory=%s", fallbackCategory, fallbackSubcategory)
	}
}

func TestAPIAdminCategoryCatalogSettingUpdateInvalidPayload(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/settings/category-catalog",
		strings.NewReader(`{"items":"invalid"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-category-catalog-invalid-payload")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminCategoryCatalogSettingUpdate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusBadRequest, recorder.Body.String())
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-category-catalog-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestLoadCategoryCardsUsesDynamicMarketplaceCategoryCatalog(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	if err := app.saveMarketplaceCategoryCatalog(context.Background(), []marketplaceCategoryCatalogSetting{
		{
			Slug:        "team-ops",
			Name:        "Team Operations",
			Description: "Operational workflows for delivery teams.",
			Enabled:     true,
			SortOrder:   10,
			Subcategories: []marketplaceSubcategoryCatalogSetting{
				{
					Slug:      "release-management",
					Name:      "Release Management",
					Enabled:   true,
					SortOrder: 10,
				},
			},
		},
		{
			Slug:        "disabled-category",
			Name:        "Disabled Category",
			Description: "Should be hidden.",
			Enabled:     false,
			SortOrder:   20,
			Subcategories: []marketplaceSubcategoryCatalogSetting{
				{
					Slug:      "disabled-subcategory",
					Name:      "Disabled Subcategory",
					Enabled:   true,
					SortOrder: 10,
				},
			},
		},
	}); err != nil {
		t.Fatalf("failed to seed marketplace category catalog: %v", err)
	}

	owner := createAdminAccessAPIUser(t, app, "catalog-owner", models.RoleMember)
	if _, err := app.skillService.CreateSkill(context.Background(), services.CreateSkillInput{
		OwnerID:         owner.ID,
		Name:            "Release Bot",
		Description:     "Manages releases.",
		Content:         "content",
		CategorySlug:    "team-ops",
		SubcategorySlug: "release-management",
		Visibility:      models.VisibilityPublic,
		SourceType:      models.SourceTypeManual,
		LastSyncedAt:    timePtr(time.Now().UTC()),
	}); err != nil {
		t.Fatalf("failed to create public skill: %v", err)
	}

	cards, err := app.loadCategoryCards(context.Background(), "")
	if err != nil {
		t.Fatalf("failed to load category cards: %v", err)
	}
	if len(cards) != 1 {
		t.Fatalf("expected only enabled category cards, got=%d %#v", len(cards), cards)
	}
	if cards[0].Slug != "team-ops" {
		t.Fatalf("unexpected category card slug: got=%s want=team-ops", cards[0].Slug)
	}
	if len(cards[0].Subcategories) != 1 || cards[0].Subcategories[0].Slug != "release-management" {
		t.Fatalf("unexpected subcategory cards: %#v", cards[0].Subcategories)
	}
}

func timePtr(value time.Time) *time.Time {
	return &value
}
