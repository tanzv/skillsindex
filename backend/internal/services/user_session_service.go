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

var (
	// ErrUserSessionNotFound indicates the target session does not exist for the account.
	ErrUserSessionNotFound = errors.New("user session not found")
)

// CreateUserSessionInput defines persisted session attributes.
type CreateUserSessionInput struct {
	UserID     uint
	SessionID  string
	UserAgent  string
	IssuedIP   string
	ExpiresAt  time.Time
	LastSeenAt time.Time
}

// UserSessionService manages persisted account sessions.
type UserSessionService struct {
	db *gorm.DB
}

// NewUserSessionService creates a session service bound to database.
func NewUserSessionService(db *gorm.DB) *UserSessionService {
	return &UserSessionService{db: db}
}

// CreateSession inserts or replaces one session record for current user.
func (s *UserSessionService) CreateSession(ctx context.Context, input CreateUserSessionInput) (models.UserSession, error) {
	sessionID := strings.TrimSpace(input.SessionID)
	if input.UserID == 0 || sessionID == "" {
		return models.UserSession{}, fmt.Errorf("user id and session id are required")
	}

	lastSeen := input.LastSeenAt.UTC()
	if lastSeen.IsZero() {
		lastSeen = time.Now().UTC()
	}
	expiresAt := input.ExpiresAt.UTC()
	if expiresAt.IsZero() {
		expiresAt = lastSeen.Add(24 * time.Hour)
	}

	record := models.UserSession{
		UserID:     input.UserID,
		SessionID:  sessionID,
		UserAgent:  strings.TrimSpace(input.UserAgent),
		IssuedIP:   sanitizeSessionIssuedIP(input.IssuedIP),
		ExpiresAt:  expiresAt,
		LastSeenAt: lastSeen,
	}
	if err := s.db.WithContext(ctx).Where("session_id = ?", sessionID).Delete(&models.UserSession{}).Error; err != nil {
		return models.UserSession{}, fmt.Errorf("failed to cleanup duplicated session id: %w", err)
	}
	if err := s.db.WithContext(ctx).Create(&record).Error; err != nil {
		return models.UserSession{}, fmt.Errorf("failed to create user session: %w", err)
	}
	return record, nil
}

// ValidateSession verifies the session belongs to user, not revoked, and not expired.
func (s *UserSessionService) ValidateSession(ctx context.Context, userID uint, sessionID string, now time.Time) (bool, error) {
	sessionID = strings.TrimSpace(sessionID)
	if userID == 0 || sessionID == "" {
		return false, nil
	}
	pointInTime := now.UTC()
	if pointInTime.IsZero() {
		pointInTime = time.Now().UTC()
	}

	var total int64
	if err := s.db.WithContext(ctx).Model(&models.UserSession{}).
		Where("user_id = ? AND session_id = ? AND revoked_at IS NULL AND expires_at > ?", userID, sessionID, pointInTime).
		Count(&total).Error; err != nil {
		return false, fmt.Errorf("failed to validate user session: %w", err)
	}
	return total > 0, nil
}

// TouchSession updates last seen timestamp for one active session.
func (s *UserSessionService) TouchSession(ctx context.Context, sessionID string, seenAt time.Time) error {
	sessionID = strings.TrimSpace(sessionID)
	if sessionID == "" {
		return nil
	}
	pointInTime := seenAt.UTC()
	if pointInTime.IsZero() {
		pointInTime = time.Now().UTC()
	}
	if err := s.db.WithContext(ctx).Model(&models.UserSession{}).
		Where("session_id = ? AND revoked_at IS NULL", sessionID).
		Update("last_seen_at", pointInTime).Error; err != nil {
		return fmt.Errorf("failed to touch user session: %w", err)
	}
	return nil
}

// ListActiveSessions returns non-revoked and non-expired sessions for account.
func (s *UserSessionService) ListActiveSessions(ctx context.Context, userID uint, now time.Time, limit int) ([]models.UserSession, error) {
	if userID == 0 {
		return []models.UserSession{}, nil
	}
	if limit <= 0 {
		limit = 30
	}
	if limit > 200 {
		limit = 200
	}
	pointInTime := now.UTC()
	if pointInTime.IsZero() {
		pointInTime = time.Now().UTC()
	}

	items := make([]models.UserSession, 0)
	if err := s.db.WithContext(ctx).
		Where("user_id = ? AND revoked_at IS NULL AND expires_at > ?", userID, pointInTime).
		Order("last_seen_at DESC, created_at DESC").
		Limit(limit).
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list active sessions: %w", err)
	}
	return items, nil
}

// RevokeSession revokes one session for account.
func (s *UserSessionService) RevokeSession(ctx context.Context, userID uint, sessionID string) error {
	sessionID = strings.TrimSpace(sessionID)
	if userID == 0 || sessionID == "" {
		return ErrUserSessionNotFound
	}
	now := time.Now().UTC()
	result := s.db.WithContext(ctx).Model(&models.UserSession{}).
		Where("user_id = ? AND session_id = ? AND revoked_at IS NULL", userID, sessionID).
		Update("revoked_at", &now)
	if result.Error != nil {
		return fmt.Errorf("failed to revoke user session: %w", result.Error)
	}
	if result.RowsAffected == 0 {
		return ErrUserSessionNotFound
	}
	return nil
}

// RevokeOtherSessions revokes all active sessions except current session id.
func (s *UserSessionService) RevokeOtherSessions(ctx context.Context, userID uint, currentSessionID string) (int64, error) {
	if userID == 0 {
		return 0, nil
	}
	now := time.Now().UTC()
	query := s.db.WithContext(ctx).Model(&models.UserSession{}).
		Where("user_id = ? AND revoked_at IS NULL", userID)

	current := strings.TrimSpace(currentSessionID)
	if current != "" {
		query = query.Where("session_id <> ?", current)
	}

	result := query.Update("revoked_at", &now)
	if result.Error != nil {
		return 0, fmt.Errorf("failed to revoke other user sessions: %w", result.Error)
	}
	return result.RowsAffected, nil
}

func sanitizeSessionIssuedIP(value string) string {
	clean := strings.TrimSpace(value)
	if len(clean) > 64 {
		return clean[:64]
	}
	return clean
}
