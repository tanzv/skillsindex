package services

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"skillsindex/internal/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

const (
	// SettingAllowRegistration controls whether self-registration is enabled.
	SettingAllowRegistration = "allow_registration"
	// SettingMarketplacePublicAccess controls whether marketplace routes can be accessed anonymously.
	SettingMarketplacePublicAccess = "marketplace_public_access"
	// SettingMarketplaceRankingDefaultSort controls the default public rankings sort.
	SettingMarketplaceRankingDefaultSort = "marketplace_ranking_default_sort"
	// SettingMarketplaceRankingLimit controls the number of ranked items returned by the public rankings endpoint.
	SettingMarketplaceRankingLimit = "marketplace_ranking_limit"
	// SettingMarketplaceRankingHighlightLimit controls the number of highlight cards in the public rankings payload.
	SettingMarketplaceRankingHighlightLimit = "marketplace_ranking_highlight_limit"
	// SettingMarketplaceRankingCategoryLeaderLimit controls the number of category leader cards in the public rankings payload.
	SettingMarketplaceRankingCategoryLeaderLimit = "marketplace_ranking_category_leader_limit"
	// SettingMarketplaceCategoryCatalog stores the mutable marketplace category catalog definition payload.
	SettingMarketplaceCategoryCatalog = "marketplace_category_catalog"
	// SettingAuthEnabledProviders controls which third-party auth providers are visible on auth pages.
	SettingAuthEnabledProviders = "auth_enabled_providers"
	// SettingUserCenterPermissionOverrides stores per-user permissions for user center operations.
	SettingUserCenterPermissionOverrides = "user_center_permission_overrides"
)

// SettingsService manages mutable system-level settings stored in database.
type SettingsService struct {
	db *gorm.DB
}

// NewSettingsService creates a settings service instance.
func NewSettingsService(db *gorm.DB) *SettingsService {
	return &SettingsService{db: db}
}

// Get returns setting value by key, falling back to defaultValue when missing.
func (s *SettingsService) Get(ctx context.Context, key string, defaultValue string) (string, error) {
	cleanKey, err := normalizeSettingKey(key)
	if err != nil {
		return "", err
	}

	var setting models.SystemSetting
	err = s.db.WithContext(ctx).First(&setting, "key = ?", cleanKey).Error
	if err == nil {
		return strings.TrimSpace(setting.Value), nil
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return strings.TrimSpace(defaultValue), nil
	}
	return "", fmt.Errorf("failed to load system setting: %w", err)
}

// Set upserts one setting value by key.
func (s *SettingsService) Set(ctx context.Context, key string, value string) error {
	cleanKey, err := normalizeSettingKey(key)
	if err != nil {
		return err
	}
	item := models.SystemSetting{
		Key:   cleanKey,
		Value: strings.TrimSpace(value),
	}
	if err := s.db.WithContext(ctx).
		Clauses(clause.OnConflict{
			Columns:   []clause.Column{{Name: "key"}},
			DoUpdates: clause.AssignmentColumns([]string{"value", "updated_at"}),
		}).
		Create(&item).Error; err != nil {
		return fmt.Errorf("failed to persist system setting: %w", err)
	}
	return nil
}

// Ensure initializes one setting only if it is not present.
func (s *SettingsService) Ensure(ctx context.Context, key string, defaultValue string) (string, error) {
	cleanKey, err := normalizeSettingKey(key)
	if err != nil {
		return "", err
	}

	var setting models.SystemSetting
	queryErr := s.db.WithContext(ctx).First(&setting, "key = ?", cleanKey).Error
	if queryErr == nil {
		return strings.TrimSpace(setting.Value), nil
	}
	if !errors.Is(queryErr, gorm.ErrRecordNotFound) {
		return "", fmt.Errorf("failed to query system setting: %w", queryErr)
	}

	value := strings.TrimSpace(defaultValue)
	if err := s.Set(ctx, cleanKey, value); err != nil {
		return "", err
	}
	return value, nil
}

