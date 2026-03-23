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
	// ErrSyncPolicyNotFound indicates sync policy record is missing.
	ErrSyncPolicyNotFound = errors.New("sync policy not found")
)

// CreateSyncPolicyInput stores fields for creating one sync policy.
type CreateSyncPolicyInput struct {
	PolicyName      string
	TargetScope     string
	SourceType      models.SyncPolicySourceType
	CronExpr        string
	IntervalMinutes int
	TimeoutMinutes  int
	BatchSize       int
	Timezone        string
	Enabled         bool
	MaxRetry        int
	RetryBackoff    string
	CreatedByUserID *uint
}

// UpdateSyncPolicyInput stores partial updates for one sync policy.
type UpdateSyncPolicyInput struct {
	PolicyName      *string
	TargetScope     *string
	SourceType      *models.SyncPolicySourceType
	CronExpr        *string
	IntervalMinutes *int
	TimeoutMinutes  *int
	BatchSize       *int
	Timezone        *string
	Enabled         *bool
	MaxRetry        *int
	RetryBackoff    *string
	UpdatedByUserID *uint
}

// ListSyncPoliciesInput stores filters for policy listing.
type ListSyncPoliciesInput struct {
	SourceType     models.SyncPolicySourceType
	IncludeDeleted bool
	EnabledOnly    bool
	Limit          int
}

// SyncPolicyService manages first-class sync policy records.
type SyncPolicyService struct {
	db *gorm.DB
}

// NewSyncPolicyService creates a new sync policy service.
func NewSyncPolicyService(db *gorm.DB) *SyncPolicyService {
	return &SyncPolicyService{db: db}
}

// Create inserts one sync policy record.
func (s *SyncPolicyService) Create(ctx context.Context, input CreateSyncPolicyInput) (models.SyncPolicy, error) {
	if s == nil || s.db == nil {
		return models.SyncPolicy{}, fmt.Errorf("sync policy service is not initialized")
	}
	item, err := buildSyncPolicyModel(input)
	if err != nil {
		return models.SyncPolicy{}, err
	}
	if err := s.db.WithContext(ctx).Create(&item).Error; err != nil {
		return models.SyncPolicy{}, fmt.Errorf("failed to create sync policy: %w", err)
	}
	return s.GetByID(ctx, item.ID, true)
}

// GetByID returns one sync policy by id.
func (s *SyncPolicyService) GetByID(ctx context.Context, policyID uint, includeDeleted bool) (models.SyncPolicy, error) {
	if s == nil || s.db == nil {
		return models.SyncPolicy{}, fmt.Errorf("sync policy service is not initialized")
	}
	if policyID == 0 {
		return models.SyncPolicy{}, ErrSyncPolicyNotFound
	}
	query := s.db.WithContext(ctx).Model(&models.SyncPolicy{}).Preload("CreatedByUser").Preload("UpdatedByUser")
	if !includeDeleted {
		query = query.Where("deleted_at IS NULL")
	}
	var item models.SyncPolicy
	err := query.First(&item, policyID).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return models.SyncPolicy{}, ErrSyncPolicyNotFound
	}
	if err != nil {
		return models.SyncPolicy{}, fmt.Errorf("failed to load sync policy: %w", err)
	}
	return item, nil
}

// List returns recent sync policy records by filters.
func (s *SyncPolicyService) List(ctx context.Context, input ListSyncPoliciesInput) ([]models.SyncPolicy, error) {
	if s == nil || s.db == nil {
		return nil, fmt.Errorf("sync policy service is not initialized")
	}
	limit := input.Limit
	if limit <= 0 || limit > 500 {
		limit = 120
	}
	query := s.db.WithContext(ctx).Model(&models.SyncPolicy{}).Preload("CreatedByUser").Preload("UpdatedByUser")
	if !input.IncludeDeleted {
		query = query.Where("deleted_at IS NULL")
	}
	if sourceType := normalizeSyncPolicySourceType(input.SourceType); sourceType != "" {
		query = query.Where("source_type = ?", sourceType)
	}
	if input.EnabledOnly {
		query = query.Where("enabled = ?", true)
	}
	var items []models.SyncPolicy
	if err := query.Order("id DESC").Limit(limit).Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list sync policies: %w", err)
	}
	return items, nil
}

