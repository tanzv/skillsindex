package web

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"skillsindex/internal/services"
)

type marketplaceRankingSettingsPayload struct {
	DefaultSort         string `json:"default_sort"`
	RankingLimit        int    `json:"ranking_limit"`
	HighlightLimit      int    `json:"highlight_limit"`
	CategoryLeaderLimit int    `json:"category_leader_limit"`
}

func normalizeMarketplaceRankingSort(raw string) string {
	switch strings.TrimSpace(strings.ToLower(raw)) {
	case "quality":
		return "quality"
	default:
		return services.DefaultMarketplaceRankingSort
	}
}

func normalizeMarketplaceRankingConfig(payload marketplaceRankingSettingsPayload) marketplaceRankingSettingsPayload {
	normalized := marketplaceRankingSettingsPayload{
		DefaultSort:         normalizeMarketplaceRankingSort(payload.DefaultSort),
		RankingLimit:        payload.RankingLimit,
		HighlightLimit:      payload.HighlightLimit,
		CategoryLeaderLimit: payload.CategoryLeaderLimit,
	}

	if normalized.RankingLimit <= 0 {
		normalized.RankingLimit = services.DefaultMarketplaceRankingLimit
	}
	if normalized.RankingLimit > services.MaxMarketplaceRankingLimit {
		normalized.RankingLimit = services.MaxMarketplaceRankingLimit
	}

	if normalized.HighlightLimit <= 0 {
		normalized.HighlightLimit = services.DefaultMarketplaceRankingHighlightLimit
	}
	if normalized.HighlightLimit > services.MaxMarketplaceRankingHighlightLimit {
		normalized.HighlightLimit = services.MaxMarketplaceRankingHighlightLimit
	}
	if normalized.HighlightLimit > normalized.RankingLimit {
		normalized.HighlightLimit = normalized.RankingLimit
	}

	if normalized.CategoryLeaderLimit <= 0 {
		normalized.CategoryLeaderLimit = services.DefaultMarketplaceCategoryLeaderLimit
	}
	if normalized.CategoryLeaderLimit > services.MaxMarketplaceCategoryLeaderLimit {
		normalized.CategoryLeaderLimit = services.MaxMarketplaceCategoryLeaderLimit
	}

	return normalized
}

func (a *App) loadMarketplaceRankingSettings(ctx context.Context) (marketplaceRankingSettingsPayload, error) {
	defaults := normalizeMarketplaceRankingConfig(marketplaceRankingSettingsPayload{})
	if a.settingsService == nil {
		return defaults, nil
	}

	defaultSort, err := a.settingsService.Get(ctx, services.SettingMarketplaceRankingDefaultSort, defaults.DefaultSort)
	if err != nil {
		return marketplaceRankingSettingsPayload{}, err
	}
	rankingLimit, err := a.settingsService.GetInt(ctx, services.SettingMarketplaceRankingLimit, defaults.RankingLimit)
	if err != nil {
		return marketplaceRankingSettingsPayload{}, err
	}
	highlightLimit, err := a.settingsService.GetInt(ctx, services.SettingMarketplaceRankingHighlightLimit, defaults.HighlightLimit)
	if err != nil {
		return marketplaceRankingSettingsPayload{}, err
	}
	categoryLeaderLimit, err := a.settingsService.GetInt(ctx, services.SettingMarketplaceRankingCategoryLeaderLimit, defaults.CategoryLeaderLimit)
	if err != nil {
		return marketplaceRankingSettingsPayload{}, err
	}

	return normalizeMarketplaceRankingConfig(marketplaceRankingSettingsPayload{
		DefaultSort:         defaultSort,
		RankingLimit:        rankingLimit,
		HighlightLimit:      highlightLimit,
		CategoryLeaderLimit: categoryLeaderLimit,
	}), nil
}

func (a *App) handleAPIAdminMarketplaceRankingSetting(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}

	settings, err := a.loadMarketplaceRankingSettings(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                    true,
		"default_sort":          settings.DefaultSort,
		"ranking_limit":         settings.RankingLimit,
		"highlight_limit":       settings.HighlightLimit,
		"category_leader_limit": settings.CategoryLeaderLimit,
	})
}

