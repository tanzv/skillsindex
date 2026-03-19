package services

import (
	"context"
	"fmt"
	"strings"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

func normalizeModerationTargetType(raw models.ModerationTargetType) (models.ModerationTargetType, error) {
	switch strings.ToLower(strings.TrimSpace(string(raw))) {
	case string(models.ModerationTargetSkill):
		return models.ModerationTargetSkill, nil
	case string(models.ModerationTargetComment):
		return models.ModerationTargetComment, nil
	default:
		return "", fmt.Errorf("invalid moderation target type")
	}
}

func normalizeModerationAction(raw models.ModerationAction) models.ModerationAction {
	switch strings.ToLower(strings.TrimSpace(string(raw))) {
	case string(models.ModerationActionFlagged):
		return models.ModerationActionFlagged
	case string(models.ModerationActionHidden):
		return models.ModerationActionHidden
	case string(models.ModerationActionDeleted):
		return models.ModerationActionDeleted
	default:
		return models.ModerationActionNone
	}
}

func normalizeOptionalUserID(raw *uint) *uint {
	if raw == nil || *raw == 0 {
		return nil
	}
	value := *raw
	return &value
}

func normalizeOptionalModerationEntityID(raw *uint) *uint {
	if raw == nil || *raw == 0 {
		return nil
	}
	value := *raw
	return &value
}

func truncateModerationText(value string, maxLength int) string {
	text := strings.TrimSpace(value)
	if maxLength <= 0 || len(text) <= maxLength {
		return text
	}
	return text[:maxLength]
}

func ensureSkillExists(ctx context.Context, db *gorm.DB, skillID uint) error {
	var total int64
	if err := db.WithContext(ctx).
		Model(&models.Skill{}).
		Where("id = ?", skillID).
		Count(&total).Error; err != nil {
		return fmt.Errorf("failed to verify skill existence: %w", err)
	}
	if total == 0 {
		return fmt.Errorf("skill not found")
	}
	return nil
}

func ensureCommentBelongsSkill(ctx context.Context, db *gorm.DB, commentID uint, skillID uint) error {
	var total int64
	if err := db.WithContext(ctx).
		Model(&models.SkillComment{}).
		Where("id = ? AND skill_id = ?", commentID, skillID).
		Count(&total).Error; err != nil {
		return fmt.Errorf("failed to verify comment existence: %w", err)
	}
	if total == 0 {
		return fmt.Errorf("comment not found")
	}
	return nil
}
