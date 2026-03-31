package web

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func TestAPIAdminMarketplaceRankingSettingUnauthorized(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/marketplace-ranking", nil)
	req.Header.Set("X-Request-ID", "req-marketplace-ranking-setting-unauthorized")
	recorder := httptest.NewRecorder()

	app.handleAPIAdminMarketplaceRankingSetting(recorder, req)

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
	if payload["request_id"] != "req-marketplace-ranking-setting-unauthorized" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminMarketplaceRankingSettingSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	if err := app.settingsService.Set(context.Background(), services.SettingMarketplaceRankingDefaultSort, "quality"); err != nil {
		t.Fatalf("failed to seed marketplace ranking default sort: %v", err)
	}
	if err := app.settingsService.SetInt(context.Background(), services.SettingMarketplaceRankingLimit, 18); err != nil {
		t.Fatalf("failed to seed marketplace ranking limit: %v", err)
	}
	if err := app.settingsService.SetInt(context.Background(), services.SettingMarketplaceRankingHighlightLimit, 4); err != nil {
		t.Fatalf("failed to seed marketplace ranking highlight limit: %v", err)
	}
	if err := app.settingsService.SetInt(context.Background(), services.SettingMarketplaceRankingCategoryLeaderLimit, 6); err != nil {
		t.Fatalf("failed to seed marketplace category leader limit: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/settings/marketplace-ranking", nil)
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminMarketplaceRankingSetting(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusOK)
	}
	payload := decodeBodyMap(t, recorder)
	if got, _ := payload["default_sort"].(string); got != "quality" {
		t.Fatalf("unexpected default_sort: got=%q want=quality", got)
	}
	if got, _ := payload["ranking_limit"].(float64); got != 18 {
		t.Fatalf("unexpected ranking_limit: got=%.0f want=18", got)
	}
	if got, _ := payload["highlight_limit"].(float64); got != 4 {
		t.Fatalf("unexpected highlight_limit: got=%.0f want=4", got)
	}
	if got, _ := payload["category_leader_limit"].(float64); got != 6 {
		t.Fatalf("unexpected category_leader_limit: got=%.0f want=6", got)
	}
}

func TestAPIAdminMarketplaceRankingSettingUpdateSuccess(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/settings/marketplace-ranking",
		strings.NewReader(`{"default_sort":"quality","ranking_limit":18,"highlight_limit":4,"category_leader_limit":2}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminMarketplaceRankingSettingUpdate(recorder, req)

	if recorder.Code != http.StatusOK {
		t.Fatalf("unexpected status code: got=%d want=%d body=%s", recorder.Code, http.StatusOK, recorder.Body.String())
	}
	payload := decodeBodyMap(t, recorder)
	if got, _ := payload["default_sort"].(string); got != "quality" {
		t.Fatalf("unexpected default_sort: got=%q want=quality", got)
	}
	if got, _ := payload["ranking_limit"].(float64); got != 18 {
		t.Fatalf("unexpected ranking_limit: got=%.0f want=18", got)
	}
	if got, _ := payload["highlight_limit"].(float64); got != 4 {
		t.Fatalf("unexpected highlight_limit: got=%.0f want=4", got)
	}
	if got, _ := payload["category_leader_limit"].(float64); got != 2 {
		t.Fatalf("unexpected category_leader_limit: got=%.0f want=2", got)
	}

	persistedSort, err := app.settingsService.Get(context.Background(), services.SettingMarketplaceRankingDefaultSort, "")
	if err != nil {
		t.Fatalf("failed to read persisted default sort: %v", err)
	}
	if persistedSort != "quality" {
		t.Fatalf("unexpected persisted default sort: got=%q want=quality", persistedSort)
	}
	persistedLimit, err := app.settingsService.GetInt(context.Background(), services.SettingMarketplaceRankingLimit, 0)
	if err != nil {
		t.Fatalf("failed to read persisted ranking limit: %v", err)
	}
	if persistedLimit != 18 {
		t.Fatalf("unexpected persisted ranking limit: got=%d want=18", persistedLimit)
	}
}

func TestAPIAdminMarketplaceRankingSettingUpdateServiceUnavailable(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	app.settingsService = nil
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/settings/marketplace-ranking",
		strings.NewReader(`{"default_sort":"quality"}`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-marketplace-ranking-setting-update-service-unavailable")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminMarketplaceRankingSettingUpdate(recorder, req)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusServiceUnavailable)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "service_unavailable" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["message"] != "Settings service is unavailable" {
		t.Fatalf("unexpected error message: %#v", payload)
	}
	if payload["request_id"] != "req-marketplace-ranking-setting-update-service-unavailable" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}

func TestAPIAdminMarketplaceRankingSettingUpdateInvalidPayload(t *testing.T) {
	app := setupAccessSettingsTestApp(t)
	req := httptest.NewRequest(
		http.MethodPost,
		"/api/v1/admin/settings/marketplace-ranking",
		strings.NewReader(`{"default_sort":`),
	)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Request-ID", "req-marketplace-ranking-setting-update-invalid-payload")
	req = withCurrentUser(req, &models.User{ID: 1, Role: models.RoleSuperAdmin})
	recorder := httptest.NewRecorder()

	app.handleAPIAdminMarketplaceRankingSettingUpdate(recorder, req)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("unexpected status code: got=%d want=%d", recorder.Code, http.StatusBadRequest)
	}
	payload := decodeBodyMap(t, recorder)
	if payload["error"] != "invalid_payload" {
		t.Fatalf("unexpected error payload: %#v", payload)
	}
	if payload["request_id"] != "req-marketplace-ranking-setting-update-invalid-payload" {
		t.Fatalf("unexpected request id: %#v", payload)
	}
}
