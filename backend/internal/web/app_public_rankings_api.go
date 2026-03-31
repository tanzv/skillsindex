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

func mapPublicRankingCategoryLeaders(
	items []services.PublicRankingCategoryLeader,
	presentationTaxonomy []marketplacePresentationCategoryDefinition,
) []apiPublicRankingCategoryLeader {
	result := make([]apiPublicRankingCategoryLeader, 0, len(items))
	for _, item := range items {
		leadingSkill := apiSkillResponse{}
		categorySlug := item.CategorySlug
		if skillItems := resultToAPIItemsWithTaxonomy([]models.Skill{item.LeadingSkill}, presentationTaxonomy); len(skillItems) > 0 {
			leadingSkill = skillItems[0]
			if strings.TrimSpace(leadingSkill.CategoryGroup) != "" {
				categorySlug = leadingSkill.CategoryGroup
			}
		}
		result = append(result, apiPublicRankingCategoryLeader{
			CategorySlug:   categorySlug,
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
		writeAPIError(w, r, http.StatusServiceUnavailable, "service_unavailable", "Skill service unavailable")
		return
	}

	settings, err := a.loadMarketplaceRankingSettings(r.Context())
	if err != nil {
		writeAPIError(w, r, http.StatusInternalServerError, "settings_query_failed", "Failed to load marketplace ranking settings")
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
		writeAPIError(w, r, http.StatusInternalServerError, "ranking_query_failed", "Failed to build public rankings")
		return
	}

	presentationTaxonomy := a.marketplacePresentationTaxonomy(r.Context())
	writeJSON(w, http.StatusOK, map[string]any{
		"sort":         result.SortBy,
		"ranked_items": resultToAPIItemsWithTaxonomy(result.RankedItems, presentationTaxonomy),
		"highlights":   resultToAPIItemsWithTaxonomy(result.Highlights, presentationTaxonomy),
		"list_items":   resultToAPIItemsWithTaxonomy(result.ListItems, presentationTaxonomy),
		"summary": apiPublicRankingSummary{
			TotalCompared:  result.Summary.TotalCompared,
			TopStars:       result.Summary.TopStars,
			TopQuality:     result.Summary.TopQuality,
			AverageQuality: result.Summary.AverageQuality,
		},
		"category_leaders": mapPublicRankingCategoryLeaders(result.CategoryLeaders, presentationTaxonomy),
	})
}
