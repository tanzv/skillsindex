package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"skillsindex/internal/models"
)

func TestAPIAdminPresentationTaxonomySettingUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/presentation-taxonomy", nil)
	req.Header.Set("X-Request-ID", "req-presentation-taxonomy-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminPresentationTaxonomySetting(recorder, req)

	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusUnauthorized)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "unauthorized" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-presentation-taxonomy-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminPresentationTaxonomySettingUpdatePersistsAndFeedsPublicMarketplace(t *testing.T) {
	app, _, admin := setupPublicMarketplaceAPITestApp(t)
	superAdmin := admin
	superAdmin.Role = models.RoleSuperAdmin

	updateReq := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/settings/presentation-taxonomy",
		strings.NewReader(`{
			"items": [
				{
					"slug": "custom-operations",
					"name": "Custom Operations",
					"description": "Custom grouped operations category.",
					"enabled": true,
					"sort_order": 10,
					"subcategories": [
						{
							"slug": "release-command",
							"name": "Release Command",
							"enabled": true,
							"sort_order": 10,
							"legacy_category_slugs": ["devops"],
							"legacy_subcategory_slugs": ["monitoring"],
							"keywords": ["governance", "ops"]
						}
					]
				}
			]
		}`),
	)
	updateReq.Header.Set("Content-Type", "application/json")
	updateReq = withCurrentUser(updateReq, &superAdmin)
	updateRecorder := httptest.NewRecorder()

	app.handleAPIAdminPresentationTaxonomySettingUpdate(updateRecorder, updateReq)

	if updateRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", updateRecorder.Code, http.StatusOK, updateRecorder.Body.String())
	}

	loadedSettings, err := app.loadMarketplacePresentationTaxonomySettings(context.Background())
	if err != nil {
		t.Fatalf("failed to load saved presentation taxonomy: %v", err)
	}
	if len(loadedSettings) != 1 || loadedSettings[0].Slug != "custom-operations" {
		t.Fatalf("unexpected saved presentation taxonomy: %#v", loadedSettings)
	}

	marketplaceReq := httptest.NewRequest(http.MethodGet, "/api/v1/public/marketplace?category_group=custom-operations", nil)
	marketplaceReq.Header.Set("Accept", "application/json")
	marketplaceRecorder := httptest.NewRecorder()

	app.handleAPIPublicMarketplace(marketplaceRecorder, marketplaceReq)

	if marketplaceRecorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", marketplaceRecorder.Code, http.StatusOK, marketplaceRecorder.Body.String())
	}
	body := marketplaceRecorder.Body.String()
	if !strings.Contains(body, `"category_group":"custom-operations"`) {
		t.Fatalf("expected custom grouped category in marketplace item payload: %s", body)
	}
	if !strings.Contains(body, `"category_group_label":"Custom Operations"`) {
		t.Fatalf("expected custom grouped category label in marketplace item payload: %s", body)
	}
	if !strings.Contains(body, `"subcategory_group":"release-command"`) {
		t.Fatalf("expected custom grouped subcategory in marketplace item payload: %s", body)
	}
	if !strings.Contains(body, `"slug":"custom-operations"`) {
		t.Fatalf("expected custom grouped category card payload: %s", body)
	}
}
