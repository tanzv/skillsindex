package services

import (
	"context"
	"errors"
	"fmt"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

func sameUintPointer(left *uint, right *uint) bool {
	if left == nil || right == nil {
		return left == nil && right == nil
	}
	return *left == *right
}

// SetOrganization sets or clears skill organization binding.
func (s *SkillService) SetOrganization(ctx context.Context, skillID uint, organizationID *uint) (models.Skill, error) {
	tx := s.db.WithContext(ctx).Begin()
	if tx.Error != nil {
		return models.Skill{}, fmt.Errorf("failed to start transaction: %w", tx.Error)
	}
	defer tx.Rollback()

	var skill models.Skill
	if err := tx.First(&skill, skillID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return models.Skill{}, ErrSkillNotFound
		}
		return models.Skill{}, fmt.Errorf("failed to load skill: %w", err)
	}

	if organizationID != nil {
		organizationService := NewOrganizationService(tx)
		if _, err := organizationService.GetByID(ctx, *organizationID); err != nil {
			return models.Skill{}, err
		}
	}

	if !sameUintPointer(skill.OrganizationID, organizationID) {
		if err := tx.Model(&skill).Update("organization_id", organizationID).Error; err != nil {
			return models.Skill{}, fmt.Errorf("failed to update skill organization: %w", err)
		}
	}

	if err := tx.Commit().Error; err != nil {
		return models.Skill{}, fmt.Errorf("failed to commit organization transaction: %w", err)
	}
	return s.GetSkillByID(ctx, skill.ID)
}
