package services

import (
	"strings"

	"skillsindex/internal/models"
)

// ParseTagInput normalizes a comma-separated tag string into unique tag names.
func ParseTagInput(input string) []string {
	parts := strings.Split(input, ",")
	return normalizeTagSlice(parts)
}

func normalizeTagSlice(tags []string) []string {
	seen := make(map[string]struct{}, len(tags))
	out := make([]string, 0, len(tags))
	for _, raw := range tags {
		tag := strings.ToLower(strings.TrimSpace(raw))
		tag = strings.Trim(tag, "#")
		if tag == "" {
			continue
		}
		if _, ok := seen[tag]; ok {
			continue
		}
		seen[tag] = struct{}{}
		out = append(out, tag)
	}
	return out
}

func normalizeVisibility(v models.SkillVisibility) models.SkillVisibility {
	if v != models.VisibilityPublic {
		return models.VisibilityPrivate
	}
	return models.VisibilityPublic
}

func normalizeSourceType(v models.SkillSourceType) models.SkillSourceType {
	switch v {
	case models.SourceTypeUpload, models.SourceTypeRepository, models.SourceTypeManual, models.SourceTypeSkillMP:
		return v
	default:
		return models.SourceTypeManual
	}
}

func normalizeRecordOrigin(v models.SkillRecordOrigin) models.SkillRecordOrigin {
	if v == models.RecordOriginSeed {
		return models.RecordOriginSeed
	}
	return models.RecordOriginImported
}
