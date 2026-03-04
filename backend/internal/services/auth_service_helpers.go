package services

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"strings"
	"time"

	"skillsindex/internal/models"
)

func normalizeOAuthUsername(raw string) string {
	raw = strings.ToLower(strings.TrimSpace(raw))
	var b strings.Builder
	for _, r := range raw {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '_' || r == '-' {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func normalizeUserStatus(value models.UserStatus) models.UserStatus {
	switch strings.ToLower(strings.TrimSpace(string(value))) {
	case string(models.UserStatusDisabled):
		return models.UserStatusDisabled
	default:
		return models.UserStatusActive
	}
}

func generateRandomPassword() (string, error) {
	buf := make([]byte, 24)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func generatePasswordResetToken() (string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

func hashPasswordResetToken(token string) string {
	sum := sha256.Sum256([]byte(strings.TrimSpace(token)))
	return hex.EncodeToString(sum[:])
}

func containsControlCharacters(value string) bool {
	for _, r := range value {
		if r < 32 {
			return true
		}
	}
	return false
}

func sanitizeIssuedIP(value string) string {
	clean := strings.TrimSpace(value)
	if len(clean) > 64 {
		return clean[:64]
	}
	return clean
}

func (s *AuthService) passwordResetRateLimited(ctx context.Context, userID *uint, issuedIP string) (bool, error) {
	windowStart := time.Now().UTC().Add(-passwordResetRateLimitWindow)

	query := s.db.WithContext(ctx).
		Model(&models.PasswordResetToken{}).
		Where("issued_ip = ? AND created_at >= ?", issuedIP, windowStart)
	if userID != nil {
		query = query.Where("user_id = ?", *userID)
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return false, fmt.Errorf("failed to evaluate password reset rate limit: %w", err)
	}
	if userID != nil {
		return total >= passwordResetRateLimitPerUser, nil
	}
	return total >= passwordResetRateLimitPerIP, nil
}
