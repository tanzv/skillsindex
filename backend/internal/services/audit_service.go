package services

import (
	"context"
	"fmt"
	"strings"
	"time"

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
	RequestID   string
	Result      string
	Reason      string
	SourceIP    string
	Summary     string
	Details     string
}

// ListAuditInput contains optional filters for querying logs.
type ListAuditInput struct {
	ActorUserID uint
	Limit       int
}

// ListAuditByTargetInput contains filters for querying logs by one target.
type ListAuditByTargetInput struct {
	TargetType    string
	TargetID      uint
	CreatedAfter  *time.Time
	CreatedBefore *time.Time
	Limit         int
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

	entry := models.AuditLog{
		ActorUserID: auditActorPointer(input.ActorUserID),
		Action:      action,
		TargetType:  targetType,
		TargetID:    input.TargetID,
		RequestID:   trimAuditField(input.RequestID, 128),
		Result:      normalizeAuditResult(input.Result),
		Reason:      trimAuditField(input.Reason, 256),
		SourceIP:    sanitizeIssuedIP(input.SourceIP),
		Summary:     strings.TrimSpace(input.Summary),
		Details:     strings.TrimSpace(input.Details),
	}
	if err := s.db.WithContext(ctx).Create(&entry).Error; err != nil {
		return fmt.Errorf("failed to create audit log: %w", err)
	}
	return nil
}

func auditActorPointer(actorUserID uint) *uint {
	if actorUserID == 0 {
		return nil
	}
	value := actorUserID
	return &value
}

func auditActorValue(actorUserID *uint) uint {
	if actorUserID == nil {
		return 0
	}
	return *actorUserID
}

func normalizeAuditResult(value string) string {
	result := strings.TrimSpace(strings.ToLower(value))
	if result == "" {
		return ""
	}
	return trimAuditField(result, 32)
}

func trimAuditField(value string, limit int) string {
	trimmed := strings.TrimSpace(value)
	if limit <= 0 || len(trimmed) <= limit {
		return trimmed
	}
	return trimmed[:limit]
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

// ListByTarget returns recent audit logs for one specific target.
func (s *AuditService) ListByTarget(ctx context.Context, input ListAuditByTargetInput) ([]models.AuditLog, error) {
	targetType := strings.TrimSpace(strings.ToLower(input.TargetType))
	if targetType == "" {
		return nil, fmt.Errorf("audit target type is required")
	}
	if input.TargetID == 0 {
		return nil, fmt.Errorf("audit target id is required")
	}

	limit := input.Limit
	if limit <= 0 || limit > 200 {
		limit = 20
	}

	var logs []models.AuditLog
	query := s.db.WithContext(ctx).
		Model(&models.AuditLog{}).
		Where("target_type = ? AND target_id = ?", targetType, input.TargetID)
	if input.CreatedAfter != nil {
		query = query.Where("created_at >= ?", input.CreatedAfter.UTC())
	}
	if input.CreatedBefore != nil {
		query = query.Where("created_at <= ?", input.CreatedBefore.UTC())
	}
	if err := query.
		Preload("ActorUser").
		Order("created_at DESC").
		Order("id DESC").
		Limit(limit).
		Find(&logs).Error; err != nil {
		return nil, fmt.Errorf("failed to list audit logs by target: %w", err)
	}
	return logs, nil
}
