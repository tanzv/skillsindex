package services

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

const moderatedSkillDescription = "[removed by moderation]"
const moderatedSkillContent = "[removed by moderation]"
const moderatedHiddenCommentContent = "[hidden by moderation]"

var (
	// ErrModerationCaseNotFound indicates target moderation case does not exist.
	ErrModerationCaseNotFound = errors.New("moderation case not found")
	// ErrModerationCaseClosed indicates target case has been processed already.
	ErrModerationCaseClosed = errors.New("moderation case is already closed")
)

// CreateModerationCaseInput defines moderation case creation payload.
type CreateModerationCaseInput struct {
	ReporterUserID *uint
	TargetType     models.ModerationTargetType
	SkillID        *uint
	CommentID      *uint
	ReasonCode     string
	ReasonDetail   string
}

// ListModerationCasesInput defines moderation case list filters.
type ListModerationCasesInput struct {
	Status models.ModerationCaseStatus
	Limit  int
}

// ResolveModerationCaseInput defines moderation resolve payload.
type ResolveModerationCaseInput struct {
	ResolverUserID uint
	Action         models.ModerationAction
	ResolutionNote string
}

// RejectModerationCaseInput defines moderation reject payload.
type RejectModerationCaseInput struct {
	ResolverUserID uint
	RejectionNote  string
}

// ModerationService manages moderation cases and review actions.
type ModerationService struct {
	db *gorm.DB
}

// NewModerationService creates moderation service.
func NewModerationService(db *gorm.DB) *ModerationService {
	return &ModerationService{db: db}
}

// CreateCase creates one moderation case from report data.
func (s *ModerationService) CreateCase(ctx context.Context, input CreateModerationCaseInput) (models.ModerationCase, error) {
	targetType, err := normalizeModerationTargetType(input.TargetType)
	if err != nil {
		return models.ModerationCase{}, err
	}
	reasonCode := strings.ToLower(strings.TrimSpace(input.ReasonCode))
	if reasonCode == "" {
		return models.ModerationCase{}, fmt.Errorf("reason code is required")
	}
	reasonDetail := strings.TrimSpace(input.ReasonDetail)
	if len(reasonDetail) > 2048 {
		reasonDetail = reasonDetail[:2048]
	}

	var skillID *uint
	if input.SkillID != nil && *input.SkillID != 0 {
		value := *input.SkillID
		skillID = &value
	}
	var commentID *uint
	if input.CommentID != nil && *input.CommentID != 0 {
		value := *input.CommentID
		commentID = &value
	}

	switch targetType {
	case models.ModerationTargetSkill:
		if skillID == nil {
			return models.ModerationCase{}, fmt.Errorf("skill id is required for skill moderation")
		}
		if err := ensureSkillExists(ctx, s.db, *skillID); err != nil {
			return models.ModerationCase{}, err
		}
	case models.ModerationTargetComment:
		if commentID == nil || skillID == nil {
			return models.ModerationCase{}, fmt.Errorf("skill id and comment id are required for comment moderation")
		}
		if err := ensureCommentBelongsSkill(ctx, s.db, *commentID, *skillID); err != nil {
			return models.ModerationCase{}, err
		}
	}

	item := models.ModerationCase{
		ReporterUserID: normalizeOptionalUserID(input.ReporterUserID),
		TargetType:     targetType,
		SkillID:        skillID,
		CommentID:      commentID,
		ReasonCode:     reasonCode,
		ReasonDetail:   reasonDetail,
		Status:         models.ModerationStatusOpen,
		Action:         models.ModerationActionNone,
	}
	if err := s.db.WithContext(ctx).Create(&item).Error; err != nil {
		return models.ModerationCase{}, fmt.Errorf("failed to create moderation case: %w", err)
	}
	return s.GetCaseByID(ctx, item.ID)
}

