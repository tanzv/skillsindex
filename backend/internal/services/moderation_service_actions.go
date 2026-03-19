package services

import (
	"context"
	"fmt"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

func (s *ModerationService) applyModerationAction(
	ctx context.Context,
	tx *gorm.DB,
	item models.ModerationCase,
	action models.ModerationAction,
) error {
	switch item.TargetType {
	case models.ModerationTargetSkill:
		return applySkillModerationAction(ctx, tx, item, action)
	case models.ModerationTargetComment:
		return applyCommentModerationAction(ctx, tx, item, action)
	default:
		return fmt.Errorf("invalid moderation target type")
	}
}

func applySkillModerationAction(
	ctx context.Context,
	tx *gorm.DB,
	item models.ModerationCase,
	action models.ModerationAction,
) error {
	if item.SkillID == nil || *item.SkillID == 0 {
		return fmt.Errorf("skill id is required for skill moderation action")
	}
	switch action {
	case models.ModerationActionNone, models.ModerationActionFlagged:
		return nil
	case models.ModerationActionHidden:
		result := tx.WithContext(ctx).
			Model(&models.Skill{}).
			Where("id = ?", *item.SkillID).
			Update("visibility", models.VisibilityPrivate)
		if result.Error != nil {
			return fmt.Errorf("failed to apply hidden action on skill: %w", result.Error)
		}
		if result.RowsAffected == 0 {
			return fmt.Errorf("skill not found")
		}
		return nil
	case models.ModerationActionDeleted:
		result := tx.WithContext(ctx).
			Model(&models.Skill{}).
			Where("id = ?", *item.SkillID).
			Updates(map[string]any{
				"visibility":  models.VisibilityPrivate,
				"description": moderatedSkillDescription,
				"content":     moderatedSkillContent,
			})
		if result.Error != nil {
			return fmt.Errorf("failed to apply deleted action on skill: %w", result.Error)
		}
		if result.RowsAffected == 0 {
			return fmt.Errorf("skill not found")
		}
		return nil
	default:
		return fmt.Errorf("invalid moderation action")
	}
}

func applyCommentModerationAction(
	ctx context.Context,
	tx *gorm.DB,
	item models.ModerationCase,
	action models.ModerationAction,
) error {
	if item.CommentID == nil || *item.CommentID == 0 {
		return fmt.Errorf("comment id is required for comment moderation action")
	}
	switch action {
	case models.ModerationActionNone, models.ModerationActionFlagged:
		return nil
	case models.ModerationActionHidden:
		result := tx.WithContext(ctx).
			Model(&models.SkillComment{}).
			Where("id = ?", *item.CommentID).
			Update("content", moderatedHiddenCommentContent)
		if result.Error != nil {
			return fmt.Errorf("failed to apply hidden action on comment: %w", result.Error)
		}
		if result.RowsAffected == 0 {
			return fmt.Errorf("comment not found")
		}
		return nil
	case models.ModerationActionDeleted:
		result := tx.WithContext(ctx).
			Where("id = ?", *item.CommentID).
			Delete(&models.SkillComment{})
		if result.Error != nil {
			return fmt.Errorf("failed to apply deleted action on comment: %w", result.Error)
		}
		if result.RowsAffected == 0 {
			return fmt.Errorf("comment not found")
		}
		return nil
	default:
		return fmt.Errorf("invalid moderation action")
	}
}
