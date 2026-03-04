package services

import (
	"context"
	"fmt"
	"strings"

	"skillsindex/internal/models"

	"gorm.io/gorm"
)

// AuditService handles append-only audit events.
type AuditService struct {
	db *gorm.DB
}

// RecordAuditInput stores parameters for creating an audit event.
type RecordAuditInput struct {
	ActorUserID uint
	Action      string
	TargetType  string
	TargetID    uint
	Summary     string
	Details     string
}

// ListAuditInput contains optional filters for querying logs.
type ListAuditInput struct {
	ActorUserID uint
	Limit       int
}

// NewAuditService creates a new audit service.
func NewAuditService(db *gorm.DB) *AuditService {
	return &AuditService{db: db}
}

// Record inserts an immutable audit event.
func (s *AuditService) Record(ctx context.Context, input RecordAuditInput) error {
	action := strings.TrimSpace(strings.ToLower(input.Action))
	targetType := strings.TrimSpace(strings.ToLower(input.TargetType))
	if action == "" {
		return fmt.Errorf("audit action is required")
	}
	if targetType == "" {
		return fmt.Errorf("audit target type is required")
	}
	if input.ActorUserID == 0 {
		return fmt.Errorf("audit actor user id is required")
	}

	entry := models.AuditLog{
		ActorUserID: input.ActorUserID,
		Action:      action,
		TargetType:  targetType,
		TargetID:    input.TargetID,
		Summary:     strings.TrimSpace(input.Summary),
		Details:     strings.TrimSpace(input.Details),
	}
	if err := s.db.WithContext(ctx).Create(&entry).Error; err != nil {
		return fmt.Errorf("failed to create audit log: %w", err)
	}
	return nil
}

// ListRecent returns recent logs with optional actor filter.
func (s *AuditService) ListRecent(ctx context.Context, input ListAuditInput) ([]models.AuditLog, error) {
	limit := input.Limit
	if limit <= 0 || limit > 200 {
		limit = 50
	}

	query := s.db.WithContext(ctx).Model(&models.AuditLog{})
	if input.ActorUserID > 0 {
		query = query.Where("actor_user_id = ?", input.ActorUserID)
	}

	var logs []models.AuditLog
	if err := query.
		Preload("ActorUser").
		Order("created_at DESC").
		Limit(limit).
		Find(&logs).Error; err != nil {
		return nil, fmt.Errorf("failed to list audit logs: %w", err)
	}
	return logs, nil
}
