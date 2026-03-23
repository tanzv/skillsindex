package web

import (
	"net/http"
	"strings"

	"skillsindex/internal/models"
	"skillsindex/internal/services"
)

func normalizePublicRankingSort(raw string, defaultSort string) string {
	switch strings.TrimSpace(strings.ToLower(raw)) {
	case "quality":
		return "quality"
	case "stars":
		return "stars"
	default:
		return normalizeMarketplaceRankingSort(defaultSort)
	}
}

func mapPublicRankingCategoryLeaders(items []services.PublicRankingCategoryLeader) []apiPublicRankingCategoryLeader {
	result := make([]apiPublicRankingCategoryLeader, 0, len(items))
	for _, item := range items {
		leadingSkill := apiSkillResponse{}
		if skillItems := resultToAPIItems([]models.Skill{item.LeadingSkill}); len(skillItems) > 0 {
			leadingSkill = skillItems[0]
		}
		result = append(result, apiPublicRankingCategoryLeader{
			CategorySlug:   item.CategorySlug,
			Count:          item.Count,
			AverageQuality: item.AverageQuality,
			LeadingSkill:   leadingSkill,
		})
	}
	return result
}

func (a *App) handleAPIPublicRankings(w http.ResponseWriter, r *http.Request) {
	if !a.ensureMarketplaceAccess(w, r) {
		return
	}
	if a.skillService == nil {
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{
			"error":   "service_unavailable",
			"message": "Skill service unavailable",
		})
		return
	}

	settings, err := a.loadMarketplaceRankingSettings(r.Context())
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error":   "settings_query_failed",
			"message": "Failed to load marketplace ranking settings",
		})
		return
	}

	sortBy := normalizePublicRankingSort(r.URL.Query().Get("sort"), settings.DefaultSort)
	result, err := a.skillService.BuildPublicRanking(r.Context(), services.PublicRankingInput{
		SortBy:              sortBy,
		Limit:               settings.RankingLimit,
		HighlightLimit:      settings.HighlightLimit,
		CategoryLeaderLimit: settings.CategoryLeaderLimit,
	})
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"error":   "ranking_query_failed",
			"message": "Failed to build public rankings",
		})
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"sort":         result.SortBy,
		"ranked_items": resultToAPIItems(result.RankedItems),
		"highlights":   resultToAPIItems(result.Highlights),
		"list_items":   resultToAPIItems(result.ListItems),
		"summary": apiPublicRankingSummary{
			TotalCompared:  result.Summary.TotalCompared,
			TopStars:       result.Summary.TopStars,
			TopQuality:     result.Summary.TopQuality,
			AverageQuality: result.Summary.AverageQuality,
		},
		"category_leaders": mapPublicRankingCategoryLeaders(result.CategoryLeaders),
	})
}