// Update applies partial updates to one sync policy.
func (s *SyncPolicyService) Update(ctx context.Context, policyID uint, input UpdateSyncPolicyInput) (models.SyncPolicy, error) {
	if s == nil || s.db == nil {
		return models.SyncPolicy{}, fmt.Errorf("sync policy service is not initialized")
	}
	item, err := s.GetByID(ctx, policyID, true)
	if err != nil {
		return models.SyncPolicy{}, err
	}
	updates := make(map[string]any)
	if input.PolicyName != nil {
		updates["policy_name"] = sanitizeSyncPolicyName(*input.PolicyName)
	}
	if input.TargetScope != nil {
		updates["target_scope"] = sanitizeSyncPolicyTargetScope(*input.TargetScope)
	}
	if input.SourceType != nil {
		sourceType := normalizeSyncPolicySourceType(*input.SourceType)
		if sourceType == "" {
			return models.SyncPolicy{}, fmt.Errorf("sync policy source type is required")
		}
		updates["source_type"] = sourceType
	}
	if input.CronExpr != nil {
		updates["cron_expr"] = strings.TrimSpace(*input.CronExpr)
	}
	if input.IntervalMinutes != nil {
		if *input.IntervalMinutes < 0 {
			return models.SyncPolicy{}, fmt.Errorf("interval minutes must not be negative")
		}
		updates["interval_minutes"] = *input.IntervalMinutes
	}
	if input.TimeoutMinutes != nil {
		if *input.TimeoutMinutes < 0 {
			return models.SyncPolicy{}, fmt.Errorf("timeout minutes must not be negative")
		}
		updates["timeout_minutes"] = *input.TimeoutMinutes
	}
	if input.BatchSize != nil {
		if *input.BatchSize < 0 {
			return models.SyncPolicy{}, fmt.Errorf("batch size must not be negative")
		}
		updates["batch_size"] = *input.BatchSize
	}
	if input.Timezone != nil {
		updates["timezone"] = sanitizeSyncPolicyTimezone(*input.Timezone)
	}
	if input.Enabled != nil {
		updates["enabled"] = *input.Enabled
	}
	if input.MaxRetry != nil {
		if *input.MaxRetry < 0 {
			return models.SyncPolicy{}, fmt.Errorf("max retry must not be negative")
		}
		updates["max_retry"] = *input.MaxRetry
	}
	if input.RetryBackoff != nil {
		updates["retry_backoff"] = strings.TrimSpace(*input.RetryBackoff)
	}
	if input.UpdatedByUserID != nil {
		updates["updated_by_user_id"] = input.UpdatedByUserID
	}
	if len(updates) == 0 {
		return item, nil
	}
	if value, ok := updates["policy_name"].(string); ok && value == "" {
		return models.SyncPolicy{}, fmt.Errorf("sync policy name is required")
	}
	if value, ok := updates["target_scope"].(string); ok && value == "" {
		return models.SyncPolicy{}, fmt.Errorf("sync policy target scope is required")
	}
	if value, ok := updates["timezone"].(string); ok && value == "" {
		return models.SyncPolicy{}, fmt.Errorf("sync policy timezone is required")
	}
	if err := s.db.WithContext(ctx).Model(&models.SyncPolicy{}).Where("id = ?", policyID).Updates(updates).Error; err != nil {
		return models.SyncPolicy{}, fmt.Errorf("failed to update sync policy: %w", err)
	}
	return s.GetByID(ctx, policyID, true)
}

// Toggle updates the enabled state of one sync policy.
func (s *SyncPolicyService) Toggle(ctx context.Context, policyID uint, enabled bool, actorUserID *uint) (models.SyncPolicy, error) {
	return s.Update(ctx, policyID, UpdateSyncPolicyInput{
		Enabled:         &enabled,
		UpdatedByUserID: actorUserID,
	})
}

