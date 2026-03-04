package services

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

func compareSkillVersionSnapshots(fromVersion models.SkillVersion, toVersion models.SkillVersion) (SkillVersionCompareResult, error) {
	result := SkillVersionCompareResult{
		SkillID:       toVersion.SkillID,
		FromVersion:   fromVersion,
		ToVersion:     toVersion,
		ContentBefore: fromVersion.Content,
		ContentAfter:  toVersion.Content,
		BeforeDigest:  buildSkillVersionDigest(fromVersion),
		AfterDigest:   buildSkillVersionDigest(toVersion),
	}

	changedSet := make(map[string]struct{}, 16)
	addChangedField := func(field string) {
		if _, ok := changedSet[field]; ok {
			return
		}
		changedSet[field] = struct{}{}
		result.ChangedFields = append(result.ChangedFields, field)
	}
	addMetadataChange := func(field string, before string, after string) {
		if before == after {
			return
		}
		addChangedField(field)
		result.MetadataChanges = append(result.MetadataChanges, SkillVersionMetadataChange{
			Field:  field,
			Before: before,
			After:  after,
		})
	}

	addMetadataChange("name", fromVersion.Name, toVersion.Name)
	addMetadataChange("description", fromVersion.Description, toVersion.Description)
	addMetadataChange("category_slug", fromVersion.CategorySlug, toVersion.CategorySlug)
	addMetadataChange("subcategory_slug", fromVersion.SubcategorySlug, toVersion.SubcategorySlug)
	addMetadataChange("visibility", string(fromVersion.Visibility), string(toVersion.Visibility))
	addMetadataChange("source_type", string(fromVersion.SourceType), string(toVersion.SourceType))
	addMetadataChange("source_url", fromVersion.SourceURL, toVersion.SourceURL)
	addMetadataChange("source_branch", fromVersion.SourceBranch, toVersion.SourceBranch)
	addMetadataChange("source_path", fromVersion.SourcePath, toVersion.SourcePath)
	addMetadataChange("repo_url", fromVersion.RepoURL, toVersion.RepoURL)
	addMetadataChange("install_command", fromVersion.InstallCommand, toVersion.InstallCommand)
	addMetadataChange("star_count", strconv.Itoa(fromVersion.StarCount), strconv.Itoa(toVersion.StarCount))
	addMetadataChange(
		"quality_score",
		strconv.FormatFloat(fromVersion.QualityScore, 'f', 4, 64),
		strconv.FormatFloat(toVersion.QualityScore, 'f', 4, 64),
	)

	if fromVersion.Content != toVersion.Content {
		result.ContentChanged = true
		addChangedField("content")
	}

	fromTags, err := parseVersionTags(fromVersion.TagsJSON)
	if err != nil {
		return SkillVersionCompareResult{}, err
	}
	toTags, err := parseVersionTags(toVersion.TagsJSON)
	if err != nil {
		return SkillVersionCompareResult{}, err
	}
	result.TagsAdded, result.TagsRemoved = diffVersionTags(fromTags, toTags)
	if len(result.TagsAdded) > 0 || len(result.TagsRemoved) > 0 {
		addChangedField("tags")
	}

	result.RiskLevel = deriveVersionCompareRiskLevel(result.ContentChanged, len(result.ChangedFields))
	result.ChangeSummary = buildVersionCompareSummary(result)
	return result, nil
}

