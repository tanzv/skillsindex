package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"
)

// ListUsersInput defines optional admin account list filters.
type ListUsersInput struct {
	Query  string
	Role   *models.UserRole
	Status *models.UserStatus
}

// AdminAccountSummary captures one admin account row with session governance metrics.
type AdminAccountSummary struct {
	User               models.User
	LastSeenAt         *time.Time
	ActiveSessionCount int
}

type adminAccountSessionAggregate struct {
	UserID             uint
	ActiveSessionCount int64
	LastSeenAt         string
}

// ListUsersWithInput lists accounts for admin governance with optional filters and session aggregates.
func (s *AuthService) ListUsersWithInput(ctx context.Context, input ListUsersInput) ([]AdminAccountSummary, error) {
	query := s.db.WithContext(ctx).Model(&models.User{})

	searchQuery := strings.ToLower(strings.TrimSpace(input.Query))
	if searchQuery != "" {
		query = query.Where("LOWER(username) LIKE ?", "%"+searchQuery+"%")
	}
	if input.Role != nil {
		query = query.Where("role = ?", models.NormalizeUserRole(string(*input.Role)))
	}
	if input.Status != nil {
		query = query.Where("status = ?", normalizeUserStatus(*input.Status))
	}

	users := make([]models.User, 0)
	if err := query.Order("created_at ASC").Find(&users).Error; err != nil {
		return nil, fmt.Errorf("failed to list users with filters: %w", err)
	}
	if len(users) == 0 {
		return []AdminAccountSummary{}, nil
	}

	userIDs := make([]uint, 0, len(users))
	for _, user := range users {
		userIDs = append(userIDs, user.ID)
	}

	aggregates := make([]adminAccountSessionAggregate, 0)
	now := time.Now().UTC()
	if err := s.db.WithContext(ctx).
		Model(&models.UserSession{}).
		Select("user_id, COUNT(*) AS active_session_count, MAX(last_seen_at) AS last_seen_at").
		Where("user_id IN ? AND revoked_at IS NULL AND expires_at > ?", userIDs, now).
		Group("user_id").
		Scan(&aggregates).Error; err != nil {
		return nil, fmt.Errorf("failed to aggregate active sessions: %w", err)
	}

	aggregateByUserID := make(map[uint]adminAccountSessionAggregate, len(aggregates))
	for _, aggregate := range aggregates {
		aggregateByUserID[aggregate.UserID] = aggregate
	}

	result := make([]AdminAccountSummary, 0, len(users))
	for _, user := range users {
		summary := AdminAccountSummary{User: user}
		if aggregate, ok := aggregateByUserID[user.ID]; ok {
			summary.ActiveSessionCount = int(aggregate.ActiveSessionCount)
			summary.LastSeenAt = parseAggregatedSessionTime(aggregate.LastSeenAt)
		}
		result = append(result, summary)
	}
	return result, nil
}

func parseAggregatedSessionTime(raw string) *time.Time {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return nil
	}
	for _, layout := range []string{
		time.RFC3339Nano,
		"2006-01-02 15:04:05.999999999-07:00",
		"2006-01-02 15:04:05.999999999",
		"2006-01-02 15:04:05",
	} {
		parsed, err := time.Parse(layout, trimmed)
		if err == nil {
			value := parsed.UTC()
			return &value
		}
	}
	return nil
}