func (a *App) handleAPIAdminMarketplaceRankingSettingUpdate(w http.ResponseWriter, r *http.Request) {
	user := currentUserFromContext(r.Context())
	if user == nil {
		writeJSON(w, http.StatusUnauthorized, map[string]any{"error": "unauthorized"})
		return
	}
	if !user.CanManageUsers() {
		writeJSON(w, http.StatusForbidden, map[string]any{"error": "permission_denied"})
		return
	}
	if a.settingsService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "service_unavailable"})
		return
	}

	settings, err := a.loadMarketplaceRankingSettings(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "query_failed", "message": err.Error()})
		return
	}

	contentType := strings.ToLower(strings.TrimSpace(r.Header.Get("Content-Type")))
	next := settings
	if strings.Contains(contentType, "application/json") {
		var payload map[string]any
		decoder := json.NewDecoder(r.Body)
		decoder.DisallowUnknownFields()
		if err := decoder.Decode(&payload); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
			return
		}

		if rawDefaultSort, exists := payload["default_sort"]; exists {
			sortText, ok := rawDefaultSort.(string)
			if !ok {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "invalid default_sort"})
				return
			}
			sortValue := strings.TrimSpace(strings.ToLower(sortText))
			if sortValue != "stars" && sortValue != "quality" {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "invalid default_sort"})
				return
			}
			next.DefaultSort = sortValue
		}
		if rawRankingLimit, exists := payload["ranking_limit"]; exists {
			value, matched := parseIntSettingValue(rawRankingLimit)
			if !matched || value <= 0 {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "invalid ranking_limit"})
				return
			}
			next.RankingLimit = value
		}
		if rawHighlightLimit, exists := payload["highlight_limit"]; exists {
			value, matched := parseIntSettingValue(rawHighlightLimit)
			if !matched || value <= 0 {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "invalid highlight_limit"})
				return
			}
			next.HighlightLimit = value
		}
		if rawCategoryLeaderLimit, exists := payload["category_leader_limit"]; exists {
			value, matched := parseIntSettingValue(rawCategoryLeaderLimit)
			if !matched || value <= 0 {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "invalid category_leader_limit"})
				return
			}
			next.CategoryLeaderLimit = value
		}
	} else {
		if err := r.ParseForm(); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": err.Error()})
			return
		}

		if rawDefaultSort := strings.TrimSpace(r.FormValue("default_sort")); rawDefaultSort != "" {
			sortValue := normalizeMarketplaceRankingSort(rawDefaultSort)
			if sortValue != strings.TrimSpace(strings.ToLower(rawDefaultSort)) {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "invalid default_sort"})
				return
			}
			next.DefaultSort = sortValue
		}
		if rawRankingLimit := strings.TrimSpace(r.FormValue("ranking_limit")); rawRankingLimit != "" {
			value, err := strconv.Atoi(rawRankingLimit)
			if err != nil || value <= 0 {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "invalid ranking_limit"})
				return
			}
			next.RankingLimit = value
		}
		if rawHighlightLimit := strings.TrimSpace(r.FormValue("highlight_limit")); rawHighlightLimit != "" {
			value, err := strconv.Atoi(rawHighlightLimit)
			if err != nil || value <= 0 {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "invalid highlight_limit"})
				return
			}
			next.HighlightLimit = value
		}
		if rawCategoryLeaderLimit := strings.TrimSpace(r.FormValue("category_leader_limit")); rawCategoryLeaderLimit != "" {
			value, err := strconv.Atoi(rawCategoryLeaderLimit)
			if err != nil || value <= 0 {
				writeJSON(w, http.StatusBadRequest, map[string]any{"error": "invalid_payload", "message": "invalid category_leader_limit"})
				return
			}
			next.CategoryLeaderLimit = value
		}
	}

	next = normalizeMarketplaceRankingConfig(next)
	if err := a.settingsService.Set(r.Context(), services.SettingMarketplaceRankingDefaultSort, next.DefaultSort); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}
	if err := a.settingsService.SetInt(r.Context(), services.SettingMarketplaceRankingLimit, next.RankingLimit); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}
	if err := a.settingsService.SetInt(r.Context(), services.SettingMarketplaceRankingHighlightLimit, next.HighlightLimit); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}
	if err := a.settingsService.SetInt(r.Context(), services.SettingMarketplaceRankingCategoryLeaderLimit, next.CategoryLeaderLimit); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{"error": "update_failed", "message": err.Error()})
		return
	}

	a.recordAudit(r.Context(), user, services.RecordAuditInput{
		Action:     "api_marketplace_ranking_policy_update",
		TargetType: "setting",
		TargetID:   0,
		Summary:    "Updated marketplace ranking policy through admin api",
		Details: auditDetailsJSON(map[string]string{
			"default_sort":          next.DefaultSort,
			"ranking_limit":         strconv.Itoa(next.RankingLimit),
			"highlight_limit":       strconv.Itoa(next.HighlightLimit),
			"category_leader_limit": strconv.Itoa(next.CategoryLeaderLimit),
		}),
	})

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":                    true,
		"default_sort":          next.DefaultSort,
		"ranking_limit":         next.RankingLimit,
		"highlight_limit":       next.HighlightLimit,
		"category_leader_limit": next.CategoryLeaderLimit,
	})
}
