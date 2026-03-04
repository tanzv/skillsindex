package services

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"
)

const (
	// SettingRepoSyncEnabled controls scheduler enablement.
	SettingRepoSyncEnabled = "repo_sync_enabled"
	// SettingRepoSyncInterval controls scheduler due interval.
	SettingRepoSyncInterval = "repo_sync_interval"
	// SettingRepoSyncTimeout controls timeout per scheduler run.
	SettingRepoSyncTimeout = "repo_sync_timeout"
	// SettingRepoSyncBatchSize controls max synced skills per run.
	SettingRepoSyncBatchSize = "repo_sync_batch_size"
)

// RepositorySyncPolicy stores periodic sync execution policy.
type RepositorySyncPolicy struct {
	Enabled   bool          `json:"enabled"`
	Interval  time.Duration `json:"interval"`
	Timeout   time.Duration `json:"timeout"`
	BatchSize int           `json:"batch_size"`
}

// UpdateRepositorySyncPolicyInput stores partial policy updates.
type UpdateRepositorySyncPolicyInput struct {
	Enabled   *bool
	Interval  *time.Duration
	Timeout   *time.Duration
	BatchSize *int
}

// RepositorySyncPolicyService manages sync policy persistence in system settings.
type RepositorySyncPolicyService struct {
	settings *SettingsService
	defaults RepositorySyncPolicy
}

// NewRepositorySyncPolicyService creates a policy service.
func NewRepositorySyncPolicyService(settings *SettingsService, defaults RepositorySyncPolicy) *RepositorySyncPolicyService {
	return &RepositorySyncPolicyService{
		settings: settings,
		defaults: normalizeRepositorySyncPolicy(defaults),
	}
}

// Ensure initializes policy settings if they do not exist.
func (s *RepositorySyncPolicyService) Ensure(ctx context.Context) (RepositorySyncPolicy, error) {
	if s == nil || s.settings == nil {
		return RepositorySyncPolicy{}, fmt.Errorf("repository sync policy service is not initialized")
	}
	defaults := normalizeRepositorySyncPolicy(s.defaults)

	enabled, err := s.settings.EnsureBool(ctx, SettingRepoSyncEnabled, defaults.Enabled)
	if err != nil {
		return RepositorySyncPolicy{}, err
	}
	intervalRaw, err := s.settings.Ensure(ctx, SettingRepoSyncInterval, defaults.Interval.String())
	if err != nil {
		return RepositorySyncPolicy{}, err
	}
	timeoutRaw, err := s.settings.Ensure(ctx, SettingRepoSyncTimeout, defaults.Timeout.String())
	if err != nil {
		return RepositorySyncPolicy{}, err
	}
	batchRaw, err := s.settings.Ensure(ctx, SettingRepoSyncBatchSize, strconv.Itoa(defaults.BatchSize))
	if err != nil {
		return RepositorySyncPolicy{}, err
	}

	return RepositorySyncPolicy{
		Enabled:   enabled,
		Interval:  parsePolicyDuration(intervalRaw, defaults.Interval),
		Timeout:   parsePolicyDuration(timeoutRaw, defaults.Timeout),
		BatchSize: parsePolicyBatchSize(batchRaw, defaults.BatchSize),
	}, nil
}

// Get returns current persisted repository sync policy.
func (s *RepositorySyncPolicyService) Get(ctx context.Context) (RepositorySyncPolicy, error) {
	if s == nil || s.settings == nil {
		return RepositorySyncPolicy{}, fmt.Errorf("repository sync policy service is not initialized")
	}
	defaults := normalizeRepositorySyncPolicy(s.defaults)

	enabled, err := s.settings.GetBool(ctx, SettingRepoSyncEnabled, defaults.Enabled)
	if err != nil {
		return RepositorySyncPolicy{}, err
	}
	intervalRaw, err := s.settings.Get(ctx, SettingRepoSyncInterval, defaults.Interval.String())
	if err != nil {
		return RepositorySyncPolicy{}, err
	}
	timeoutRaw, err := s.settings.Get(ctx, SettingRepoSyncTimeout, defaults.Timeout.String())
	if err != nil {
		return RepositorySyncPolicy{}, err
	}
	batchRaw, err := s.settings.Get(ctx, SettingRepoSyncBatchSize, strconv.Itoa(defaults.BatchSize))
	if err != nil {
		return RepositorySyncPolicy{}, err
	}

	return RepositorySyncPolicy{
		Enabled:   enabled,
		Interval:  parsePolicyDuration(intervalRaw, defaults.Interval),
		Timeout:   parsePolicyDuration(timeoutRaw, defaults.Timeout),
		BatchSize: parsePolicyBatchSize(batchRaw, defaults.BatchSize),
	}, nil
}

// Update applies partial updates and returns current policy.
func (s *RepositorySyncPolicyService) Update(ctx context.Context, input UpdateRepositorySyncPolicyInput) (RepositorySyncPolicy, error) {
	if s == nil || s.settings == nil {
		return RepositorySyncPolicy{}, fmt.Errorf("repository sync policy service is not initialized")
	}
	current, err := s.Get(ctx)
	if err != nil {
		return RepositorySyncPolicy{}, err
	}

	if input.Enabled != nil {
		value := *input.Enabled
		if err := s.settings.SetBool(ctx, SettingRepoSyncEnabled, value); err != nil {
			return RepositorySyncPolicy{}, err
		}
		current.Enabled = value
	}
	if input.Interval != nil {
		value := *input.Interval
		if value <= 0 {
			return RepositorySyncPolicy{}, fmt.Errorf("interval must be positive")
		}
		if err := s.settings.Set(ctx, SettingRepoSyncInterval, value.String()); err != nil {
			return RepositorySyncPolicy{}, err
		}
		current.Interval = value
	}
	if input.Timeout != nil {
		value := *input.Timeout
		if value <= 0 {
			return RepositorySyncPolicy{}, fmt.Errorf("timeout must be positive")
		}
		if err := s.settings.Set(ctx, SettingRepoSyncTimeout, value.String()); err != nil {
			return RepositorySyncPolicy{}, err
		}
		current.Timeout = value
	}
	if input.BatchSize != nil {
		value := *input.BatchSize
		if value <= 0 {
			return RepositorySyncPolicy{}, fmt.Errorf("batch size must be positive")
		}
		if err := s.settings.Set(ctx, SettingRepoSyncBatchSize, strconv.Itoa(value)); err != nil {
			return RepositorySyncPolicy{}, err
		}
		current.BatchSize = value
	}

	return current, nil
}

func normalizeRepositorySyncPolicy(policy RepositorySyncPolicy) RepositorySyncPolicy {
	if policy.Interval <= 0 {
		policy.Interval = 30 * time.Minute
	}
	if policy.Timeout <= 0 {
		policy.Timeout = 10 * time.Minute
	}
	if policy.BatchSize <= 0 {
		policy.BatchSize = 20
	}
	return policy
}

func parsePolicyDuration(raw string, fallback time.Duration) time.Duration {
	clean := strings.TrimSpace(raw)
	if clean == "" {
		return fallback
	}
	value, err := time.ParseDuration(clean)
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}

func parsePolicyBatchSize(raw string, fallback int) int {
	clean := strings.TrimSpace(raw)
	if clean == "" {
		return fallback
	}
	value, err := strconv.Atoi(clean)
	if err != nil || value <= 0 {
		return fallback
	}
	return value
}
