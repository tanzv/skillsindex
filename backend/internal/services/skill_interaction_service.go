package services

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

var (
	// ErrCommentNotFound means target comment does not exist.
	ErrCommentNotFound = errors.New("comment not found")
	// ErrCommentPermissionDenied means actor has no permission for comment mutation.
	ErrCommentPermissionDenied = errors.New("comment permission denied")
)

// SkillStats aggregates public interaction counters of one skill.
type SkillStats struct {
	FavoriteCount int64
	RatingCount   int64
	RatingAverage float64
	CommentCount  int64
}

// CreateSkillCommentInput defines payload for new comment creation.
type CreateSkillCommentInput struct {
	SkillID uint
	UserID  uint
	Content string
}

// SkillInteractionService handles favorites, ratings, and comments.
type SkillInteractionService struct {
	db *gorm.DB
}

// NewSkillInteractionService creates interaction service.
func NewSkillInteractionService(db *gorm.DB) *SkillInteractionService {
	return &SkillInteractionService{db: db}
}

// SetFavorite toggles one user's favorite state on one skill.
func (s *SkillInteractionService) SetFavorite(ctx context.Context, skillID uint, userID uint, favorite bool) (bool, error) {
	if skillID == 0 || userID == 0 {
		return false, fmt.Errorf("skill id and user id are required")
	}
	if favorite {
		record := models.SkillFavorite{
			SkillID: skillID,
			UserID:  userID,
		}
		if err := s.db.WithContext(ctx).FirstOrCreate(&record, models.SkillFavorite{
			SkillID: skillID,
			UserID:  userID,
		}).Error; err != nil {
			return false, fmt.Errorf("failed to set favorite: %w", err)
		}
		return true, nil
	}
	if err := s.db.WithContext(ctx).
		Where("skill_id = ? AND user_id = ?", skillID, userID).
		Delete(&models.SkillFavorite{}).Error; err != nil {
		return false, fmt.Errorf("failed to unset favorite: %w", err)
	}
	return false, nil
}

// IsFavorite checks whether one user has favorited one skill.
func (s *SkillInteractionService) IsFavorite(ctx context.Context, skillID uint, userID uint) (bool, error) {
	if skillID == 0 || userID == 0 {
		return false, nil
	}
	var total int64
	if err := s.db.WithContext(ctx).
		Model(&models.SkillFavorite{}).
		Where("skill_id = ? AND user_id = ?", skillID, userID).
		Count(&total).Error; err != nil {
		return false, fmt.Errorf("failed to check favorite: %w", err)
	}
	return total > 0, nil
}

// UpsertRating stores one score in the range [1,5].
func (s *SkillInteractionService) UpsertRating(ctx context.Context, skillID uint, userID uint, score int) error {
	if skillID == 0 || userID == 0 {
		return fmt.Errorf("skill id and user id are required")
	}
	if score < 1 || score > 5 {
		return fmt.Errorf("score must be between 1 and 5")
	}
	rating := models.SkillRating{
		SkillID: skillID,
		UserID:  userID,
		Score:   score,
	}
	if err := s.db.WithContext(ctx).Save(&rating).Error; err != nil {
		return fmt.Errorf("failed to upsert rating: %w", err)
	}
	return nil
}

// GetUserRating returns the current user's score for one skill.
func (s *SkillInteractionService) GetUserRating(ctx context.Context, skillID uint, userID uint) (int, bool, error) {
	if skillID == 0 || userID == 0 {
		return 0, false, nil
	}
	var rating models.SkillRating
	err := s.db.WithContext(ctx).
		Where("skill_id = ? AND user_id = ?", skillID, userID).
		First(&rating).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return 0, false, nil
	}
	if err != nil {
		return 0, false, fmt.Errorf("failed to load rating: %w", err)
	}
	return rating.Score, true, nil
}

// CreateComment inserts one new comment.
func (s *SkillInteractionService) CreateComment(ctx context.Context, input CreateSkillCommentInput) (models.SkillComment, error) {
	content := strings.TrimSpace(input.Content)
	if input.SkillID == 0 || input.UserID == 0 {
		return models.SkillComment{}, fmt.Errorf("skill id and user id are required")
	}
	if content == "" {
		return models.SkillComment{}, fmt.Errorf("comment content is required")
	}
	if len(content) > 3000 {
		return models.SkillComment{}, fmt.Errorf("comment content exceeds limit")
	}
	comment := models.SkillComment{
		SkillID: input.SkillID,
		UserID:  input.UserID,
		Content: content,
	}
	if err := s.db.WithContext(ctx).Create(&comment).Error; err != nil {
		return models.SkillComment{}, fmt.Errorf("failed to create comment: %w", err)
	}
	err := s.db.WithContext(ctx).
		Preload("User").
		First(&comment, comment.ID).Error
	if err != nil {
		return models.SkillComment{}, fmt.Errorf("failed to load created comment: %w", err)
	}
	return comment, nil
}

// ListComments lists comments under one skill, most recent first.
func (s *SkillInteractionService) ListComments(ctx context.Context, skillID uint, limit int) ([]models.SkillComment, error) {
	if skillID == 0 {
		return []models.SkillComment{}, nil
	}
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	var comments []models.SkillComment
	if err := s.db.WithContext(ctx).
		Preload("User").
		Where("skill_id = ?", skillID).
		Order("created_at DESC").
		Limit(limit).
		Find(&comments).Error; err != nil {
		return nil, fmt.Errorf("failed to list comments: %w", err)
	}
	return comments, nil
}

// DeleteComment removes one comment when actor is author or admin/super admin.
func (s *SkillInteractionService) DeleteComment(ctx context.Context, commentID uint, actor models.User) error {
	var comment models.SkillComment
	err := s.db.WithContext(ctx).First(&comment, commentID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return ErrCommentNotFound
	}
	if err != nil {
		return fmt.Errorf("failed to load comment: %w", err)
	}
	if !actor.CanDeleteComment(comment.UserID) {
		return ErrCommentPermissionDenied
	}
	if err := s.db.WithContext(ctx).Delete(&comment).Error; err != nil {
		return fmt.Errorf("failed to delete comment: %w", err)
	}
	return nil
}

// GetStats returns aggregated counters for one skill.
func (s *SkillInteractionService) GetStats(ctx context.Context, skillID uint) (SkillStats, error) {
	if skillID == 0 {
		return SkillStats{}, nil
	}

	stats := SkillStats{}
	if err := s.db.WithContext(ctx).
		Model(&models.SkillFavorite{}).
		Where("skill_id = ?", skillID).
		Count(&stats.FavoriteCount).Error; err != nil {
		return SkillStats{}, fmt.Errorf("failed to count favorites: %w", err)
	}

	type ratingAggregate struct {
		Count int64
		Avg   float64
	}
	var rating ratingAggregate
	if err := s.db.WithContext(ctx).
		Model(&models.SkillRating{}).
		Select("COUNT(*) as count, COALESCE(AVG(score), 0) as avg").
		Where("skill_id = ?", skillID).
		Scan(&rating).Error; err != nil {
		return SkillStats{}, fmt.Errorf("failed to aggregate ratings: %w", err)
	}
	stats.RatingCount = rating.Count
	stats.RatingAverage = rating.Avg

	if err := s.db.WithContext(ctx).
		Model(&models.SkillComment{}).
		Where("skill_id = ?", skillID).
		Count(&stats.CommentCount).Error; err != nil {
		return SkillStats{}, fmt.Errorf("failed to count comments: %w", err)
	}
	return stats, nil
}