func (s *SkillVersionService) applyRetentionPolicy(ctx context.Context, queryDB *gorm.DB, skillID uint) error {
	if queryDB == nil || skillID == 0 {
		return nil
	}
	limit := s.retentionLimit
	if limit <= 0 {
		return nil
	}

	type versionIDRow struct {
		ID uint
	}
	var archiveTargets []versionIDRow
	if err := queryDB.WithContext(ctx).
		Model(&models.SkillVersion{}).
		Select("id").
		Where("skill_id = ? AND archived_at IS NULL", skillID).
		Order("version_number DESC").
		Order("id DESC").
		Offset(limit).
		Find(&archiveTargets).Error; err != nil {
		return fmt.Errorf("failed to query archive targets: %w", err)
	}
	if len(archiveTargets) == 0 {
		return nil
	}

	targetIDs := make([]uint, 0, len(archiveTargets))
	for _, item := range archiveTargets {
		targetIDs = append(targetIDs, item.ID)
	}
	now := time.Now().UTC()
	if err := queryDB.WithContext(ctx).
		Model(&models.SkillVersion{}).
		Where("id IN ? AND archived_at IS NULL", targetIDs).
		Updates(map[string]any{
			"archived_at":    &now,
			"archive_reason": "retention_limit",
		}).Error; err != nil {
		return fmt.Errorf("failed to archive old versions: %w", err)
	}
	return nil
}

func diffVersionTags(fromTags []string, toTags []string) ([]string, []string) {
	fromSet := make(map[string]struct{}, len(fromTags))
	toSet := make(map[string]struct{}, len(toTags))
	for _, item := range fromTags {
		fromSet[item] = struct{}{}
	}
	for _, item := range toTags {
		toSet[item] = struct{}{}
	}

	added := make([]string, 0, len(toTags))
	for _, item := range toTags {
		if _, ok := fromSet[item]; ok {
			continue
		}
		added = append(added, item)
	}
	removed := make([]string, 0, len(fromTags))
	for _, item := range fromTags {
		if _, ok := toSet[item]; ok {
			continue
		}
		removed = append(removed, item)
	}
	sort.Strings(added)
	sort.Strings(removed)
	return added, removed
}

func buildSkillVersionDigest(version models.SkillVersion) string {
	tags, err := parseVersionTags(version.TagsJSON)
	if err != nil {
		tags = []string{}
	}
	sort.Strings(tags)

	payload := map[string]any{
		"name":             version.Name,
		"description":      version.Description,
		"content":          version.Content,
		"category_slug":    version.CategorySlug,
		"subcategory_slug": version.SubcategorySlug,
		"visibility":       string(version.Visibility),
		"source_type":      string(version.SourceType),
		"source_url":       version.SourceURL,
		"source_branch":    version.SourceBranch,
		"source_path":      version.SourcePath,
		"repo_url":         version.RepoURL,
		"install_command":  version.InstallCommand,
		"star_count":       version.StarCount,
		"quality_score":    version.QualityScore,
		"tags":             tags,
	}
	raw, err := json.Marshal(payload)
	if err != nil {
		return ""
	}
	hash := sha256.Sum256(raw)
	return hex.EncodeToString(hash[:])
}

func deriveVersionCompareRiskLevel(contentChanged bool, changedFieldCount int) string {
	if contentChanged && changedFieldCount >= 4 {
		return "high"
	}
	if contentChanged || changedFieldCount >= 3 {
		return "medium"
	}
	return "low"
}

func buildVersionCompareSummary(result SkillVersionCompareResult) string {
	if len(result.ChangedFields) == 0 {
		return "No changes detected between selected versions."
	}
	parts := []string{
		fmt.Sprintf("Changed %d fields: %s", len(result.ChangedFields), strings.Join(result.ChangedFields, ", ")),
	}
	if len(result.TagsAdded) > 0 || len(result.TagsRemoved) > 0 {
		parts = append(parts, fmt.Sprintf("Tag delta +%d/-%d", len(result.TagsAdded), len(result.TagsRemoved)))
	}
	parts = append(parts, "Risk level: "+result.RiskLevel)
	return strings.Join(parts, ". ")
}

func parseVersionTags(raw string) ([]string, error) {
	if strings.TrimSpace(raw) == "" {
		return []string{}, nil
	}
	var tags []string
	if err := json.Unmarshal([]byte(raw), &tags); err != nil {
		return nil, fmt.Errorf("failed to parse version tags: %w", err)
	}
	return normalizeTagSlice(tags), nil
}

func normalizeVersionTrigger(raw string) string {
	value := strings.ToLower(strings.TrimSpace(raw))
	if value == "" {
		return "snapshot"
	}
	return value
}
