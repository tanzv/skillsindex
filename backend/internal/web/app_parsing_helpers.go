package web

import (
	"fmt"
	"net/url"
	"strconv"
	"strings"

	"skillsindex/internal/models"
)

func canViewSyncRunDetail(user models.User, item models.SyncJobRun) bool {
	if user.CanViewAllSkills() {
		return true
	}
	ownerMatched := item.OwnerUserID != nil && *item.OwnerUserID == user.ID
	actorMatched := item.ActorUserID != nil && *item.ActorUserID == user.ID
	return ownerMatched || actorMatched
}

func canViewAsyncJobDetail(user models.User, item models.AsyncJob) bool {
	if user.CanViewAllSkills() {
		return true
	}
	ownerMatched := item.OwnerUserID != nil && *item.OwnerUserID == user.ID
	actorMatched := item.ActorUserID != nil && *item.ActorUserID == user.ID
	return ownerMatched || actorMatched
}

func parseVisibility(raw string) models.SkillVisibility {
	if strings.EqualFold(strings.TrimSpace(raw), string(models.VisibilityPublic)) {
		return models.VisibilityPublic
	}
	return models.VisibilityPrivate
}

func parsePositiveInt(raw string, defaultValue int) int {
	value, err := strconv.Atoi(strings.TrimSpace(raw))
	if err != nil || value <= 0 {
		return defaultValue
	}
	return value
}

func parseFloatDefault(raw string, defaultValue float64) float64 {
	value, err := strconv.ParseFloat(strings.TrimSpace(raw), 64)
	if err != nil {
		return defaultValue
	}
	return value
}

func parseBoolFlag(raw string, defaultValue bool) bool {
	value := strings.ToLower(strings.TrimSpace(raw))
	switch value {
	case "1", "true", "yes", "on", "enabled":
		return true
	case "0", "false", "no", "off", "disabled":
		return false
	default:
		return defaultValue
	}
}

func parseOptionalUintFormValue(raw string) (*uint, error) {
	clean := strings.TrimSpace(raw)
	if clean == "" {
		return nil, nil
	}
	value, err := strconv.ParseUint(clean, 10, 64)
	if err != nil || value == 0 {
		return nil, fmt.Errorf("invalid numeric value")
	}
	parsed := uint(value)
	return &parsed, nil
}

func normalizeModerationListStatus(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.ModerationStatusOpen):
		return string(models.ModerationStatusOpen)
	case string(models.ModerationStatusResolved):
		return string(models.ModerationStatusResolved)
	case string(models.ModerationStatusRejected):
		return string(models.ModerationStatusRejected)
	default:
		return "all"
	}
}

func parseIncidentSeverity(raw string) models.IncidentSeverity {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.IncidentSeverityLow):
		return models.IncidentSeverityLow
	case string(models.IncidentSeverityHigh):
		return models.IncidentSeverityHigh
	case string(models.IncidentSeverityCritical):
		return models.IncidentSeverityCritical
	default:
		return models.IncidentSeverityMedium
	}
}

func topFeaturedQuality(skills []models.Skill) float64 {
	if len(skills) == 0 {
		return 0
	}
	best := skills[0].QualityScore
	for i := 1; i < len(skills); i++ {
		if skills[i].QualityScore > best {
			best = skills[i].QualityScore
		}
	}
	return best
}

func topFeaturedPercent(skills []models.Skill) float64 {
	return topFeaturedQuality(skills) * 10
}

func parseIncidentStatus(raw string) (models.IncidentStatus, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.IncidentStatusOpen):
		return models.IncidentStatusOpen, true
	case string(models.IncidentStatusMitigated):
		return models.IncidentStatusMitigated, true
	case string(models.IncidentStatusResolved):
		return models.IncidentStatusResolved, true
	default:
		return "", false
	}
}

func parseUserStatus(raw string) (models.UserStatus, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case string(models.UserStatusActive):
		return models.UserStatusActive, true
	case string(models.UserStatusDisabled):
		return models.UserStatusDisabled, true
	default:
		return "", false
	}
}

func defaultString(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func localizedAliasTarget(path string) (string, string, bool) {
	clean := strings.TrimSpace(path)
	if clean == "" {
		return "", "", false
	}
	if clean == "/skillsmp" {
		return "/", "", true
	}

	if clean == "/zh" || clean == "/zh/" {
		return "/", "zh", true
	}
	if strings.HasPrefix(clean, "/zh/") {
		rest := strings.TrimPrefix(clean, "/zh")
		if rest == "" {
			return "/", "zh", true
		}
		return rest, "zh", true
	}
	return "", "", false
}

func normalizeTimelineInterval(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "day":
		return "day"
	case "month":
		return "month"
	default:
		return "week"
	}
}

func baseMarketplaceQueryValues(
	query string,
	tagFilter string,
	sortBy string,
	mode string,
	category string,
	subcategory string,
) url.Values {
	values := make(url.Values)
	if clean := strings.TrimSpace(query); clean != "" {
		values.Set("q", clean)
	}
	if clean := strings.TrimSpace(tagFilter); clean != "" {
		values.Set("tags", clean)
	}
	values.Set("sort", defaultString(strings.TrimSpace(sortBy), "recent"))
	values.Set("mode", defaultString(strings.TrimSpace(mode), "keyword"))
	if clean := strings.TrimSpace(category); clean != "" {
		values.Set("category", clean)
	}
	if clean := strings.TrimSpace(subcategory); clean != "" {
		values.Set("subcategory", clean)
	}
	return values
}

func buildMarketplacePageLink(path string, base url.Values, page int) string {
	values := make(url.Values, len(base)+1)
	for key, input := range base {
		values[key] = append([]string(nil), input...)
	}
	if page > 1 {
		values.Set("page", strconv.Itoa(page))
	} else {
		values.Del("page")
	}
	encoded := values.Encode()
	if encoded == "" {
		return path
	}
	return path + "?" + encoded
}

func maxInt(a int, b int) int {
	if a >= b {
		return a
	}
	return b
}

func normalizeMarketplaceSort(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "stars":
		return "stars"
	case "quality":
		return "quality"
	default:
		return "recent"
	}
}

func normalizeMarketplaceMode(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "ai":
		return "ai"
	default:
		return "keyword"
	}
}

func mapCategoryCardsToAPI(cards []CategoryCard) []apiMarketplaceCategoryResponse {
	result := make([]apiMarketplaceCategoryResponse, 0, len(cards))
	for _, card := range cards {
		subcategories := make([]apiMarketplaceSubcategoryEntry, 0, len(card.Subcategories))
		for _, sub := range card.Subcategories {
			subcategories = append(subcategories, apiMarketplaceSubcategoryEntry{
				Slug:  sub.Slug,
				Name:  sub.Name,
				Count: sub.Count,
			})
		}
		result = append(result, apiMarketplaceCategoryResponse{
			Slug:          card.Slug,
			Name:          card.Name,
			Description:   card.Description,
			Count:         card.Count,
			Subcategories: subcategories,
		})
	}
	return result
}