// SoftDelete marks one sync policy as deleted and disables it.
func (s *SyncPolicyService) SoftDelete(ctx context.Context, policyID uint, actorUserID *uint) (models.SyncPolicy, error) {
	if s == nil || s.db == nil {
		return models.SyncPolicy{}, fmt.Errorf("sync policy service is not initialized")
	}
	if _, err := s.GetByID(ctx, policyID, true); err != nil {
		return models.SyncPolicy{}, err
	}
	updates := map[string]any{
		"enabled": false,
	}
	if actorUserID != nil {
		updates["updated_by_user_id"] = actorUserID
	}
	if err := s.db.WithContext(ctx).Model(&models.SyncPolicy{}).Where("id = ?", policyID).Updates(updates).Error; err != nil {
		return models.SyncPolicy{}, fmt.Errorf("failed to disable sync policy: %w", err)
	}
	if err := s.db.WithContext(ctx).Model(&models.SyncPolicy{}).Where("id = ?", policyID).Update("deleted_at", gorm.Expr("CURRENT_TIMESTAMP")).Error; err != nil {
		return models.SyncPolicy{}, fmt.Errorf("failed to soft delete sync policy: %w", err)
	}
	return s.GetByID(ctx, policyID, true)
}

func buildSyncPolicyModel(input CreateSyncPolicyInput) (models.SyncPolicy, error) {
	sourceType := normalizeSyncPolicySourceType(input.SourceType)
	if sourceType == "" {
		return models.SyncPolicy{}, fmt.Errorf("sync policy source type is required")
	}
	item := models.SyncPolicy{
		PolicyName:      sanitizeSyncPolicyName(input.PolicyName),
		TargetScope:     sanitizeSyncPolicyTargetScope(input.TargetScope),
		SourceType:      sourceType,
		CronExpr:        strings.TrimSpace(input.CronExpr),
		IntervalMinutes: input.IntervalMinutes,
		TimeoutMinutes:  input.TimeoutMinutes,
		BatchSize:       input.BatchSize,
		Timezone:        sanitizeSyncPolicyTimezone(input.Timezone),
		Enabled:         input.Enabled,
		MaxRetry:        normalizeSyncPolicyRetry(input.MaxRetry),
		RetryBackoff:    strings.TrimSpace(input.RetryBackoff),
		CreatedByUserID: input.CreatedByUserID,
		UpdatedByUserID: input.CreatedByUserID,
	}
	if item.PolicyName == "" {
		return models.SyncPolicy{}, fmt.Errorf("sync policy name is required")
	}
	if item.TargetScope == "" {
		return models.SyncPolicy{}, fmt.Errorf("sync policy target scope is required")
	}
	if item.Timezone == "" {
		return models.SyncPolicy{}, fmt.Errorf("sync policy timezone is required")
	}
	if item.IntervalMinutes < 0 {
		return models.SyncPolicy{}, fmt.Errorf("interval minutes must not be negative")
	}
	if item.TimeoutMinutes < 0 {
		return models.SyncPolicy{}, fmt.Errorf("timeout minutes must not be negative")
	}
	if item.BatchSize < 0 {
		return models.SyncPolicy{}, fmt.Errorf("batch size must not be negative")
	}
	return item, nil
}

func normalizeSyncPolicySourceType(value models.SyncPolicySourceType) models.SyncPolicySourceType {
	switch models.SyncPolicySourceType(strings.ToLower(strings.TrimSpace(string(value)))) {
	case models.SyncPolicySourceRepository:
		return models.SyncPolicySourceRepository
	case models.SyncPolicySourceSkillMP:
		return models.SyncPolicySourceSkillMP
	default:
		return ""
	}
}

func sanitizeSyncPolicyName(value string) string {
	clean := strings.TrimSpace(value)
	if len(clean) > 128 {
		return clean[:128]
	}
	return clean
}

func sanitizeSyncPolicyTargetScope(value string) string {
	clean := strings.TrimSpace(value)
	if len(clean) > 256 {
		return clean[:256]
	}
	return clean
}

func sanitizeSyncPolicyTimezone(value string) string {
	clean := strings.TrimSpace(value)
	if clean == "" {
		return "UTC"
	}
	if len(clean) > 64 {
		return clean[:64]
	}
	return clean
}

func normalizeSyncPolicyRetry(value int) int {
	if value < 0 {
		return 0
	}
	return value
}