// ListCases returns moderation queue items sorted by recency.
func (s *ModerationService) ListCases(ctx context.Context, input ListModerationCasesInput) ([]models.ModerationCase, error) {
	limit := input.Limit
	if limit <= 0 || limit > 500 {
		limit = 120
	}
	query := s.db.WithContext(ctx).Model(&models.ModerationCase{})
	status := strings.ToLower(strings.TrimSpace(string(input.Status)))
	switch status {
	case string(models.ModerationStatusOpen), string(models.ModerationStatusResolved), string(models.ModerationStatusRejected):
		query = query.Where("status = ?", status)
	}

	var cases []models.ModerationCase
	if err := query.
		Preload("ReporterUser").
		Preload("ResolverUser").
		Preload("Skill").
		Preload("Comment").
		Order("created_at DESC").
		Order("id DESC").
		Limit(limit).
		Find(&cases).Error; err != nil {
		return nil, fmt.Errorf("failed to list moderation cases: %w", err)
	}
	return cases, nil
}

// GetCaseByID returns moderation case by id.
func (s *ModerationService) GetCaseByID(ctx context.Context, caseID uint) (models.ModerationCase, error) {
	if caseID == 0 {
		return models.ModerationCase{}, ErrModerationCaseNotFound
	}

	var item models.ModerationCase
	err := s.db.WithContext(ctx).
		Preload("ReporterUser").
		Preload("ResolverUser").
		Preload("Skill").
		Preload("Comment").
		First(&item, caseID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.ModerationCase{}, ErrModerationCaseNotFound
	}
	if err != nil {
		return models.ModerationCase{}, fmt.Errorf("failed to load moderation case: %w", err)
	}
	return item, nil
}

// ResolveCase marks case as resolved and persists moderation action.
func (s *ModerationService) ResolveCase(
	ctx context.Context,
	caseID uint,
	input ResolveModerationCaseInput,
) (models.ModerationCase, error) {
	if input.ResolverUserID == 0 {
		return models.ModerationCase{}, fmt.Errorf("resolver user id is required")
	}
	item, err := s.GetCaseByID(ctx, caseID)
	if err != nil {
		return models.ModerationCase{}, err
	}
	if item.Status != models.ModerationStatusOpen {
		return models.ModerationCase{}, ErrModerationCaseClosed
	}

	action := normalizeModerationAction(input.Action)
	note := strings.TrimSpace(input.ResolutionNote)
	if len(note) > 2048 {
		note = note[:2048]
	}
	resolvedAt := time.Now().UTC()
	resolverID := input.ResolverUserID
	updates := map[string]any{
		"status":           models.ModerationStatusResolved,
		"action":           action,
		"resolution_note":  note,
		"resolver_user_id": resolverID,
		"resolved_at":      resolvedAt,
	}
	if err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := s.applyModerationAction(ctx, tx, item, action); err != nil {
			return err
		}
		if err := tx.Model(&models.ModerationCase{}).
			Where("id = ?", caseID).
			Updates(updates).Error; err != nil {
			return fmt.Errorf("failed to resolve moderation case: %w", err)
		}
		return nil
	}); err != nil {
		return models.ModerationCase{}, err
	}
	return s.GetCaseByID(ctx, caseID)
}

// RejectCase marks case as rejected.
func (s *ModerationService) RejectCase(
	ctx context.Context,
	caseID uint,
	input RejectModerationCaseInput,
) (models.ModerationCase, error) {
	if input.ResolverUserID == 0 {
		return models.ModerationCase{}, fmt.Errorf("resolver user id is required")
	}
	item, err := s.GetCaseByID(ctx, caseID)
	if err != nil {
		return models.ModerationCase{}, err
	}
	if item.Status != models.ModerationStatusOpen {
		return models.ModerationCase{}, ErrModerationCaseClosed
	}

	note := strings.TrimSpace(input.RejectionNote)
	if len(note) > 2048 {
		note = note[:2048]
	}
	resolvedAt := time.Now().UTC()
	resolverID := input.ResolverUserID
	updates := map[string]any{
		"status":           models.ModerationStatusRejected,
		"action":           models.ModerationActionNone,
		"resolution_note":  note,
		"resolver_user_id": resolverID,
		"resolved_at":      resolvedAt,
	}
	if err := s.db.WithContext(ctx).
		Model(&models.ModerationCase{}).
		Where("id = ?", caseID).
		Updates(updates).Error; err != nil {
		return models.ModerationCase{}, fmt.Errorf("failed to reject moderation case: %w", err)
	}
	return s.GetCaseByID(ctx, caseID)
}

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