// EnsureBool initializes a boolean setting only if not present.
func (s *SettingsService) EnsureBool(ctx context.Context, key string, defaultValue bool) (bool, error) {
	cleanKey, err := normalizeSettingKey(key)
	if err != nil {
		return false, err
	}

	var setting models.SystemSetting
	queryErr := s.db.WithContext(ctx).First(&setting, "key = ?", cleanKey).Error
	if queryErr == nil {
		parsed, _ := parseSettingBool(setting.Value, defaultValue)
		return parsed, nil
	}
	if !errors.Is(queryErr, gorm.ErrRecordNotFound) {
		return false, fmt.Errorf("failed to query system setting: %w", queryErr)
	}

	value := formatSettingBool(defaultValue)
	if err := s.Set(ctx, cleanKey, value); err != nil {
		return false, err
	}
	return defaultValue, nil
}

// GetBool returns setting value as boolean, falling back when invalid or missing.
func (s *SettingsService) GetBool(ctx context.Context, key string, defaultValue bool) (bool, error) {
	raw, err := s.Get(ctx, key, formatSettingBool(defaultValue))
	if err != nil {
		return defaultValue, err
	}
	parsed, _ := parseSettingBool(raw, defaultValue)
	return parsed, nil
}

// SetBool persists a boolean setting value.
func (s *SettingsService) SetBool(ctx context.Context, key string, value bool) error {
	return s.Set(ctx, key, formatSettingBool(value))
}

// EnsureInt initializes an integer setting only if not present.
func (s *SettingsService) EnsureInt(ctx context.Context, key string, defaultValue int) (int, error) {
	cleanKey, err := normalizeSettingKey(key)
	if err != nil {
		return 0, err
	}

	var setting models.SystemSetting
	queryErr := s.db.WithContext(ctx).First(&setting, "key = ?", cleanKey).Error
	if queryErr == nil {
		parsed, _ := parseSettingInt(setting.Value, defaultValue)
		return parsed, nil
	}
	if !errors.Is(queryErr, gorm.ErrRecordNotFound) {
		return 0, fmt.Errorf("failed to query system setting: %w", queryErr)
	}

	value := formatSettingInt(defaultValue)
	if err := s.Set(ctx, cleanKey, value); err != nil {
		return 0, err
	}
	return defaultValue, nil
}

// GetInt returns setting value as integer, falling back when invalid or missing.
func (s *SettingsService) GetInt(ctx context.Context, key string, defaultValue int) (int, error) {
	raw, err := s.Get(ctx, key, formatSettingInt(defaultValue))
	if err != nil {
		return defaultValue, err
	}
	parsed, _ := parseSettingInt(raw, defaultValue)
	return parsed, nil
}

// SetInt persists an integer setting value.
func (s *SettingsService) SetInt(ctx context.Context, key string, value int) error {
	return s.Set(ctx, key, formatSettingInt(value))
}

func normalizeSettingKey(key string) (string, error) {
	clean := strings.ToLower(strings.TrimSpace(key))
	if clean == "" {
		return "", fmt.Errorf("setting key is required")
	}
	if len(clean) > 128 {
		return "", fmt.Errorf("setting key is too long")
	}
	return clean, nil
}

func formatSettingBool(value bool) string {
	if value {
		return "true"
	}
	return "false"
}

func formatSettingInt(value int) string {
	return strconv.Itoa(value)
}

func parseSettingBool(raw string, defaultValue bool) (bool, bool) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "1", "true", "yes", "on", "enabled":
		return true, true
	case "0", "false", "no", "off", "disabled":
		return false, true
	default:
		return defaultValue, false
	}
}

func parseSettingInt(raw string, defaultValue int) (int, bool) {
	clean := strings.TrimSpace(raw)
	if clean == "" {
		return defaultValue, false
	}
	value, err := strconv.Atoi(clean)
	if err != nil {
		return defaultValue, false
	}
	return value, true
}
