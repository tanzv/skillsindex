package services

import (
	"context"
	"fmt"

	"skillsindex/internal/models"
)

// ListMarketplaceVisibleSkillVersions returns visible version history for one marketplace skill.
func (s *SkillService) ListMarketplaceVisibleSkillVersions(
	ctx context.Context,
	skillID uint,
	viewerUserID uint,
	limit int,
) ([]models.SkillVersion, error) {
	skill, err := s.GetMarketplaceVisibleSkillByID(ctx, skillID, viewerUserID)
	if err != nil {
		return nil, err
	}
	if s.versionService == nil {
		return nil, fmt.Errorf("skill version service unavailable")
	}
	items, err := s.versionService.ListBySkill(ctx, ListSkillVersionsInput{
		SkillID: skill.ID,
		Limit:   limit,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list marketplace skill versions: %w", err)
	}
	return items, nil
}
