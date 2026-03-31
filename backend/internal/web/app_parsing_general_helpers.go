package web

import (
	"fmt"
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

func maxInt(a int, b int) int {
	if a >= b {
		return a
	}
	return b
}
